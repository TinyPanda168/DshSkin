import { randomUUID } from "node:crypto";

export const WEB_PANEL_CHANNEL = "specsrelay-dsh:web-panel";
export const WEB_PANEL_ENV = "SPECSRELAY_DESKTOP_WEB_PANELS";
export const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

function isWebPanelResponse(value) {
  if (
    !isRecord(value) ||
    value.channel !== WEB_PANEL_CHANNEL ||
    value.kind !== "response" ||
    typeof value.requestId !== "string" ||
    typeof value.ok !== "boolean"
  ) {
    return false;
  }
  return value.ok ? "value" in value : typeof value.error === "string";
}

function asStatus(value) {
  if (!isRecord(value)) {
    throw new Error("桌面客户端返回了无效的网页面板状态。");
  }
  const states = new Set(["idle", "loading", "ready", "failed"]);
  if (!states.has(value.state) || typeof value.url !== "string") {
    throw new Error("桌面客户端返回了无效的网页面板状态。");
  }
  return {
    state: value.state,
    url: value.url,
    ...(typeof value.error === "string" ? { error: value.error } : {})
  };
}

/** Child-process transport for desktop-owned WebContentsView panels. */
export class ProcessWebPanelTransport {
  constructor({
    processObject = process,
    requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS
  } = {}) {
    if (
      !Number.isInteger(requestTimeoutMs) ||
      requestTimeoutMs <= 0 ||
      typeof processObject.send !== "function" ||
      !processObject.connected
    ) {
      throw new Error("SpecsRelay 桌面网页面板不可用。");
    }
    this.processObject = processObject;
    this.requestTimeoutMs = requestTimeoutMs;
    this.pending = new Map();
    this.disposed = false;
    this.onMessage = (message) => this.handleMessage(message);
    this.onDisconnect = () =>
      this.rejectAll(new Error("SpecsRelay 桌面网页面板连接已断开。"));
    processObject.on("message", this.onMessage);
    processObject.on("disconnect", this.onDisconnect);
  }

  request(payload) {
    if (this.disposed || !this.processObject.connected) {
      return Promise.reject(new Error("SpecsRelay 桌面网页面板不可用。"));
    }
    const requestId = randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error("SpecsRelay 桌面网页面板响应超时。"));
      }, this.requestTimeoutMs);
      timer.unref?.();
      this.pending.set(requestId, { resolve, reject, timer });
      this.send({
        channel: WEB_PANEL_CHANNEL,
        kind: "request",
        requestId,
        payload
      });
    });
  }

  notify(payload) {
    if (this.disposed || !this.processObject.connected) return;
    this.send(
      {
        channel: WEB_PANEL_CHANNEL,
        kind: "request",
        requestId: randomUUID(),
        payload
      },
      true
    );
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.processObject.off("message", this.onMessage);
    this.processObject.off("disconnect", this.onDisconnect);
    this.rejectAll(new Error("SpecsRelay 桌面网页面板已关闭。"));
  }

  send(message, bestEffort = false) {
    try {
      this.processObject.send(message, (error) => {
        if (!error || bestEffort) return;
        const pending = this.pending.get(message.requestId);
        if (!pending) return;
        this.pending.delete(message.requestId);
        clearTimeout(pending.timer);
        pending.reject(error);
      });
    } catch (cause) {
      if (bestEffort) return;
      const pending = this.pending.get(message.requestId);
      if (!pending) return;
      this.pending.delete(message.requestId);
      clearTimeout(pending.timer);
      pending.reject(cause instanceof Error ? cause : new Error(String(cause)));
    }
  }

  handleMessage(message) {
    if (!isWebPanelResponse(message)) return;
    const pending = this.pending.get(message.requestId);
    if (!pending) return;
    this.pending.delete(message.requestId);
    clearTimeout(pending.timer);
    if (message.ok) pending.resolve(message.value);
    else pending.reject(new Error(message.error));
  }

  rejectAll(cause) {
    const pending = [...this.pending.values()];
    this.pending.clear();
    for (const request of pending) {
      clearTimeout(request.timer);
      request.reject(cause);
    }
  }
}

/** SpecsRelay-owned service matching the desktopWebPanels plugin interface. */
export class ProcessDesktopWebPanels {
  constructor(transport) {
    this.transport = transport;
    this.registrations = new Set();
    this.disposed = false;
  }

  register(spec) {
    if (this.disposed) throw new Error("SpecsRelay 桌面网页面板已关闭。");
    let status = { state: "idle", url: spec.url };
    let active = true;
    const registered = this.transport
      .request({ operation: "register", spec })
      .then((value) => {
        status = asStatus(value);
      });
    void registered.catch(() => {});
    const update = async (operation) => {
      await registered;
      status = asStatus(await this.transport.request(operation));
      return { ...status };
    };
    const registration = {
      id: spec.id,
      status: () => ({ ...status }),
      ready: () => update({ operation: "ready", panelId: spec.id }),
      show: (bounds) =>
        update({ operation: "show", panelId: spec.id, bounds }),
      hide: () =>
        this.transport.notify({ operation: "hide", panelId: spec.id }),
      reload: () => update({ operation: "reload", panelId: spec.id }),
      evaluate: async (expression) => {
        await registered;
        return this.transport.request({
          operation: "evaluate",
          panelId: spec.id,
          expression
        });
      },
      dispose: async () => {
        if (!active) return;
        active = false;
        this.registrations.delete(registration);
        try {
          await registered;
        } catch {
          return;
        }
        await this.transport.request({ operation: "dispose", panelId: spec.id });
      }
    };
    this.registrations.add(registration);
    return registration;
  }

  async dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const registrations = [...this.registrations];
    this.registrations.clear();
    await Promise.all(registrations.map((registration) => registration.dispose()));
    this.transport.dispose();
  }
}

/** Create the process bridge only when the owning desktop explicitly advertises it. */
export function createProcessDesktopWebPanels({
  environment = process.env,
  processObject = process,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS
} = {}) {
  if (
    environment[WEB_PANEL_ENV] !== "1" ||
    typeof processObject.send !== "function" ||
    !processObject.connected
  ) {
    return undefined;
  }
  return new ProcessDesktopWebPanels(
    new ProcessWebPanelTransport({ processObject, requestTimeoutMs })
  );
}
