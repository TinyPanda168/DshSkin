/*
 * SpecsRelay Capture Engine
 *
 * The progressive scrolling, turn hydration, stable-key deduplication, and
 * platform driver structure in this file are adapted from AI Chat Exporter:
 * https://github.com/TheBluCoder/AI-chat-exporter
 * Upstream commit: 3253d7696a112204137c4c3a1843a3c7d20e14b9
 * License: MIT. See THIRD_PARTY_NOTICES.md and third_party/AI-chat-exporter/LICENSE.
 */
(() => {
  if (globalThis.__specsRelayCaptureEngine) {
    return;
  }

  const ENGINE_VERSION = "1.0.0";
  const CONVERSATION_VERSION = "1.0";
  const CONVERSATION_PROFILE = "conversation@1";
  const UPSTREAM_COMMIT = "3253d7696a112204137c4c3a1843a3c7d20e14b9";
  const TOP_LOAD_ATTEMPTS = 16;
  const SWEEP_ATTEMPTS = 100;
  const TOP_LOAD_DELAY = 260;
  const SWEEP_DELAY = 180;
  const RECOVERY_DELAY = 320;

  class CaptureDriverRegistry {
    constructor(definitions = []) {
      this.drivers = new Map();
      for (const definition of definitions) {
        this.register(definition);
      }
    }

    register(definition) {
      if (!definition?.id || typeof definition.scan !== "function") {
        throw new Error("Capture drivers require an id and scan function.");
      }
      if (this.drivers.has(definition.id)) {
        throw new Error(`Capture driver ${definition.id} is already registered.`);
      }
      const driver = Object.freeze({
        version: "1.0.0",
        ...definition,
        capabilities: Object.freeze([
          "conversation.capture",
          "conversation.scroll",
          "message.role.read",
          "message.code.read",
          ...(definition.capabilities ?? [])
        ])
      });
      this.drivers.set(driver.id, driver);
      return driver;
    }

    get(id) {
      return this.drivers.get(id) ?? null;
    }

    list() {
      return [...this.drivers.values()];
    }
  }

  function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function normalizeWhitespace(value) {
    return String(value ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{4,}/g, "\n\n\n")
      .trim();
  }

  function shortHash(value) {
    let hash = 2166136261;
    for (const character of String(value ?? "")) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function safeQueryAll(root, selectors) {
    const found = [];
    const unique = new Set();
    for (const selector of selectors ?? []) {
      if (!selector) {
        continue;
      }
      try {
        for (const element of root.querySelectorAll(selector)) {
          if (!unique.has(element)) {
            unique.add(element);
            found.push(element);
          }
        }
      } catch (error) {
        console.warn("[SpecsRelay Capture] Invalid selector", selector, error);
      }
    }
    return found;
  }

  function queryFirstMatchingSelector(root, selectors) {
    for (const selector of selectors ?? []) {
      if (!selector) {
        continue;
      }
      try {
        const matches = [...root.querySelectorAll(selector)];
        if (matches.length > 0) {
          return matches;
        }
      } catch (error) {
        console.warn("[SpecsRelay Capture] Invalid selector", selector, error);
      }
    }
    return [];
  }

  function normalizeCodeLanguage(value) {
    const raw = String(value ?? "").trim().toLowerCase();
    const aliases = {
      "c++": "cpp",
      "c#": "csharp",
      javascript: "js",
      typescript: "ts"
    };
    const normalized = aliases[raw] ?? raw.replace(/^language-/, "").replace(/\s+/g, "");
    return /^[a-z0-9#+._-]{1,20}$/i.test(normalized) ? normalized : "";
  }

  function codeFence(content) {
    const runs = String(content ?? "").match(/`+/g) ?? [];
    const length = Math.max(3, ...runs.map((run) => run.length + 1));
    return "`".repeat(length);
  }

  function extractCodeText(code) {
    const direct = String(code?.innerText ?? "").replace(/\r\n/g, "\n");
    if (direct.includes("\n")) {
      return direct;
    }
    const lines = safeQueryAll(code, [".cm-line"]);
    if (lines.length > 0) {
      return lines.map((line) => line.textContent ?? "").join("\n");
    }
    const clone = code.cloneNode(true);
    clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    return String(clone.textContent ?? "").replace(/\r\n/g, "\n");
  }

  function replaceCodeBlocks(clone) {
    clone.querySelectorAll("pre").forEach((pre) => {
      const code = pre.querySelector("code") ?? pre;
      const content = extractCodeText(code).trimEnd();
      if (!content) {
        pre.remove();
        return;
      }
      const classLanguage = String(code.getAttribute("class") ?? "")
        .match(/language-([\w+-]+)/i)?.[1];
      const headerLanguage = pre.querySelector("[class*='text-token']")?.textContent;
      const language = normalizeCodeLanguage(classLanguage ?? headerLanguage ?? "");
      const fence = codeFence(content);
      pre.replaceWith(`\n${fence}${language}\n${content}\n${fence}\n`);
    });
    clone.querySelectorAll("code").forEach((code) => {
      const text = normalizeWhitespace(code.textContent);
      code.replaceWith(text ? `\`${text}\`` : "");
    });
  }

  function replaceLists(clone) {
    clone.querySelectorAll("ol, ul").forEach((list) => {
      const ordered = list.tagName === "OL";
      const items = [...list.children].filter((child) => child.tagName === "LI");
      const text = items
        .map((item, index) => `${ordered ? `${index + 1}.` : "-"} ${normalizeWhitespace(item.innerText ?? item.textContent)}`)
        .join("\n");
      if (text) {
        list.replaceWith(`\n${text}\n`);
      }
    });
  }

  function replaceImages(clone) {
    clone.querySelectorAll("img").forEach((image) => {
      const url = image.currentSrc || image.src || image.getAttribute("data-src") || "";
      const name = normalizeWhitespace(image.alt) || "Image";
      image.replaceWith(url && !url.startsWith("data:") ? `\n![${name}](${url})\n` : "");
    });
  }

  function extractStructuredText(element, contentSelectors = []) {
    if (!element) {
      return "";
    }
    const target = safeQueryAll(element, contentSelectors)[0] ?? element;
    const clone = target.cloneNode(true);
    clone
      .querySelectorAll(
        "button, svg, style, script, textarea, input, [aria-hidden='true'], .react-syntax-highlighter-line-number"
      )
      .forEach((node) => node.remove());
    replaceCodeBlocks(clone);
    replaceLists(clone);
    replaceImages(clone);
    return normalizeWhitespace(clone.innerText ?? clone.textContent);
  }

  function extractMedia(element) {
    const media = [];
    const seen = new Set();
    for (const image of safeQueryAll(element, ["img[src]", "img[data-src]"])) {
      const url = image.currentSrc || image.src || image.getAttribute("data-src") || "";
      if (!url || url.startsWith("data:") || seen.has(url)) {
        continue;
      }
      seen.add(url);
      media.push({
        type: "image",
        name: normalizeWhitespace(image.alt) || "image",
        url
      });
    }
    return media;
  }

  function stableElementKey(element, role, index, content) {
    for (const attribute of [
      "data-turn-id",
      "data-testid",
      "data-test-render-count",
      "data-message-id",
      "id"
    ]) {
      const value = element?.getAttribute?.(attribute);
      if (value) {
        return `${role}:${value}`;
      }
    }
    return `${role}:${index}:${shortHash(content)}`;
  }

  function createMessage({ element, role, turnIndex, contentSelectors }) {
    const content = extractStructuredText(element, contentSelectors);
    const media = extractMedia(element);
    if (!content && media.length === 0) {
      return null;
    }
    const id = stableElementKey(element, role, turnIndex, content);
    return {
      id,
      role,
      content,
      media,
      attachments: [],
      turn_index: turnIndex
    };
  }

  function groupedScan(root, driver, seenKeys) {
    const groups = safeQueryAll(root, driver.groupSelectors);
    const messages = [];
    groups.forEach((group, turnIndex) => {
      const groupKey = stableElementKey(group, "turn", turnIndex, group.textContent);
      for (const roleDefinition of driver.roles) {
        const candidates = queryFirstMatchingSelector(group, roleDefinition.selectors);
        candidates.forEach((element, roleIndex) => {
          const shellKey = `${groupKey}:${roleDefinition.role}:${roleIndex}`;
          seenKeys.add(shellKey);
          const message = createMessage({
            element,
            role: roleDefinition.role,
            turnIndex,
            contentSelectors: roleDefinition.contentSelectors
          });
          if (message) {
            message.id = shellKey;
            messages.push(message);
          }
        });
      }
    });
    return messages;
  }

  function chatGptScan(root, driver, seenKeys) {
    const messages = [];
    safeQueryAll(root, driver.turnSelectors).forEach((turn, index) => {
      const rawRole = turn.getAttribute("data-turn") ?? "";
      const role = rawRole === "assistant" ? "assistant" : rawRole === "user" ? "user" : "";
      if (!role) {
        return;
      }
      const testId = turn.getAttribute("data-testid") ?? "";
      const parsedIndex = Number.parseInt(testId.split("-").at(-1), 10);
      const turnIndex = Number.isFinite(parsedIndex) ? parsedIndex : index;
      const shellKey = stableElementKey(turn, role, turnIndex, "");
      seenKeys.add(shellKey);
      const message = createMessage({
        element: turn,
        role,
        turnIndex,
        contentSelectors:
          role === "user" ? driver.userContentSelectors : driver.assistantContentSelectors
      });
      if (message) {
        message.id = shellKey;
        messages.push(message);
      }
    });
    return messages;
  }

  function roleNodeScan(root, driver, seenKeys) {
    const records = [];
    for (const roleDefinition of driver.roles) {
      queryFirstMatchingSelector(root, roleDefinition.selectors).forEach((element) => {
        records.push({ element, roleDefinition });
      });
    }
    records.sort((left, right) => {
      const relation = left.element.compareDocumentPosition(right.element);
      return relation & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return records.flatMap(({ element, roleDefinition }, index) => {
      const shellKey = stableElementKey(element, roleDefinition.role, index, "");
      seenKeys.add(shellKey);
      const message = createMessage({
        element,
        role: roleDefinition.role,
        turnIndex: index,
        contentSelectors: roleDefinition.contentSelectors
      });
      if (!message) {
        return [];
      }
      message.id = shellKey;
      return [message];
    });
  }

  function deepSeekScan(root, driver, seenKeys) {
    const messages = [];
    safeQueryAll(root, driver.turnSelectors).forEach((turn, index) => {
      const assistantContent = turn.querySelector(
        ".ds-assistant-message-main-content"
      );
      const userContent = assistantContent ? null : turn.querySelector(".ds-message");
      const role = assistantContent ? "assistant" : userContent ? "user" : "";
      if (!role) {
        return;
      }

      const virtualKey = turn.getAttribute("data-virtual-list-item-key") ?? "";
      const numericKey = Number.parseInt(virtualKey, 10);
      const turnIndex = Number.isFinite(numericKey)
        ? Math.max(0, Math.floor((numericKey - 1) / 2))
        : Math.floor(index / 2);
      const shellKey = virtualKey
        ? `deepseek:${virtualKey}`
        : stableElementKey(turn, role, turnIndex, "");
      seenKeys.add(shellKey);

      const message = createMessage({
        element: turn,
        role,
        turnIndex,
        contentSelectors:
          role === "assistant"
            ? [".ds-assistant-message-main-content"]
            : [".ds-message"]
      });
      if (message) {
        message.id = shellKey;
        messages.push(message);
      }
    });
    return messages;
  }

  function findCaptureRoot(driver) {
    return safeQueryAll(document, driver.rootSelectors)[0] ?? document.querySelector("main") ?? document.body;
  }

  function findScrollContainer(root, driver) {
    const explicit = safeQueryAll(document, driver.scrollSelectors)[0];
    let current = explicit ?? root;
    while (current && current !== document.body) {
      const style = getComputedStyle(current);
      if (
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        current.scrollHeight > current.clientHeight + 32
      ) {
        return current;
      }
      current = current.parentElement;
    }
    return document.scrollingElement ?? document.documentElement;
  }

  function mergeMessages(map, messages) {
    for (const message of messages) {
      const existing = map.get(message.id);
      if (!existing || message.content.length > existing.content.length) {
        map.set(message.id, message);
      }
    }
  }

  async function loadTop(scrollContainer) {
    let previousHeight = scrollContainer.scrollHeight;
    let stable = 0;
    for (let attempt = 0; attempt < TOP_LOAD_ATTEMPTS; attempt += 1) {
      scrollContainer.scrollTop = 0;
      await sleep(TOP_LOAD_DELAY);
      const height = scrollContainer.scrollHeight;
      if (height > previousHeight) {
        previousHeight = height;
        stable = 0;
      } else {
        stable += 1;
        if (stable >= 2) {
          break;
        }
      }
    }
  }

  async function sweepAndCapture({
    root,
    driver,
    scrollContainer,
    messageMap,
    seenKeys,
    ratio,
    delay
  }) {
    let stalled = 0;
    let previousTop = -1;
    for (let attempt = 0; attempt < SWEEP_ATTEMPTS; attempt += 1) {
      mergeMessages(messageMap, driver.scan(root, driver, seenKeys));
      const maxTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      if (scrollContainer.scrollTop >= maxTop - 2) {
        break;
      }
      const increment = Math.max(
        240,
        Math.floor((scrollContainer.clientHeight || window.innerHeight) * ratio)
      );
      scrollContainer.scrollTop = Math.min(maxTop, scrollContainer.scrollTop + increment);
      await sleep(delay);
      if (scrollContainer.scrollTop === previousTop) {
        stalled += 1;
        if (stalled >= 3) {
          break;
        }
      } else {
        stalled = 0;
      }
      previousTop = scrollContainer.scrollTop;
    }
    mergeMessages(messageMap, driver.scan(root, driver, seenKeys));
  }

  function sortMessages(messages) {
    return messages.sort((left, right) => {
      if (left.turn_index !== right.turn_index) {
        return left.turn_index - right.turn_index;
      }
      if (left.role === right.role) {
        return 0;
      }
      return left.role === "user" ? -1 : 1;
    });
  }

  function createEnvelope(adapter, driver, messages, warnings) {
    const capturedAt = new Date().toISOString();
    return {
      conversation_version: CONVERSATION_VERSION,
      profile: CONVERSATION_PROFILE,
      capture_id: `capture_${Date.now().toString(36)}_${shortHash(location.href)}`,
      captured_at: capturedAt,
      source: {
        connector_id: `web-chat.${adapter.id}`,
        provider: adapter.id,
        provider_label: adapter.label,
        title: document.title,
        url: location.href,
        capture_engine: "specsrelay.capture-engine",
        capture_engine_version: ENGINE_VERSION,
        driver_version: driver.version,
        derived_from: {
          project: "AI Chat Exporter",
          commit: UPSTREAM_COMMIT,
          license: "MIT"
        }
      },
      messages,
      statistics: {
        total_messages: messages.length,
        user_messages: messages.filter((message) => message.role === "user").length,
        assistant_messages: messages.filter((message) => message.role === "assistant").length,
        media_items: messages.reduce((total, message) => total + message.media.length, 0)
      },
      warnings
    };
  }

  const drivers = new CaptureDriverRegistry([
    {
      id: "chatgpt",
      label: "ChatGPT",
      rootSelectors: ["main"],
      scrollSelectors: ["[data-scroll-root]"],
      turnSelectors: ["[data-turn]"],
      userContentSelectors: [
        "[data-message-author-role='user'] .whitespace-pre-wrap",
        "[data-message-author-role='user']"
      ],
      assistantContentSelectors: [
        "[data-message-author-role='assistant'] .markdown",
        "[data-message-author-role='assistant']"
      ],
      scan: chatGptScan
    },
    {
      id: "claude",
      label: "Claude",
      rootSelectors: [
        "div.flex-1.flex.flex-col.px-4.max-w-3xl.mx-auto.w-full.pt-1",
        "main"
      ],
      scrollSelectors: ["div.overflow-y-scroll.overflow-x-hidden.pt-6.flex-1"],
      groupSelectors: ["div[data-test-render-count]"],
      roles: [
        {
          role: "user",
          selectors: ["[data-testid='user-message']", ".font-user-message"],
          contentSelectors: [".font-user-message"]
        },
        {
          role: "assistant",
          selectors: ["[data-testid='assistant-message']", ".font-claude-response"],
          contentSelectors: [".font-claude-response"]
        }
      ],
      scan: groupedScan
    },
    {
      id: "gemini",
      label: "Gemini",
      rootSelectors: ["conversation-container", "chat-app"],
      scrollSelectors: ["conversation-container"],
      groupSelectors: ["message-set"],
      roles: [
        {
          role: "user",
          selectors: ["user-query"],
          contentSelectors: ["user-query-content", ".user-query-bubble-with-background"]
        },
        {
          role: "assistant",
          selectors: ["model-response"],
          contentSelectors: [".model-response-text", "message-content"]
        }
      ],
      scan: groupedScan
    },
    {
      id: "deepseek",
      label: "DeepSeek",
      rootSelectors: [
        ".ds-virtual-list.ds-virtual-list--printable",
        ".ds-virtual-list"
      ],
      scrollSelectors: [
        ".ds-virtual-list.ds-scroll-area",
        ".ds-virtual-list"
      ],
      turnSelectors: ["[data-virtual-list-item-key]"],
      scan: deepSeekScan
    },
    {
      id: "kimi",
      label: "Kimi",
      rootSelectors: ["main", "body"],
      scrollSelectors: ["main [class*='scroll']", "main"],
      roles: [
        {
          role: "user",
          selectors: ["[data-role='user']", ".chat-content-item-user", ".segment-user"],
          contentSelectors: []
        },
        {
          role: "assistant",
          selectors: [
            "[data-role='assistant']",
            ".chat-content-item-assistant",
            ".segment-assistant"
          ],
          contentSelectors: []
        }
      ],
      scan: roleNodeScan
    },
    {
      id: "glm",
      label: "GLM",
      rootSelectors: ["main", "body"],
      scrollSelectors: ["main [class*='scroll']", "main"],
      roles: [
        {
          role: "user",
          selectors: ["[data-role='user']", "[data-testid*='user-message']", ".user-message"],
          contentSelectors: []
        },
        {
          role: "assistant",
          selectors: [
            "[data-role='assistant']",
            "[data-testid*='assistant-message']",
            ".assistant-message",
            "[class*='assistant-content']"
          ],
          contentSelectors: []
        }
      ],
      scan: roleNodeScan
    }
  ]);

  async function capture(adapter) {
    const driver = drivers.get(adapter?.id);
    if (!driver) {
      return {
        ok: false,
        code: "capture-driver-not-found",
        provider: adapter?.id ?? ""
      };
    }

    const root = findCaptureRoot(driver);
    const scrollContainer = findScrollContainer(root, driver);
    const originalTop = scrollContainer.scrollTop;
    const originalMaxTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
    const wasNearBottom = originalTop >= originalMaxTop - 48;
    const messageMap = new Map();
    const seenKeys = new Set();
    const warnings = [];

    try {
      mergeMessages(messageMap, driver.scan(root, driver, seenKeys));
      await loadTop(scrollContainer);
      await sweepAndCapture({
        root,
        driver,
        scrollContainer,
        messageMap,
        seenKeys,
        ratio: 0.78,
        delay: SWEEP_DELAY
      });

      const unresolved = [...seenKeys].filter((key) => !messageMap.has(key));
      if (unresolved.length > 0) {
        scrollContainer.scrollTop = 0;
        await sleep(RECOVERY_DELAY);
        await sweepAndCapture({
          root,
          driver,
          scrollContainer,
          messageMap,
          seenKeys,
          ratio: 0.4,
          delay: RECOVERY_DELAY
        });
      }

      const messages = sortMessages([...messageMap.values()]);
      if (messages.length === 0) {
        return {
          ok: false,
          code: "conversation-empty",
          provider: adapter.id,
          providerLabel: adapter.label
        };
      }
      const stillUnresolved = [...seenKeys].filter((key) => !messageMap.has(key));
      if (stillUnresolved.length > 0) {
        warnings.push(`${stillUnresolved.length} message shells did not hydrate during capture.`);
      }
      return {
        ok: true,
        provider: adapter.id,
        providerLabel: adapter.label,
        driverVersion: driver.version,
        capabilities: [...driver.capabilities],
        conversation: createEnvelope(adapter, driver, messages, warnings)
      };
    } catch (error) {
      return {
        ok: false,
        code: "capture-failed",
        provider: adapter.id,
        providerLabel: adapter.label,
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      const currentMaxTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      scrollContainer.scrollTop = wasNearBottom ? currentMaxTop : Math.min(originalTop, currentMaxTop);
    }
  }

  globalThis.__specsRelayCaptureEngine = Object.freeze({
    version: ENGINE_VERSION,
    capture,
    listDrivers: () => drivers.list().map((driver) => ({
      id: driver.id,
      label: driver.label,
      version: driver.version,
      capabilities: [...driver.capabilities]
    }))
  });
})();
