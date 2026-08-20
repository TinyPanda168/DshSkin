import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import {
  ProcessDesktopWebPanels,
  ProcessWebPanelTransport,
  WEB_PANEL_CHANNEL,
  createProcessDesktopWebPanels
} from "../lib/process-web-panels.js";

class FakeProcess extends EventEmitter {
  connected = true;
  sent = [];

  send(message, callback) {
    this.sent.push(message);
    callback?.(null);
    return true;
  }
}

function reply(processObject, request, value) {
  processObject.emit("message", {
    channel: WEB_PANEL_CHANNEL,
    kind: "response",
    requestId: request.requestId,
    ok: true,
    value
  });
}

test("process panel bridge is enabled only by an advertised desktop host", () => {
  const processObject = new FakeProcess();
  assert.equal(
    createProcessDesktopWebPanels({ environment: {}, processObject }),
    undefined
  );
  assert.ok(
    createProcessDesktopWebPanels({
      environment: { SPECSRELAY_DESKTOP_WEB_PANELS: "1" },
      processObject
    })
  );
});

test("registration forwards lifecycle operations over correlated IPC", async () => {
  const processObject = new FakeProcess();
  const transport = new ProcessWebPanelTransport({
    processObject,
    requestTimeoutMs: 1_000
  });
  const panels = new ProcessDesktopWebPanels(transport);
  const panel = panels.register({
    id: "specsrelay-deepseek",
    url: "https://chat.deepseek.com/",
    allowedOrigins: ["https://chat.deepseek.com"]
  });

  const registerRequest = processObject.sent.at(-1);
  assert.equal(registerRequest.payload.operation, "register");
  reply(processObject, registerRequest, {
    state: "idle",
    url: "https://chat.deepseek.com/"
  });
  await new Promise((resolve) => setImmediate(resolve));

  const readyTask = panel.ready();
  await new Promise((resolve) => setImmediate(resolve));
  const readyRequest = processObject.sent.at(-1);
  assert.equal(readyRequest.payload.operation, "ready");
  reply(processObject, readyRequest, {
    state: "ready",
    url: "https://chat.deepseek.com/"
  });
  assert.equal((await readyTask).state, "ready");

  const evaluationTask = panel.evaluate("document.title");
  await new Promise((resolve) => setImmediate(resolve));
  const evaluationRequest = processObject.sent.at(-1);
  assert.equal(evaluationRequest.payload.operation, "evaluate");
  reply(processObject, evaluationRequest, "DeepSeek");
  assert.equal(await evaluationTask, "DeepSeek");

  const disposeTask = panel.dispose();
  await new Promise((resolve) => setImmediate(resolve));
  const disposeRequest = processObject.sent.at(-1);
  assert.equal(disposeRequest.payload.operation, "dispose");
  reply(processObject, disposeRequest, undefined);
  await disposeTask;
  await panels.dispose();
  assert.equal(processObject.listenerCount("message"), 0);
});

test("transport rejects pending operations when the desktop disconnects", async () => {
  const processObject = new FakeProcess();
  const transport = new ProcessWebPanelTransport({
    processObject,
    requestTimeoutMs: 1_000
  });
  const pending = transport.request({ operation: "status", panelId: "panel" });
  processObject.connected = false;
  processObject.emit("disconnect");
  await assert.rejects(pending, /连接已断开/);
  transport.dispose();
});
