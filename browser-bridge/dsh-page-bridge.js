(() => {
  const CHANNEL = "specsrelay-dsh-v1";
  const CLIENT_SOURCE = "specsrelay-dsh-client";
  const BRIDGE_SOURCE = "specsrelay-dsh-bridge";
  const ACTION_TYPES = Object.freeze({
    capture: "captureDshConversation",
    configure: "configureDshOrganizer",
    organize: "organizeDshConversation",
    ping: "pingDshBridge"
  });

  if (globalThis.__specsRelayDshPageBridgeInstalled) return;
  globalThis.__specsRelayDshPageBridgeInstalled = true;

  function isDeepSeekHarnessPage() {
    return (
      document.title === "DeepSeek Harness" &&
      Boolean(document.querySelector('[aria-label="打开 DeepSeek 页签"]'))
    );
  }

  function respond(requestId, response) {
    window.postMessage(
      {
        channel: CHANNEL,
        kind: "response",
        requestId,
        source: BRIDGE_SOURCE,
        ...response
      },
      window.location.origin
    );
  }

  window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      event.origin !== window.location.origin ||
      event.data?.channel !== CHANNEL ||
      event.data?.kind !== "request" ||
      event.data?.source !== CLIENT_SOURCE
    ) {
      return;
    }
    if (!isDeepSeekHarnessPage()) return;
    const { action, payload, requestId } = event.data;
    const type = ACTION_TYPES[action];
    if (!type || typeof requestId !== "string") return;

    chrome.runtime
      .sendMessage({
        target: "specsrelay-dsh-page",
        type,
        payload: payload ?? {}
      })
      .then((response) => {
        if (!response?.ok) {
          throw new Error(response?.error || "SpecsRelay DSH bridge request failed.");
        }
        respond(requestId, { ok: true, data: response.data });
      })
      .catch((error) => {
        respond(requestId, {
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      });
  });
})();
