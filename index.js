import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import {
  chmod,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile
} from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export const name = "specsrelay-dsh-deepseek";
export const inject = ["webServer"];

export const PROTOCOL_VERSION = 1;
export const PLUGIN_VERSION = "0.1.0";

const MAX_INGRESS_BODY_BYTES = 320000;
const MAX_PROMPT_CHARS = 160000;
const MAX_PROJECT_PATH_CHARS = 4096;
const MAX_INBOX_ITEMS = 20;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function bridgeDirectory({
  env = process.env,
  platform = process.platform,
  homeDirectory = homedir()
} = {}) {
  if (typeof env.SPECSRELAY_HOME === "string" && env.SPECSRELAY_HOME.trim()) {
    return path.resolve(env.SPECSRELAY_HOME.trim());
  }
  if (platform === "win32") {
    const localAppData = env.LOCALAPPDATA ?? env.LocalAppData ?? "";
    return localAppData
      ? path.join(localAppData, "SpecsRelay")
      : path.join(homeDirectory, "AppData", "Local", "SpecsRelay");
  }
  return path.join(homeDirectory, ".specsrelay");
}

export function descriptorPath(options = {}) {
  return path.join(bridgeDirectory(options), "dsh-deepseek-bridge.json");
}

function jsonResponse(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
    "content-type": "application/json; charset=utf-8"
  });
  res.end(body);
}

function isLoopbackAddress(value) {
  return (
    value === "127.0.0.1" ||
    value === "::1" ||
    value === "::ffff:127.0.0.1"
  );
}

async function readJsonBody(req, maxBytes = MAX_INGRESS_BODY_BYTES) {
  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > maxBytes) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }
  if (received === 0) {
    throw new Error("Request body is required.");
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Request body is not valid JSON.");
  }
}

function boundedString(value, name, maxChars) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required.`);
  }
  const normalized = value.trim();
  if (normalized.length > maxChars) {
    throw new Error(`${name} exceeds ${maxChars} characters.`);
  }
  if (/[\0]/.test(normalized)) {
    throw new Error(`${name} contains invalid characters.`);
  }
  return normalized;
}

export function validateIncomingDelivery(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Delivery must be an object.");
  }
  if (value.protocolVersion !== PROTOCOL_VERSION) {
    throw new Error(`Unsupported delivery protocol: ${String(value.protocolVersion)}.`);
  }
  if (value.focus !== "deepseek") {
    throw new Error("This plugin accepts DeepSeek-focused deliveries only.");
  }
  if (value.source?.product !== "SpecsRelay") {
    throw new Error("Delivery source must be SpecsRelay.");
  }
  const envelope = value.relayEnvelope;
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
    throw new Error("Relay Envelope is required.");
  }
  if (envelope.payload_profile !== "coding_requirement@1") {
    throw new Error("Unsupported Relay payload profile.");
  }
  const handoffId = boundedString(envelope.relay_id, "Relay id", 160);
  const payload = envelope.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Relay payload is required.");
  }
  const title = boundedString(payload.title, "Handoff title", 240);
  const objective = boundedString(payload.objective, "Handoff objective", 12000);
  const projectPath = boundedString(
    value.projectPath,
    "Project path",
    MAX_PROJECT_PATH_CHARS
  );
  if (/\r|\n/.test(projectPath)) {
    throw new Error("Project path contains invalid characters.");
  }
  const prompt = boundedString(value.prompt, "Prompt", MAX_PROMPT_CHARS);
  return {
    handoffId,
    title,
    objective,
    projectPath,
    prompt,
    relayEnvelope: structuredClone(envelope),
    sourceProvider:
      typeof payload.source?.provider === "string"
        ? payload.source.provider.slice(0, 120)
        : "DeepSeek",
    sourceVersion:
      typeof value.source.version === "string"
        ? value.source.version.slice(0, 40)
        : ""
  };
}

function createInbox() {
  const records = [];
  return {
    accept(value) {
      const delivery = validateIncomingDelivery(value);
      const now = new Date().toISOString();
      const record = {
        ...delivery,
        state: "received",
        receivedAt: now,
        loadedAt: "",
        sessionId: ""
      };
      const existing = records.findIndex(
        (item) => item.handoffId === record.handoffId
      );
      if (existing !== -1) {
        records.splice(existing, 1);
      }
      records.unshift(record);
      records.splice(MAX_INBOX_ITEMS);
      return record;
    },
    list() {
      return records.map((record) => structuredClone(record));
    },
    latest() {
      const record = records.find((item) => item.state === "received") ?? null;
      return record === null ? null : structuredClone(record);
    },
    markLoaded(handoffId, sessionId) {
      const record = records.find((item) => item.handoffId === handoffId);
      if (!record) {
        throw new Error("Unknown SpecsRelay handoff.");
      }
      record.state = "loaded";
      record.loadedAt = new Date().toISOString();
      record.sessionId = sessionId;
      return structuredClone(record);
    }
  };
}

async function writeDescriptor(filePath, descriptor) {
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporary = `${filePath}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(temporary, `${JSON.stringify(descriptor, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
    flag: "wx"
  });
  await rename(temporary, filePath);
  await chmod(filePath, 0o600).catch(() => {});
}

async function removeOwnedDescriptor(filePath, token) {
  try {
    const value = JSON.parse(await readFile(filePath, "utf8"));
    if (value.token === token && value.pid === process.pid) {
      await unlink(filePath);
    }
  } catch {
    // A missing, replaced, or malformed descriptor is not owned cleanup work.
  }
}

export async function startIngressServer({ token, inbox }) {
  if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) {
    throw new Error("Ingress token is invalid.");
  }
  const server = createServer((req, res) => {
    const handle = async () => {
      if (!isLoopbackAddress(req.socket.remoteAddress)) {
        jsonResponse(res, 403, { error: "Loopback requests only." });
        return;
      }
      const pathname = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
      if (req.method !== "POST" || pathname !== "/v1/handoffs") {
        jsonResponse(res, 404, { error: "Not found." });
        return;
      }
      if (req.headers.authorization !== `Bearer ${token}`) {
        jsonResponse(res, 401, { error: "Invalid bridge token." });
        return;
      }
      const record = inbox.accept(await readJsonBody(req));
      jsonResponse(res, 202, {
        accepted: true,
        handoffId: record.handoffId,
        state: record.state,
        receivedAt: record.receivedAt
      });
    };
    handle().catch((error) => {
      jsonResponse(res, 400, {
        error: error instanceof Error ? error.message : String(error)
      });
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("DSH plugin ingress did not expose a TCP port.");
  }
  return {
    port: address.port,
    close: () =>
      new Promise((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      })
  };
}

function registerBrowserRoutes(ctx, inbox) {
  const requireLoopback = (req, res) => {
    if (isLoopbackAddress(req.socket.remoteAddress)) {
      return true;
    }
    jsonResponse(res, 403, { error: "Loopback requests only." });
    return false;
  };

  const disposeInbox = ctx.webServer.register({
    kind: "exact",
    path: "/specsrelay/v1/handoffs",
    handler: (req, res) => {
      if (!requireLoopback(req, res)) return;
      if (req.method !== "GET") {
        res.setHeader("allow", "GET");
        jsonResponse(res, 405, { error: "Method not allowed." });
        return;
      }
      jsonResponse(res, 200, { items: inbox.list() });
    }
  });
  const disposeLatest = ctx.webServer.register({
    kind: "exact",
    path: "/specsrelay/v1/handoffs/latest",
    handler: (req, res) => {
      if (!requireLoopback(req, res)) return;
      if (req.method !== "GET") {
        res.setHeader("allow", "GET");
        jsonResponse(res, 405, { error: "Method not allowed." });
        return;
      }
      jsonResponse(res, 200, { item: inbox.latest() });
    }
  });
  const disposeReceipt = ctx.webServer.register({
    kind: "exact",
    path: "/specsrelay/v1/receipts",
    handler: async (req, res) => {
      if (!requireLoopback(req, res)) return;
      if (req.method !== "POST") {
        res.setHeader("allow", "POST");
        jsonResponse(res, 405, { error: "Method not allowed." });
        return;
      }
      try {
        const value = await readJsonBody(req, 16000);
        const handoffId = boundedString(value?.handoffId, "Handoff id", 160);
        const sessionId = boundedString(value?.sessionId, "Session id", 160);
        const record = inbox.markLoaded(handoffId, sessionId);
        jsonResponse(res, 200, {
          accepted: true,
          handoffId,
          state: record.state,
          loadedAt: record.loadedAt
        });
      } catch (error) {
        jsonResponse(res, 400, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });
  return () => {
    disposeReceipt();
    disposeLatest();
    disposeInbox();
  };
}

export async function apply(ctx) {
  const inbox = createInbox();
  ctx.effect(
    () => registerBrowserRoutes(ctx, inbox),
    "specsrelay-deepseek: browser inbox routes"
  );

  const token = randomBytes(32).toString("hex");
  const ingress = await startIngressServer({ token, inbox });
  ctx.effect(
    () => () => ingress.close(),
    "specsrelay-deepseek: loopback ingress"
  );

  const filePath = descriptorPath();
  await writeDescriptor(filePath, {
    protocolVersion: PROTOCOL_VERSION,
    pluginVersion: PLUGIN_VERSION,
    product: "SpecsRelay for DeepSeek",
    host: "127.0.0.1",
    port: ingress.port,
    token,
    pid: process.pid,
    createdAt: new Date().toISOString()
  });
  ctx.effect(
    () => () => removeOwnedDescriptor(filePath, token),
    "specsrelay-deepseek: bridge descriptor"
  );
}
