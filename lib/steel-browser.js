import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import net from "node:net";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_STEEL_URL = "http://127.0.0.1:3000";
const STEEL_CONTAINER = "specsrelay-steel-browser";
const STEEL_IMAGE = "ghcr.io/steel-dev/steel-browser-api:latest";
const STEEL_PROFILE_VOLUME = "specsrelay-steel-profile";
const DEEPSEEK_URL = "https://chat.deepseek.com/";
const START_TIMEOUT_MS = 600000;
const HEALTH_TIMEOUT_MS = 90000;
const CDP_TIMEOUT_MS = 90000;

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function loopbackUrl(value) {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "::1"].includes(parsed.hostname)
  ) {
    throw new Error("Steel Browser must use a local HTTP address.");
  }
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";
  return parsed;
}

function dockerEnvironment(env) {
  const allowed = [
    "PATH",
    "HOME",
    "USER",
    "LOGNAME",
    "TMPDIR",
    "DOCKER_HOST",
    "DOCKER_CONTEXT",
    "DOCKER_CERT_PATH",
    "DOCKER_TLS_VERIFY"
  ];
  return Object.fromEntries(
    allowed.flatMap((name) =>
      typeof env[name] === "string" ? [[name, env[name]]] : []
    )
  );
}

async function runDocker(args, { env = process.env, timeout = START_TIMEOUT_MS } = {}) {
  return execFileAsync("docker", args, {
    encoding: "utf8",
    env: dockerEnvironment(env),
    maxBuffer: 1024 * 1024,
    timeout
  });
}

async function startManagedSteel({ env = process.env } = {}) {
  let inspected = null;
  try {
    inspected = await runDocker(
      ["inspect", "--format", "{{.State.Running}}", STEEL_CONTAINER],
      { env, timeout: 15000 }
    );
  } catch (error) {
    const text = `${error?.stderr ?? ""}\n${error?.message ?? ""}`;
    if (!/No such (object|container)/i.test(text)) throw error;
  }
  if (inspected?.stdout.trim() === "true") return;
  if (inspected) {
    await runDocker(["start", STEEL_CONTAINER], { env });
    return;
  }
  await runDocker(
    [
      "run",
      "--detach",
      "--name",
      STEEL_CONTAINER,
      "--restart",
      "unless-stopped",
      "--publish",
      "127.0.0.1:3000:3000",
      "--volume",
      `${STEEL_PROFILE_VOLUME}:/app/api/user-data-dir`,
      STEEL_IMAGE
    ],
    { env }
  );
}

function normalizeWebSocketUrl(value, steelUrl) {
  const socketUrl = new URL(value);
  socketUrl.hostname = steelUrl.hostname;
  socketUrl.port = steelUrl.port;
  socketUrl.protocol = steelUrl.protocol === "https:" ? "wss:" : "ws:";
  return socketUrl.href;
}

class CdpConnection {
  constructor(url, WebSocketImpl) {
    this.socket = new WebSocketImpl(url);
    this.pending = new Map();
    this.nextId = 1;
  }

  async open() {
    await new Promise((resolve, reject) => {
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Unable to connect to the local browser session."));
      };
      const cleanup = () => {
        this.socket.removeEventListener("open", onOpen);
        this.socket.removeEventListener("error", onError);
      };
      this.socket.addEventListener("open", onOpen);
      this.socket.addEventListener("error", onError);
    });
    this.socket.addEventListener("message", (event) => {
      let value;
      try {
        value = JSON.parse(
          typeof event.data === "string"
            ? event.data
            : Buffer.from(event.data).toString("utf8")
        );
      } catch {
        return;
      }
      if (!Number.isInteger(value.id)) return;
      const pending = this.pending.get(value.id);
      if (!pending) return;
      this.pending.delete(value.id);
      clearTimeout(pending.timeoutId);
      if (value.error) {
        pending.reject(new Error(value.error.message || "Browser command failed."));
      } else {
        pending.resolve(value.result ?? {});
      }
    });
    this.socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error("The local browser session closed."));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Browser command timed out: ${method}`));
      }, CDP_TIMEOUT_MS);
      this.pending.set(id, { resolve, reject, timeoutId });
      this.socket.send(
        JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })
      );
    });
  }

  close() {
    this.socket.close();
  }
}

const CAPTURE_EXPRESSION = String.raw`(async () => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalize = (value) => String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  const root = document.querySelector(".ds-virtual-list.ds-virtual-list--printable")
    || document.querySelector(".ds-virtual-list")
    || document.querySelector("main")
    || document.body;
  let scroller = document.querySelector(".ds-virtual-list.ds-scroll-area")
    || document.querySelector(".ds-virtual-list");
  while (scroller && scroller !== document.body) {
    const style = getComputedStyle(scroller);
    if (style.overflowY === "auto" || style.overflowY === "scroll" || scroller.scrollHeight > scroller.clientHeight + 32) break;
    scroller = scroller.parentElement;
  }
  scroller = scroller || document.scrollingElement || document.documentElement;
  const originalTop = scroller.scrollTop;
  const originalMax = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  const wasNearBottom = originalTop >= originalMax - 48;
  const records = new Map();
  const scan = () => {
    const turns = [...root.querySelectorAll("[data-virtual-list-item-key]")];
    for (let index = 0; index < turns.length; index += 1) {
      const turn = turns[index];
      const assistant = turn.querySelector(".ds-assistant-message-main-content");
      const user = assistant ? null : turn.querySelector(".ds-message");
      const role = assistant ? "assistant" : user ? "user" : "";
      const content = normalize((assistant || user)?.innerText || (assistant || user)?.textContent);
      if (!role || !content) continue;
      const virtualKey = turn.getAttribute("data-virtual-list-item-key") || String(index);
      const numericKey = Number.parseInt(virtualKey, 10);
      const turnIndex = Number.isFinite(numericKey)
        ? Math.max(0, Math.floor((numericKey - 1) / 2))
        : Math.floor(index / 2);
      const key = role + ":" + virtualKey;
      const previous = records.get(key);
      if (!previous || content.length > previous.content.length) {
        records.set(key, { key, role, content, turnIndex, order: Number.isFinite(numericKey) ? numericKey : index });
      }
    }
  };
  try {
    scan();
    let lastHeight = -1;
    for (let attempt = 0; attempt < 16; attempt += 1) {
      scroller.scrollTop = 0;
      await sleep(260);
      scan();
      if (scroller.scrollHeight === lastHeight) break;
      lastHeight = scroller.scrollHeight;
    }
    for (let attempt = 0; attempt < 100; attempt += 1) {
      scan();
      const maxTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      if (scroller.scrollTop >= maxTop - 2) break;
      scroller.scrollTop = Math.min(maxTop, scroller.scrollTop + Math.max(240, scroller.clientHeight * 0.72));
      await sleep(180);
    }
    scan();
    const messages = [...records.values()].sort((left, right) => left.order - right.order);
    return {
      title: normalize(document.title).replace(/\s*-\s*DeepSeek\s*$/i, "") || "当前 DeepSeek 网页对话",
      url: location.href,
      messages
    };
  } finally {
    const maxTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    scroller.scrollTop = wasNearBottom ? maxTop : Math.min(originalTop, maxTop);
  }
})()`;

function conversationRecord(value) {
  const messages = Array.isArray(value?.messages) ? value.messages : [];
  if (messages.length === 0) {
    throw new Error("当前 DeepSeek 对话还没有可抓取的消息。");
  }
  const transcript = messages
    .map((message, index) => {
      const role = message.role === "assistant" ? "Assistant" : "User";
      const turn = Number.isInteger(message.turnIndex)
        ? message.turnIndex + 1
        : Math.floor(index / 2) + 1;
      return `## ${role} · Turn ${turn}\n${String(message.content || "").trim()}`;
    })
    .join("\n\n");
  return {
    requestId: randomUUID(),
    captureId: `steel-${randomUUID()}`,
    capturedAt: new Date().toISOString(),
    provider: "DeepSeek",
    title: String(value.title || "当前 DeepSeek 网页对话").slice(0, 500),
    url: String(value.url || ""),
    messageCount: messages.length,
    transcript
  };
}

export class SteelBrowserHost {
  constructor({
    env = process.env,
    fetchImpl = globalThis.fetch,
    WebSocketImpl = globalThis.WebSocket,
    startImpl = startManagedSteel
  } = {}) {
    this.env = env;
    this.fetchImpl = fetchImpl;
    this.WebSocketImpl = WebSocketImpl;
    this.startImpl = startImpl;
    this.steelUrl = loopbackUrl(env.SPECSRELAY_STEEL_URL || DEFAULT_STEEL_URL);
    this.session = null;
    this.starting = null;
  }

  async request(pathname, options = {}) {
    const response = await this.fetchImpl(new URL(pathname, this.steelUrl), {
      ...options,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...options.headers
      }
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Local browser request failed: HTTP ${response.status}`);
    }
    return response;
  }

  async healthy() {
    try {
      const response = await this.fetchImpl(new URL("/v1/health", this.steelUrl), {
        signal: AbortSignal.timeout(2500)
      });
      return response.ok || response.status === 503;
    } catch {
      return false;
    }
  }

  status() {
    return {
      state: this.session ? "ready" : this.starting ? "starting" : "idle",
      viewerUrl: this.session
        ? "/specsrelay/steel/v1/sessions/debug?showControls=true&interactive=true&theme=dark"
        : ""
    };
  }

  async ensureReady() {
    if (this.session) return this.status();
    if (this.starting) return this.starting;
    this.starting = this.start().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  async start() {
    if (!(await this.healthy())) {
      try {
        await this.startImpl({ env: this.env });
      } catch {
        throw new Error("本地浏览器未能启动。请确认 Docker Desktop 正在运行后重试。");
      }
      const deadline = Date.now() + HEALTH_TIMEOUT_MS;
      while (Date.now() < deadline && !(await this.healthy())) {
        await sleep(500);
      }
      if (!(await this.healthy())) {
        throw new Error("本地浏览器启动超时，请稍后重试。");
      }
    }

    const existing = await this.request("/v1/sessions").then((response) =>
      response.json()
    );
    this.session = existing.sessions?.find(
      (session) => session.status === "live" && session.websocketUrl
    );
    if (!this.session) {
      this.session = await this.request("/v1/sessions", {
        method: "POST",
        body: JSON.stringify({
          persist: true,
          headless: true,
          dimensions: { width: 1440, height: 1000 }
        })
      }).then((response) => response.json());
    }
    await this.ensureDeepSeekPage();
    return this.status();
  }

  async connect() {
    if (!this.WebSocketImpl) {
      throw new Error("当前 DSH 运行时不支持浏览器会话连接。");
    }
    const connection = new CdpConnection(
      normalizeWebSocketUrl(this.session.websocketUrl, this.steelUrl),
      this.WebSocketImpl
    );
    await connection.open();
    return connection;
  }

  async deepSeekTarget(connection, { create = false } = {}) {
    const targets = await connection.send("Target.getTargets");
    let target = targets.targetInfos?.find(
      (item) => item.type === "page" && item.url?.startsWith("https://chat.deepseek.com/")
    );
    if (!target && create) {
      const created = await connection.send("Target.createTarget", { url: DEEPSEEK_URL });
      target = { targetId: created.targetId, type: "page", url: DEEPSEEK_URL };
    }
    return target || null;
  }

  async ensureDeepSeekPage() {
    const connection = await this.connect();
    try {
      await this.deepSeekTarget(connection, { create: true });
    } finally {
      connection.close();
    }
  }

  async capture() {
    await this.ensureReady();
    const connection = await this.connect();
    try {
      const target = await this.deepSeekTarget(connection);
      if (!target) throw new Error("请先在左侧 DeepSeek 页面打开一个对话。");
      const attached = await connection.send("Target.attachToTarget", {
        targetId: target.targetId,
        flatten: true
      });
      const evaluated = await connection.send(
        "Runtime.evaluate",
        {
          expression: CAPTURE_EXPRESSION,
          awaitPromise: true,
          returnByValue: true,
          userGesture: true
        },
        attached.sessionId
      );
      if (evaluated.exceptionDetails) {
        throw new Error(
          evaluated.exceptionDetails.exception?.description ||
            evaluated.exceptionDetails.text ||
            "DeepSeek 对话抓取失败。"
        );
      }
      return conversationRecord(evaluated.result?.value);
    } finally {
      connection.close();
    }
  }

  async viewerHtml(proxyWebSocketUrl) {
    await this.ensureReady();
    const response = await this.fetchImpl(
      new URL("/v1/sessions/debug?showControls=true&interactive=true&theme=dark", this.steelUrl)
    );
    if (!response.ok) throw new Error(`DeepSeek 页面加载失败：HTTP ${response.status}`);
    const html = await response.text();
    return html.replace(
      /wss?:\/\/[^'\"]+\/v1\/sessions\/cast/g,
      proxyWebSocketUrl
    );
  }

  proxyWebSocket(req, socket, head) {
    const upstream = net.connect(
      Number(this.steelUrl.port || 80),
      this.steelUrl.hostname
    );
    const closeBoth = () => {
      upstream.destroy();
      socket.destroy();
    };
    upstream.once("error", closeBoth);
    socket.once("error", closeBoth);
    upstream.once("connect", () => {
      const requestUrl = new URL(req.url || "/", "http://dsh");
      const suffix = requestUrl.search;
      const headers = [];
      for (const [name, value] of Object.entries(req.headers)) {
        if (name === "host" || name === "origin" || value === undefined) continue;
        for (const item of Array.isArray(value) ? value : [value]) {
          headers.push(`${name}: ${item}`);
        }
      }
      headers.push(`host: ${this.steelUrl.host}`);
      headers.push(`origin: ${this.steelUrl.origin}`);
      upstream.write(
        [`GET /v1/sessions/cast${suffix} HTTP/1.1`, ...headers, "", ""].join("\r\n")
      );
      if (head.length > 0) upstream.write(head);
      upstream.pipe(socket);
      socket.pipe(upstream);
    });
    upstream.once("close", () => socket.destroy());
    socket.once("close", () => upstream.destroy());
  }
}

export function createSteelBrowserHost(options = {}) {
  return new SteelBrowserHost(options);
}
