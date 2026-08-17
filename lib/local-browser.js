import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  access,
  chmod,
  mkdir,
  readFile,
  unlink
} from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const DEEPSEEK_URL = "https://chat.deepseek.com/";
const CDP_TIMEOUT_MS = 90000;
const BROWSER_START_TIMEOUT_MS = 30000;
const DEFAULT_VIEWPORT_WIDTH = 1440;
const DEFAULT_VIEWPORT_HEIGHT = 913;
const MIN_VIEWPORT_WIDTH = 320;
const MIN_VIEWPORT_HEIGHT = 480;
const MAX_VIEWPORT_WIDTH = 1920;
const MAX_VIEWPORT_HEIGHT = 1920;
const WEBSOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const VIRTUAL_KEY_CODES = {
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Escape: 27,
  PageUp: 33,
  PageDown: 34,
  End: 35,
  Home: 36,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Delete: 46
};

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizeViewportDimension(value, fallback, minimum, maximum) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

function normalizeViewerViewport(value = {}) {
  return {
    width: normalizeViewportDimension(
      value.width,
      DEFAULT_VIEWPORT_WIDTH,
      MIN_VIEWPORT_WIDTH,
      MAX_VIEWPORT_WIDTH
    ),
    height: normalizeViewportDimension(
      value.height,
      DEFAULT_VIEWPORT_HEIGHT,
      MIN_VIEWPORT_HEIGHT,
      MAX_VIEWPORT_HEIGHT
    )
  };
}

function privateProfileDirectory({
  env = process.env,
  homeDirectory = homedir()
} = {}) {
  if (typeof env.SPECSRELAY_HOME === "string" && env.SPECSRELAY_HOME.trim()) {
    return path.join(path.resolve(env.SPECSRELAY_HOME.trim()), "dsh-browser-profile");
  }
  return path.join(homeDirectory, ".specsrelay", "dsh-browser-profile");
}

function browserEnvironment(env) {
  const allowed = [
    "PATH",
    "HOME",
    "USER",
    "LOGNAME",
    "TMPDIR",
    "LANG",
    "LC_ALL",
    "LC_CTYPE",
    "DISPLAY",
    "XDG_RUNTIME_DIR"
  ];
  return Object.fromEntries(
    allowed.flatMap((name) =>
      typeof env[name] === "string" ? [[name, env[name]]] : []
    )
  );
}

async function executableExists(value) {
  if (!value) return false;
  try {
    await access(value, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function executableOnPath(name, env) {
  for (const directory of String(env.PATH || "").split(path.delimiter)) {
    if (!directory) continue;
    const candidate = path.join(directory, name);
    if (await executableExists(candidate)) return candidate;
  }
  return "";
}

export async function findLocalBrowser({
  env = process.env,
  platform = process.platform,
  homeDirectory = homedir()
} = {}) {
  const configured = env.SPECSRELAY_BROWSER_EXECUTABLE?.trim();
  if (configured) {
    if (!(await executableExists(configured))) {
      throw new Error("SpecsRelay configured browser executable is unavailable.");
    }
    return configured;
  }
  const candidates =
    platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          "/Applications/Comet.app/Contents/MacOS/Comet",
          path.join(
            homeDirectory,
            "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          ),
          path.join(
            homeDirectory,
            "Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
          )
        ]
      : platform === "win32"
        ? [
            path.join(
              env.PROGRAMFILES || "C:\\Program Files",
              "Google/Chrome/Application/chrome.exe"
            ),
            path.join(
              env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)",
              "Microsoft/Edge/Application/msedge.exe"
            ),
            path.join(
              env.LOCALAPPDATA || "",
              "Google/Chrome/Application/chrome.exe"
            )
          ]
        : [];
  for (const candidate of candidates) {
    if (await executableExists(candidate)) return candidate;
  }
  if (platform !== "win32" && platform !== "darwin") {
    for (const name of [
      "google-chrome-stable",
      "google-chrome",
      "microsoft-edge-stable",
      "chromium",
      "chromium-browser"
    ]) {
      const candidate = await executableOnPath(name, env);
      if (candidate) return candidate;
    }
  }
  throw new Error("本机没有可用的浏览器组件。");
}

class CdpConnection {
  constructor(url, WebSocketImpl) {
    this.socket = new WebSocketImpl(url);
    this.pending = new Map();
    this.listeners = new Map();
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
      if (Number.isInteger(value.id)) {
        const pending = this.pending.get(value.id);
        if (!pending) return;
        this.pending.delete(value.id);
        clearTimeout(pending.timeoutId);
        if (value.error) {
          pending.reject(new Error(value.error.message || "Browser command failed."));
        } else {
          pending.resolve(value.result ?? {});
        }
        return;
      }
      if (typeof value.method !== "string") return;
      for (const listener of this.listeners.get(value.method) || []) {
        listener(value.params ?? {}, value.sessionId || "");
      }
    });
    this.socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error("The local browser session closed."));
      }
      this.pending.clear();
      for (const listener of this.listeners.get("close") || []) listener({}, "");
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
    return () => {
      this.listeners.set(
        method,
        (this.listeners.get(method) || []).filter((item) => item !== listener)
      );
    };
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

function encodeWebSocketFrame(payload, opcode = 1) {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  if (body.length < 126) {
    return Buffer.concat([Buffer.from([0x80 | opcode, body.length]), body]);
  }
  if (body.length <= 0xffff) {
    const header = Buffer.allocUnsafe(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
    return Buffer.concat([header, body]);
  }
  const header = Buffer.allocUnsafe(10);
  header[0] = 0x80 | opcode;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(body.length), 2);
  return Buffer.concat([header, body]);
}

class BrowserViewerSocket {
  constructor(socket, head = Buffer.alloc(0)) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.messageListeners = [];
    this.closeListeners = [];
    this.closed = false;
    socket.on("data", (chunk) => this.consume(chunk));
    socket.once("close", () => this.finish());
    socket.once("error", () => this.finish());
    if (head.length > 0) this.consume(head);
  }

  onMessage(listener) {
    this.messageListeners.push(listener);
  }

  onClose(listener) {
    this.closeListeners.push(listener);
  }

  consume(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      const masked = (second & 0x80) !== 0;
      let length = second & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        const size = this.buffer.readBigUInt64BE(2);
        if (size > BigInt(Number.MAX_SAFE_INTEGER)) return this.close();
        length = Number(size);
        offset = 10;
      }
      const maskLength = masked ? 4 : 0;
      if (this.buffer.length < offset + maskLength + length) return;
      const mask = masked ? this.buffer.subarray(offset, offset + 4) : null;
      offset += maskLength;
      const payload = Buffer.from(this.buffer.subarray(offset, offset + length));
      this.buffer = this.buffer.subarray(offset + length);
      if (mask) {
        for (let index = 0; index < payload.length; index += 1) {
          payload[index] ^= mask[index % 4];
        }
      }
      if (opcode === 0x8) {
        this.close();
        return;
      }
      if (opcode === 0x9) {
        this.socket.write(encodeWebSocketFrame(payload, 0x0a));
        continue;
      }
      if (opcode !== 0x1) continue;
      let value;
      try {
        value = JSON.parse(payload.toString("utf8"));
      } catch {
        continue;
      }
      for (const listener of this.messageListeners) listener(value);
    }
  }

  send(value, callback = () => {}) {
    if (this.closed) return;
    this.socket.write(encodeWebSocketFrame(JSON.stringify(value)), callback);
  }

  finish() {
    if (this.closed) return;
    this.closed = true;
    for (const listener of this.closeListeners) listener();
  }

  close() {
    if (this.closed) return;
    this.socket.end(encodeWebSocketFrame(Buffer.alloc(0), 0x08));
    this.finish();
  }
}

function acceptViewerSocket(req, socket, head) {
  const key = req.headers["sec-websocket-key"];
  if (typeof key !== "string" || req.headers.upgrade?.toLowerCase() !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    return null;
  }
  const accept = createHash("sha1")
    .update(`${key}${WEBSOCKET_GUID}`)
    .digest("base64");
  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "",
      ""
    ].join("\r\n")
  );
  return new BrowserViewerSocket(socket, head);
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
    captureId: `local-browser-${randomUUID()}`,
    capturedAt: new Date().toISOString(),
    provider: "DeepSeek",
    title: String(value.title || "当前 DeepSeek 网页对话").slice(0, 500),
    url: String(value.url || ""),
    messageCount: messages.length,
    transcript
  };
}

function viewerHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>DeepSeek</title>
<style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#101114;touch-action:none}
body{position:relative;font-family:system-ui,-apple-system,sans-serif}
#frameA,#frameB,#inputLayer{position:absolute;inset:0;width:100%;height:100%;border:0}
#frameA,#frameB{background:#101114;opacity:0;pointer-events:none}
#frameA.is-visible,#frameB.is-visible{opacity:1}
#inputLayer{outline:0;touch-action:none}
#keyboard{position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:.01;border:0;padding:0;resize:none}
#status{position:fixed;inset:0;display:grid;place-items:center;background:#101114;color:#aaa;font-size:14px;pointer-events:none}
#status[hidden]{display:none}
</style>
</head>
<body>
<iframe id="frameA" title="DeepSeek 网页"></iframe>
<iframe id="frameB" title="DeepSeek 网页画面缓冲"></iframe>
<div id="inputLayer" tabindex="0" aria-label="DeepSeek 网页操作层"></div>
<textarea id="keyboard" aria-label="网页输入"></textarea>
<div id="status">正在打开 DeepSeek…</div>
<script>
(() => {
  const frameA = document.getElementById("frameA");
  const frameB = document.getElementById("frameB");
  const inputLayer = document.getElementById("inputLayer");
  const keyboard = document.getElementById("keyboard");
  const status = document.getElementById("status");
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(protocol + "//" + location.host + "/specsrelay/browser/live");
  const send = (value) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(value));
  };
  const modifiers = (event) =>
    (event.altKey ? 1 : 0) | (event.ctrlKey ? 2 : 0) |
    (event.metaKey ? 4 : 0) | (event.shiftKey ? 8 : 0);
  let visibleFrame = null;
  const point = (event) => {
    const rect = inputLayer.getBoundingClientRect();
    const image = visibleFrame?.contentDocument?.querySelector("img");
    const sourceWidth = image?.naturalWidth || Math.max(1, rect.width);
    const sourceHeight = image?.naturalHeight || Math.max(1, rect.height);
    const scale = Math.min(rect.width / sourceWidth, rect.height / sourceHeight);
    const renderedWidth = sourceWidth * scale;
    const renderedHeight = sourceHeight * scale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;
    return {
      x: Math.max(0, Math.min(sourceWidth, (event.clientX - rect.left - offsetX) / scale)),
      y: Math.max(0, Math.min(sourceHeight, (event.clientY - rect.top - offsetY) / scale))
    };
  };
  let frameLoading = false;
  let refreshTimer = 0;
  const refreshFrame = () => {
    if (frameLoading) return;
    if (document.hidden) {
      refreshTimer = setTimeout(refreshFrame, 1000);
      return;
    }
    frameLoading = true;
    const nextFrame = visibleFrame === frameA ? frameB : frameA;
    nextFrame.onload = () => {
      nextFrame.onload = null;
      frameLoading = false;
      nextFrame.classList.add("is-visible");
      if (visibleFrame) visibleFrame.classList.remove("is-visible");
      visibleFrame = nextFrame;
      status.hidden = true;
      refreshTimer = setTimeout(refreshFrame, 500);
    };
    nextFrame.onerror = () => {
      nextFrame.onload = null;
      nextFrame.onerror = null;
      frameLoading = false;
      status.hidden = Boolean(visibleFrame);
      status.textContent = "画面连接已断开，请刷新";
      refreshTimer = setTimeout(refreshFrame, 1000);
    };
    const rect = inputLayer.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    nextFrame.src = "/specsrelay/browser/frame?width=" + width +
      "&height=" + height + "&t=" + Date.now();
  };
  refreshTimer = setTimeout(refreshFrame, 0);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshFrame, 0);
  });
  socket.addEventListener("close", () => {
    status.hidden = false;
    status.textContent = "连接已断开，请刷新";
  });
  inputLayer.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    inputLayer.setPointerCapture(event.pointerId);
    const position = point(event);
    send({ type: "mouse", event: "mousePressed", ...position, button: "left", buttons: 1, clickCount: 1, modifiers: modifiers(event) });
    keyboard.focus({ preventScroll: true });
  });
  inputLayer.addEventListener("pointermove", (event) => {
    if (!event.buttons) return;
    event.preventDefault();
    send({ type: "mouse", event: "mouseMoved", ...point(event), button: "none", buttons: 1, modifiers: modifiers(event) });
  });
  inputLayer.addEventListener("pointerup", (event) => {
    event.preventDefault();
    send({ type: "mouse", event: "mouseReleased", ...point(event), button: "left", buttons: 0, clickCount: 1, modifiers: modifiers(event) });
  });
  inputLayer.addEventListener("wheel", (event) => {
    event.preventDefault();
    send({ type: "mouse", event: "mouseWheel", ...point(event), button: "none", buttons: 0, deltaX: event.deltaX, deltaY: event.deltaY, modifiers: modifiers(event) });
  }, { passive: false });
  keyboard.addEventListener("beforeinput", (event) => {
    if (event.inputType === "insertText" && event.data) {
      event.preventDefault();
      send({ type: "text", text: event.data });
      keyboard.value = "";
    }
  });
  keyboard.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") || "";
    if (text) send({ type: "text", text });
  });
  keyboard.addEventListener("keydown", (event) => {
    const supported = new Set(["Enter","Backspace","Tab","Escape","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"]);
    if (!supported.has(event.key)) return;
    event.preventDefault();
    send({ type: "key", event: "keyDown", key: event.key, code: event.code, modifiers: modifiers(event) });
    send({ type: "key", event: "keyUp", key: event.key, code: event.code, modifiers: modifiers(event) });
  });
})();
</script>
</body>
</html>`;
}

export class LocalBrowserHost {
  constructor({
    env = process.env,
    platform = process.platform,
    homeDirectory = homedir(),
    fetchImpl = globalThis.fetch,
    WebSocketImpl = globalThis.WebSocket,
    spawnImpl = spawn
  } = {}) {
    this.env = env;
    this.platform = platform;
    this.homeDirectory = homeDirectory;
    this.fetchImpl = fetchImpl;
    this.WebSocketImpl = WebSocketImpl;
    this.spawnImpl = spawnImpl;
    this.profileDirectory = privateProfileDirectory({ env, homeDirectory });
    this.devtoolsFile = path.join(this.profileDirectory, "DevToolsActivePort");
    this.browserEndpoint = "";
    this.browserProcess = null;
    this.starting = null;
    this.viewerSockets = new Set();
  }

  status() {
    return {
      state: this.browserEndpoint ? "ready" : this.starting ? "starting" : "idle",
      viewerUrl: this.browserEndpoint ? "/specsrelay/browser" : ""
    };
  }

  async readActiveEndpoint() {
    let lines;
    try {
      lines = (await readFile(this.devtoolsFile, "utf8"))
        .split(/\r?\n/)
        .map((line) => line.trim());
    } catch {
      return "";
    }
    const port = Number.parseInt(lines[0], 10);
    if (!Number.isInteger(port) || port < 1 || port > 65535 || !lines[1]?.startsWith("/")) {
      return "";
    }
    const endpoint = `ws://127.0.0.1:${port}${lines[1]}`;
    try {
      const response = await this.fetchImpl(`http://127.0.0.1:${port}/json/version`, {
        signal: AbortSignal.timeout(1500)
      });
      return response.ok ? endpoint : "";
    } catch {
      return "";
    }
  }

  async ensureReady() {
    if (this.browserEndpoint) return this.status();
    if (this.starting) return this.starting;
    this.starting = this.start().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  async start() {
    await mkdir(this.profileDirectory, { recursive: true, mode: 0o700 });
    await chmod(this.profileDirectory, 0o700).catch(() => {});
    this.browserEndpoint = await this.readActiveEndpoint();
    if (!this.browserEndpoint) {
      await unlink(this.devtoolsFile).catch(() => {});
      const executable = await findLocalBrowser({
        env: this.env,
        platform: this.platform,
        homeDirectory: this.homeDirectory
      });
      this.browserProcess = this.spawnImpl(
        executable,
        [
          "--headless=new",
          "--remote-debugging-address=127.0.0.1",
          "--remote-debugging-port=0",
          `--user-data-dir=${this.profileDirectory}`,
          "--window-size=1440,1000",
          "--no-first-run",
          "--no-default-browser-check",
          "--disable-component-update",
          "--disable-features=MediaRouter,Translate",
          "--use-mock-keychain",
          "about:blank"
        ],
        {
          detached: false,
          env: browserEnvironment(this.env),
          stdio: "ignore"
        }
      );
      const deadline = Date.now() + BROWSER_START_TIMEOUT_MS;
      while (Date.now() < deadline) {
        if (this.browserProcess.exitCode !== null) {
          throw new Error("本地浏览器启动失败。");
        }
        this.browserEndpoint = await this.readActiveEndpoint();
        if (this.browserEndpoint) break;
        await sleep(150);
      }
      if (!this.browserEndpoint) throw new Error("本地浏览器启动超时。");
    }
    await this.ensureDeepSeekPage();
    return this.status();
  }

  async connect() {
    if (!this.WebSocketImpl) {
      throw new Error("当前 DSH 运行时不支持浏览器会话连接。");
    }
    const connection = new CdpConnection(this.browserEndpoint, this.WebSocketImpl);
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

  viewerHtml() {
    return viewerHtml();
  }

  async captureFrame(viewportValue = {}) {
    await this.ensureReady();
    const viewport = normalizeViewerViewport(viewportValue);
    const connection = await this.connect();
    try {
      const target = await this.deepSeekTarget(connection, { create: true });
      const attached = await connection.send("Target.attachToTarget", {
        targetId: target.targetId,
        flatten: true
      });
      const sessionId = attached.sessionId;
      await connection.send("Page.bringToFront", {}, sessionId);
      await connection.send(
        "Emulation.setDeviceMetricsOverride",
        {
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          mobile: false,
          screenWidth: viewport.width,
          screenHeight: viewport.height
        },
        sessionId
      );
      const screenshot = await connection.send(
        "Page.captureScreenshot",
        {
          format: "jpeg",
          quality: 82,
          fromSurface: true,
          captureBeyondViewport: false
        },
        sessionId
      );
      return Buffer.from(screenshot.data, "base64");
    } finally {
      connection.close();
    }
  }

  async acceptViewer(req, socket, head) {
    await this.ensureReady();
    const viewer = acceptViewerSocket(req, socket, head);
    if (!viewer) return;
    this.viewerSockets.add(viewer);
    const connection = await this.connect();
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      this.viewerSockets.delete(viewer);
      viewer.close();
      connection.close();
    };
    viewer.onClose(close);
    connection.on("close", close);
    try {
      const target = await this.deepSeekTarget(connection, { create: true });
      const attached = await connection.send("Target.attachToTarget", {
        targetId: target.targetId,
        flatten: true
      });
      const sessionId = attached.sessionId;
      await connection.send("Page.bringToFront", {}, sessionId);
      viewer.onMessage((value) => {
        if (!value || typeof value !== "object" || closed) return;
        if (value.type === "mouse") {
          void connection
            .send(
              "Input.dispatchMouseEvent",
              {
                type: value.event,
                x: Number(value.x) || 0,
                y: Number(value.y) || 0,
                button: value.button || "none",
                buttons: Number(value.buttons) || 0,
                clickCount: Number(value.clickCount) || 0,
                deltaX: Number(value.deltaX) || 0,
                deltaY: Number(value.deltaY) || 0,
                modifiers: Number(value.modifiers) || 0,
                pointerType: "mouse"
              },
              sessionId
            )
            .catch(close);
        } else if (value.type === "text" && typeof value.text === "string") {
          void connection
            .send("Input.insertText", { text: value.text.slice(0, 10000) }, sessionId)
            .catch(close);
        } else if (value.type === "key") {
          const key = String(value.key || "").slice(0, 80);
          const virtualKeyCode = VIRTUAL_KEY_CODES[key] || 0;
          void connection
            .send(
              "Input.dispatchKeyEvent",
              {
                type: value.event === "keyUp" ? "keyUp" : "rawKeyDown",
                key,
                code: String(value.code || "").slice(0, 80),
                modifiers: Number(value.modifiers) || 0,
                windowsVirtualKeyCode: virtualKeyCode,
                nativeVirtualKeyCode: virtualKeyCode,
                ...(value.event !== "keyUp" && key === "Backspace"
                  ? { commands: ["deleteBackward"] }
                  : value.event !== "keyUp" && key === "Delete"
                    ? { commands: ["deleteForward"] }
                    : {})
              },
              sessionId
            )
            .catch(close);
        }
      });
    } catch (error) {
      close();
      throw error;
    }
  }

  async close() {
    for (const viewer of [...this.viewerSockets]) viewer.close();
    this.viewerSockets.clear();
    const endpoint = this.browserEndpoint;
    this.browserEndpoint = "";
    if (endpoint) {
      try {
        const connection = new CdpConnection(endpoint, this.WebSocketImpl);
        await connection.open();
        await connection.send("Browser.close");
        connection.close();
      } catch {
        this.browserProcess?.kill("SIGTERM");
      }
    }
    this.browserProcess = null;
  }
}

export function createLocalBrowserHost(options = {}) {
  return new LocalBrowserHost(options);
}
