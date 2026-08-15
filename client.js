(function registerSpecsRelayDeepSeekClient() {
  const PLUGIN_ID = "@specsrelay/dsh-deepseek";
  globalThis.__ModuleLoader__.load({
    id: PLUGIN_ID,
    factory: (require) => {
      const React = require("react");
      const {
        createElement: h,
        useEffect,
        useMemo,
        useState,
        useSyncExternalStore
      } = React;

      const API = "/specsrelay/v1";
      const DEEPSEEK_URL = "https://chat.deepseek.com/";
      const BRIDGE_CHANNEL = "specsrelay-dsh-v1";
      const BRIDGE_CLIENT_SOURCE = "specsrelay-dsh-client";
      const BRIDGE_SOURCE = "specsrelay-dsh-bridge";
      const bridgePending = new Map();
      let bridgeRequestSequence = 0;
      const SPECSRELAY_ICON =
        "data:image/png;base64,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";
      const listeners = new Set();
      let snapshot = Object.freeze({ items: [], loading: false, error: "" });

      function publish(patch) {
        snapshot = Object.freeze({ ...snapshot, ...patch });
        for (const listener of listeners) listener();
      }

      const inbox = {
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        getSnapshot() {
          return snapshot;
        },
        async refresh() {
          publish({ loading: true, error: "" });
          try {
            const response = await fetch(`${API}/handoffs`, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
            publish({
              items: Array.isArray(data.items) ? data.items : [],
              loading: false,
              error: ""
            });
            return Array.isArray(data.items) ? data.items : [];
          } catch (error) {
            publish({
              loading: false,
              error: error instanceof Error ? error.message : String(error)
            });
            return [];
          }
        },
        async latest() {
          const response = await fetch(`${API}/handoffs/latest`, {
            cache: "no-store"
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
          return data.item || null;
        },
        async receipt(item, sessionId) {
          const response = await fetch(`${API}/receipts`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ handoffId: item.handoffId, sessionId })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
          publish({
            items: snapshot.items.map((candidate) =>
              candidate.handoffId === item.handoffId
                ? {
                    ...candidate,
                    state: "loaded",
                    loadedAt: data.loadedAt || new Date().toISOString(),
                    sessionId
                  }
                : candidate
            )
          });
          return data;
        }
      };

      window.addEventListener("message", (event) => {
        if (
          event.source !== window ||
          event.origin !== window.location.origin ||
          event.data?.channel !== BRIDGE_CHANNEL ||
          event.data?.kind !== "response" ||
          event.data?.source !== BRIDGE_SOURCE
        ) {
          return;
        }
        const pending = bridgePending.get(event.data.requestId);
        if (!pending) return;
        bridgePending.delete(event.data.requestId);
        clearTimeout(pending.timeoutId);
        if (event.data.ok) {
          pending.resolve(event.data.data);
        } else {
          pending.reject(
            new Error(event.data.error || "SpecsRelay DSH bridge request failed.")
          );
        }
      });

      function requestBridge(action, payload = {}, timeoutMs = 65000) {
        const requestId = `dsh-${Date.now()}-${++bridgeRequestSequence}`;
        const promise = new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            bridgePending.delete(requestId);
            reject(
              new Error(
                "未检测到 SpecsRelay 浏览器桥接，请重新加载扩展和当前 DSH 页面。"
              )
            );
          }, timeoutMs);
          bridgePending.set(requestId, { reject, resolve, timeoutId });
        });
        window.postMessage(
          {
            action,
            channel: BRIDGE_CHANNEL,
            kind: "request",
            payload,
            requestId,
            source: BRIDGE_CLIENT_SOURCE
          },
          window.location.origin
        );
        return promise;
      }

      function listLines(values) {
        return Array.isArray(values) && values.length
          ? values.map((value) => `- ${value}`).join("\n")
          : "- 无";
      }

      function formatHandoffPrompt(handoff) {
        return `请根据以下由 SpecsRelay 从 DeepSeek 当前对话整理出的需求继续工作。先核对本地项目事实，再执行；不要假设对话中未确认的路径或实现。

标题：${handoff.title}

目标：
${handoff.objective}

背景：
${handoff.context}

已确认决策：
${listLines(handoff.decisions)}

实施建议：
${listLines(handoff.implementation_plan)}

验收标准：
${listLines(handoff.acceptance_criteria)}

约束：
${listLines(handoff.constraints)}

非目标：
${listLines(handoff.non_goals)}

需要本地核查：
${listLines(handoff.local_context_needed)}

未解决问题：
${listLines(handoff.open_questions)}`;
      }

      function useInbox() {
        return useSyncExternalStore(
          inbox.subscribe,
          inbox.getSnapshot,
          inbox.getSnapshot
        );
      }

      function normalizedPath(value) {
        const text = String(value || "")
          .trim()
          .replaceAll("\\", "/")
          .replace(/\/+$/, "");
        return /^[A-Za-z]:\//.test(text) ? text.toLowerCase() : text;
      }

      function relativeTime(value) {
        const time = Date.parse(value);
        if (!Number.isFinite(time)) return "";
        return new Date(time).toLocaleString();
      }

      const buttonStyle = {
        appearance: "none",
        background: "var(--dsw-alias-bg-layer-2)",
        border: "1px solid var(--dsw-alias-border-subtle)",
        borderRadius: 8,
        color: "var(--dsw-alias-text-primary)",
        cursor: "pointer",
        font: "inherit",
        minHeight: 32,
        padding: "5px 10px"
      };

      function loadIntoSession(ctx, sessionId, item) {
        const list = ctx.sessions.list.getSnapshot();
        const summary = list.byId[sessionId];
        const actual = normalizedPath(summary?.cwd);
        const expected = normalizedPath(item.projectPath);
        if (!actual || actual !== expected) {
          return {
            ok: false,
            message: `请先在 DSH 选择项目：${item.projectPath}`
          };
        }
        const scope = ctx.sessions.scope(sessionId);
        if (!scope) {
          return { ok: false, message: "当前 DSH 会话尚未准备好。" };
        }
        ctx.conversation.input.for(scope).setDraft(item.prompt);
        return { ok: true, sessionId };
      }

      function InboxCard({ item, loadDraft }) {
        const [message, setMessage] = useState("");
        const loaded = item.state === "loaded";
        const onLoad = async () => {
          setMessage("");
          const result = loadDraft(item);
          if (!result.ok) {
            setMessage(result.message);
            return;
          }
          try {
            await inbox.receipt(item, result.sessionId);
            setMessage("已载入当前会话草稿，请检查后发送。 ");
          } catch (error) {
            setMessage(
              `草稿已载入，但回执失败：${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        };
        return h(
          "article",
          {
            style: {
              background: "var(--dsw-alias-bg-layer-2)",
              border: "1px solid var(--dsw-alias-border-subtle)",
              borderRadius: 14,
              display: "grid",
              gap: 12,
              padding: 18
            }
          },
          h(
            "div",
            { style: { display: "flex", gap: 12, alignItems: "flex-start" } },
            h(
              "div",
              { style: { flex: 1, minWidth: 0 } },
              h(
                "div",
                { style: { display: "flex", gap: 8, alignItems: "center" } },
                h("strong", null, item.title),
                h(
                  "span",
                  {
                    style: {
                      borderRadius: 999,
                      background: loaded
                        ? "var(--dsw-alias-state-success-tertiary)"
                        : "var(--dsw-alias-state-warn-tertiary)",
                      color: loaded
                        ? "var(--dsw-alias-state-success-primary)"
                        : "var(--dsw-alias-state-warn-primary)",
                      fontSize: 12,
                      padding: "2px 8px"
                    }
                  },
                  loaded ? "已载入" : "待检查"
                )
              ),
              h(
                "div",
                {
                  style: {
                    color: "var(--dsw-alias-text-tertiary)",
                    fontSize: 12,
                    marginTop: 5
                  }
                },
                `${item.sourceProvider || "DeepSeek"} · ${relativeTime(
                  item.receivedAt
                )}`
              )
            ),
            h(
              "button",
              { type: "button", style: buttonStyle, onClick: onLoad },
              loaded ? "重新载入草稿" : "载入当前会话草稿"
            )
          ),
          h(
            "div",
            {
              style: {
                background: "var(--dsw-alias-bg-layer-1)",
                borderRadius: 10,
                color: "var(--dsw-alias-text-secondary)",
                fontSize: 13,
                padding: "10px 12px",
                wordBreak: "break-all"
              }
            },
            h("strong", null, "项目："),
            item.projectPath
          ),
          h(
            "p",
            {
              style: {
                color: "var(--dsw-alias-text-secondary)",
                lineHeight: 1.65,
                margin: 0,
                whiteSpace: "pre-wrap"
              }
            },
            item.objective
          ),
          message &&
            h(
              "div",
              {
                role: "status",
                style: {
                  color: message.startsWith("已载入")
                    ? "var(--dsw-alias-state-success-primary)"
                    : "var(--dsw-alias-state-error-primary)",
                  fontSize: 13
                }
              },
              message
            )
        );
      }

      function activateDeepSeekView() {
        const tab = [...document.querySelectorAll('button[role="tab"]')].find(
          (candidate) => candidate.textContent?.trim() === "DeepSeek"
        );
        if (!(tab instanceof HTMLElement)) return false;
        tab.click();
        return true;
      }

      function SpecsRelayShortcut({ wide, loadDraft, useSessions }) {
        const [open, setOpen] = useState(false);
        const sessionId = useSessions((sessions) => sessions.current || "");
        const onClick = () => {
          if (!activateDeepSeekView()) setOpen(true);
        };
        return h(
          React.Fragment,
          null,
          h(
            "button",
            {
              type: "button",
              onClick,
              title: "打开 DeepSeek 页签",
              "aria-label": "打开 DeepSeek 页签",
              style: {
                ...buttonStyle,
                alignItems: "center",
                display: "flex",
                gap: 8,
                justifyContent: wide ? "flex-start" : "center",
                margin: "0 8px",
                overflow: "hidden",
                width: wide ? "calc(100% - 16px)" : 40
              }
            },
            h("img", {
              src: SPECSRELAY_ICON,
              alt: "",
              "aria-hidden": true,
              draggable: false,
              style: {
                borderRadius: 5,
                display: "block",
                flex: "0 0 auto",
                height: 22,
                width: 22
              }
            }),
            wide && h("span", null, "SpecsRelay")
          ),
          open &&
            h(
              "div",
              {
                "aria-label": "DeepSeek 网页入口",
                style: {
                  background: "var(--dsw-alias-bg-base)",
                  inset: 0,
                  position: "fixed",
                  zIndex: 1000
                }
              },
              h(SpecsRelayDeepSeekView, {
                loadDraft,
                onClose: () => setOpen(false),
                sessionId,
                standalone: true,
                useSessions
              })
            )
        );
      }

      function SummarySection({ label, values }) {
        if (!Array.isArray(values) || values.length === 0) return null;
        return h(
          "section",
          { style: { display: "grid", gap: 6 } },
          h("strong", { style: { fontSize: 13 } }, label),
          h(
            "ul",
            {
              style: {
                color: "var(--dsw-alias-text-secondary)",
                display: "grid",
                gap: 5,
                lineHeight: 1.5,
                margin: 0,
                paddingLeft: 20
              }
            },
            ...values.map((value, index) => h("li", { key: index }, value))
          )
        );
      }

      function CapturedContextPanel({ capture, onClose }) {
        const conversation = capture?.conversation;
        const source = conversation?.source || {};
        const statistics = conversation?.statistics || {};
        return h(
          "aside",
          {
            "aria-label": "DeepSeek 对话上下文",
            style: {
              background: "var(--dsw-alias-bg-layer-1)",
              border: "1px solid var(--dsw-alias-border-subtle)",
              borderRadius: 12,
              display: "grid",
              gap: 14,
              maxHeight: "100%",
              minHeight: 0,
              overflow: "auto",
              padding: 16
            }
          },
          h(
            "header",
            { style: { display: "flex", gap: 10, justifyContent: "space-between" } },
            h("strong", null, "已获取当前对话"),
            h(
              "button",
              {
                type: "button",
                style: { ...buttonStyle, minHeight: 28, padding: "3px 9px" },
                onClick: onClose
              },
              "关闭"
            )
          ),
          h(
            "div",
            {
              style: {
                background: "var(--dsw-alias-bg-layer-2)",
                borderRadius: 10,
                display: "grid",
                gap: 8,
                padding: 12
              }
            },
            h("strong", null, source.title || "DeepSeek 当前对话"),
            h(
              "div",
              { style: { color: "var(--dsw-alias-text-secondary)", fontSize: 13 } },
              `${statistics.total_messages ?? conversation?.messages?.length ?? 0} 条消息 · ${statistics.user_messages ?? 0} 条用户消息 · ${statistics.assistant_messages ?? 0} 条助手消息`
            ),
            h(
              "div",
              { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 12 } },
              `抓取时间：${relativeTime(conversation?.captured_at)}`
            )
          ),
          h(
            "p",
            {
              style: {
                color: "var(--dsw-alias-text-secondary)",
                lineHeight: 1.6,
                margin: 0
              }
            },
            "完整多轮对话已保留在浏览器内存中。只有点击“总结为需求”后，内容才会发送给你配置的需求整理模型。"
          )
        );
      }

      function OrganizerSettingsPanel({ onClose, onConfigured }) {
        const [apiKey, setApiKey] = useState("");
        const [busy, setBusy] = useState(false);
        const [message, setMessage] = useState("");
        const [model, setModel] = useState("deepseek-v4-flash");
        const save = async () => {
          setBusy(true);
          setMessage("");
          try {
            const result = await requestBridge("configure", {
              apiKey,
              model
            });
            setApiKey("");
            setMessage(`已保存 ${result.provider} · ${result.model}。`);
            onConfigured(result);
          } catch (error) {
            setMessage(error instanceof Error ? error.message : String(error));
          } finally {
            setBusy(false);
          }
        };
        const inputStyle = {
          background: "var(--dsw-alias-bg-layer-2)",
          border: "1px solid var(--dsw-alias-border-subtle)",
          borderRadius: 8,
          color: "var(--dsw-alias-text-primary)",
          font: "inherit",
          minHeight: 34,
          padding: "6px 9px",
          width: "100%"
        };
        return h(
          "aside",
          {
            "aria-label": "SpecsRelay 总结设置",
            style: {
              background: "var(--dsw-alias-bg-layer-1)",
              border: "1px solid var(--dsw-alias-border-subtle)",
              borderRadius: 12,
              display: "grid",
              gap: 14,
              maxHeight: "100%",
              minHeight: 0,
              overflow: "auto",
              padding: 16
            }
          },
          h(
            "header",
            { style: { display: "flex", gap: 10, justifyContent: "space-between" } },
            h("strong", null, "DeepSeek 需求总结设置"),
            h(
              "button",
              {
                type: "button",
                style: { ...buttonStyle, minHeight: 28, padding: "3px 9px" },
                onClick: onClose
              },
              "关闭"
            )
          ),
          h(
            "p",
            {
              style: {
                color: "var(--dsw-alias-text-secondary)",
                lineHeight: 1.6,
                margin: 0
              }
            },
            "该配置只保存在 SpecsRelay-DSH 专用浏览器桥接中，不与 Chrome 商店版侧栏共用。"
          ),
          h(
            "label",
            { style: { display: "grid", fontSize: 13, gap: 6 } },
            "DeepSeek API Key",
            h("input", {
              type: "password",
              autoComplete: "off",
              value: apiKey,
              style: inputStyle,
              onChange: (event) => setApiKey(event.target.value)
            })
          ),
          h(
            "label",
            { style: { display: "grid", fontSize: 13, gap: 6 } },
            "模型",
            h("input", {
              type: "text",
              value: model,
              style: inputStyle,
              onChange: (event) => setModel(event.target.value)
            })
          ),
          h(
            "button",
            {
              type: "button",
              disabled: busy || !apiKey.trim() || !model.trim(),
              style: buttonStyle,
              onClick: () => void save()
            },
            busy ? "保存中…" : "保存总结设置"
          ),
          message &&
            h(
              "div",
              {
                role: "status",
                style: {
                  color: message.startsWith("已保存")
                    ? "var(--dsw-alias-state-success-primary)"
                    : "var(--dsw-alias-state-error-primary)",
                  fontSize: 13
                }
              },
              message
            )
        );
      }

      function HandoffSummaryPanel({ handoff, loadDraft, onClose, projectPath }) {
        const [message, setMessage] = useState("");
        const load = () => {
          const result = loadDraft({
            handoffId: `dsh-live-${Date.now()}`,
            objective: handoff.objective,
            projectPath,
            prompt: formatHandoffPrompt(handoff),
            receivedAt: new Date().toISOString(),
            sourceProvider: "DeepSeek",
            state: "received",
            title: handoff.title
          });
          setMessage(
            result.ok
              ? "已载入当前 DSH 草稿，请检查后发送。"
              : result.message
          );
        };
        return h(
          "aside",
          {
            "aria-label": "SpecsRelay 需求总结",
            style: {
              background: "var(--dsw-alias-bg-layer-1)",
              border: "1px solid var(--dsw-alias-border-subtle)",
              borderRadius: 12,
              display: "grid",
              gap: 14,
              maxHeight: "100%",
              minHeight: 0,
              overflow: "auto",
              padding: 16
            }
          },
          h(
            "header",
            { style: { display: "flex", gap: 10, justifyContent: "space-between" } },
            h("strong", null, "结构化需求总结"),
            h(
              "button",
              {
                type: "button",
                style: { ...buttonStyle, minHeight: 28, padding: "3px 9px" },
                onClick: onClose
              },
              "关闭"
            )
          ),
          h("h3", { style: { fontSize: 18, margin: 0 } }, handoff.title),
          h(
            "section",
            { style: { display: "grid", gap: 6 } },
            h("strong", { style: { fontSize: 13 } }, "目标"),
            h(
              "p",
              {
                style: {
                  color: "var(--dsw-alias-text-secondary)",
                  lineHeight: 1.6,
                  margin: 0
                }
              },
              handoff.objective
            )
          ),
          h(SummarySection, { label: "已确认决策", values: handoff.decisions }),
          h(SummarySection, { label: "验收标准", values: handoff.acceptance_criteria }),
          h(SummarySection, { label: "约束", values: handoff.constraints }),
          h(SummarySection, { label: "未解决问题", values: handoff.open_questions }),
          h(
            "button",
            { type: "button", style: buttonStyle, onClick: load },
            "载入当前 DSH 草稿"
          ),
          message &&
            h(
              "div",
              {
                role: "status",
                style: {
                  color: message.startsWith("已载入")
                    ? "var(--dsw-alias-state-success-primary)"
                    : "var(--dsw-alias-state-error-primary)",
                  fontSize: 13
                }
              },
              message
            )
        );
      }

      function SpecsRelayDeepSeekView({
        loadDraft,
        onClose,
        sessionId,
        standalone = false,
        useSessions
      }) {
        const [bridgeStatus, setBridgeStatus] = useState("checking");
        const [busy, setBusy] = useState("");
        const [capture, setCapture] = useState(null);
        const [frameKey, setFrameKey] = useState(0);
        const [message, setMessage] = useState("");
        const [organizerReady, setOrganizerReady] = useState(false);
        const [sidePanel, setSidePanel] = useState("");
        const [summary, setSummary] = useState(null);
        const state = useInbox();
        const currentWorkspace = useSessions(
          (sessions) => sessions.byId[sessionId]?.cwd || ""
        );
        useEffect(() => {
          let active = true;
          requestBridge("ping", {}, 2500)
            .then((result) => {
              if (active) {
                setBridgeStatus("ready");
                setOrganizerReady(Boolean(result.organizer?.configured));
              }
            })
            .catch(() => {
              if (active) setBridgeStatus("missing");
            });
          return () => {
            active = false;
          };
        }, []);
        const sorted = useMemo(
          () => [...state.items].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
          [state.items]
        );
        const captureConversation = async () => {
          const result = await requestBridge("capture");
          setCapture(result);
          return result;
        };
        const onCapture = async () => {
          setBusy("capture");
          setMessage("");
          try {
            await captureConversation();
            setSidePanel("context");
            setMessage("已获取当前 DeepSeek 完整对话。");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : String(error));
          } finally {
            setBusy("");
          }
        };
        const onSummarize = async () => {
          if (!organizerReady) {
            setSidePanel("settings");
            setMessage("请先配置 DeepSeek 需求总结 API。");
            return;
          }
          setBusy("summary");
          setMessage("");
          try {
            const currentCapture = capture || (await captureConversation());
            const result = await requestBridge(
              "organize",
              { conversation: currentCapture.conversation },
              190000
            );
            setSummary(result.handoff);
            setSidePanel("summary");
            setMessage(`已由 ${result.provider} · ${result.model} 完成需求总结。`);
          } catch (error) {
            setMessage(error instanceof Error ? error.message : String(error));
          } finally {
            setBusy("");
          }
        };
        const toggleInbox = () => {
          const next = sidePanel === "inbox" ? "" : "inbox";
          setSidePanel(next);
          if (next === "inbox") void inbox.refresh();
        };
        return h(
          "section",
          {
            "aria-label": "SpecsRelay DeepSeek 网页",
            style: {
              color: "var(--dsw-alias-text-primary)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              height: standalone ? "100vh" : "calc(100vh - 190px)",
              minHeight: 520,
              minWidth: 0,
              padding: standalone ? 16 : "0 16px 16px"
            }
          },
          h(
            "header",
            {
              style: {
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "space-between"
              }
            },
            h(
              "div",
              { style: { minWidth: 0 } },
              h("strong", null, "DeepSeek 网页"),
              h(
                "div",
                {
                  title: currentWorkspace,
                  style: {
                    color: "var(--dsw-alias-text-tertiary)",
                    fontSize: 12,
                    marginTop: 3,
                    maxWidth: "min(62vw, 720px)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                currentWorkspace
                  ? `当前 DSH 项目：${currentWorkspace}`
                  : "当前 DSH 会话尚未关联项目"
              )
            ),
            h(
              "div",
              { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
              h(
                "button",
                {
                  type: "button",
                  disabled: bridgeStatus !== "ready" || Boolean(busy),
                  style: {
                    ...buttonStyle,
                    cursor:
                      bridgeStatus === "ready" && !busy ? "pointer" : "not-allowed",
                    opacity: bridgeStatus === "ready" && !busy ? 1 : 0.55
                  },
                  onClick: () => void onCapture()
                },
                busy === "capture" ? "获取中…" : "获取当前对话"
              ),
              h(
                "button",
                {
                  type: "button",
                  disabled: bridgeStatus !== "ready" || Boolean(busy),
                  style: {
                    ...buttonStyle,
                    cursor:
                      bridgeStatus === "ready" && !busy ? "pointer" : "not-allowed",
                    opacity: bridgeStatus === "ready" && !busy ? 1 : 0.55
                  },
                  onClick: () => void onSummarize()
                },
                busy === "summary" ? "总结中…" : "总结为需求"
              ),
              h(
                "button",
                {
                  type: "button",
                  style: buttonStyle,
                  onClick: toggleInbox
                },
                sidePanel === "inbox"
                  ? "关闭交接记录"
                  : `交接记录${state.items.length ? ` ${state.items.length}` : ""}`
              ),
              h(
                "button",
                {
                  type: "button",
                  style: buttonStyle,
                  onClick: () => setFrameKey((value) => value + 1)
                },
                "刷新网页"
              ),
              onClose &&
                h(
                  "button",
                  {
                    type: "button",
                    style: buttonStyle,
                    onClick: onClose
                  },
                  "关闭"
                )
            )
          ),
          h(
            "div",
            {
              role: "status",
              style: {
                alignItems: "center",
                background: "var(--dsw-alias-bg-layer-1)",
                borderRadius: 8,
                color:
                  message && !message.startsWith("已")
                    ? "var(--dsw-alias-state-error-primary)"
                    : "var(--dsw-alias-text-secondary)",
                display: "flex",
                flexWrap: "wrap",
                fontSize: 12,
                gap: 8,
                justifyContent: "space-between",
                minHeight: 30,
                padding: "5px 10px"
              }
            },
            h(
              "span",
              null,
              bridgeStatus === "checking"
                ? "正在连接 SpecsRelay DSH 浏览器桥接…"
                : bridgeStatus === "ready"
                  ? message || "SpecsRelay 已就绪；对话只会在你点击后获取。"
                  : "未检测到 SpecsRelay DSH 浏览器桥接，请重新加载浏览器扩展和当前页面。"
            ),
            bridgeStatus === "ready" &&
              h(
                "button",
                {
                  type: "button",
                  style: { ...buttonStyle, minHeight: 24, padding: "2px 8px" },
                  onClick: () =>
                    setSidePanel(sidePanel === "settings" ? "" : "settings")
                },
                organizerReady ? "总结设置" : "配置总结模型"
              ),
            bridgeStatus === "missing" &&
              h(
                "button",
                {
                  type: "button",
                  style: { ...buttonStyle, minHeight: 24, padding: "2px 8px" },
                  onClick: () =>
                    window.open(DEEPSEEK_URL, "_blank", "noopener,noreferrer")
                },
                "备用：新页打开"
              )
          ),
          h(
            "div",
            {
              style: {
                display: "grid",
                flex: "1 1 auto",
                gap: 10,
                gridTemplateColumns: sidePanel
                  ? "minmax(0, 1fr) minmax(320px, 420px)"
                  : "minmax(0, 1fr)",
                minHeight: 0
              }
            },
            h(
              "div",
              {
                style: {
                  border: "1px solid var(--dsw-alias-border-subtle)",
                  borderRadius: 12,
                  minHeight: 0,
                  overflow: "hidden"
                }
              },
              h("iframe", {
                key: frameKey,
                src: DEEPSEEK_URL,
                title: "DeepSeek 网页端",
                allow: "clipboard-read; clipboard-write",
                referrerPolicy: "strict-origin-when-cross-origin",
                style: {
                  background: "#fff",
                  border: 0,
                  display: "block",
                  height: "100%",
                  minHeight: 500,
                  width: "100%"
                }
              })
            ),
            sidePanel === "settings" &&
              h(OrganizerSettingsPanel, {
                onClose: () => setSidePanel(""),
                onConfigured: (result) => {
                  setOrganizerReady(true);
                  setMessage(`已配置 ${result.provider} · ${result.model}。`);
                }
              }),
            sidePanel === "context" &&
              capture &&
              h(CapturedContextPanel, {
                capture,
                onClose: () => setSidePanel("")
              }),
            sidePanel === "summary" &&
              summary &&
              h(HandoffSummaryPanel, {
                handoff: summary,
                loadDraft,
                onClose: () => setSidePanel(""),
                projectPath: currentWorkspace
              }),
            sidePanel === "inbox" &&
              h(
                "aside",
                {
                  "aria-label": "SpecsRelay 交接记录",
                  style: {
                    background: "var(--dsw-alias-bg-layer-1)",
                    border: "1px solid var(--dsw-alias-border-subtle)",
                    borderRadius: 12,
                    display: "grid",
                    gap: 12,
                    maxHeight: "100%",
                    minHeight: 0,
                    overflow: "auto",
                    padding: 14
                  }
                },
                h(
                  "header",
                  {
                    style: {
                      alignItems: "center",
                      display: "flex",
                      gap: 10,
                      justifyContent: "space-between"
                    }
                  },
                  h("strong", null, "交接记录"),
                  h(
                    "button",
                    {
                      type: "button",
                      style: { ...buttonStyle, minHeight: 28, padding: "3px 9px" },
                      onClick: () => void inbox.refresh()
                    },
                    state.loading ? "刷新中…" : "刷新"
                  )
                ),
                state.error &&
                  h(
                    "div",
                    {
                      role: "alert",
                      style: { color: "var(--dsw-alias-state-error-primary)" }
                    },
                    `无法读取收件箱：${state.error}`
                  ),
                !state.loading && sorted.length === 0
                  ? h(
                      "section",
                      {
                        style: {
                          border: "1px dashed var(--dsw-alias-border-subtle)",
                          borderRadius: 10,
                          color: "var(--dsw-alias-text-tertiary)",
                          padding: 24,
                          textAlign: "center"
                        }
                      },
                      "暂无已整理的交接记录。"
                    )
                  : h(
                      "section",
                      { style: { display: "grid", gap: 12 } },
                      ...sorted.map((item) =>
                        h(InboxCard, {
                          key: item.handoffId,
                          item,
                          loadDraft
                        })
                      )
                    )
              )
          ),
          h(
            "p",
            {
              style: {
                color: "var(--dsw-alias-text-tertiary)",
                fontSize: 12,
                margin: 0
              }
            },
            "DeepSeek 登录状态由当前浏览器管理。SpecsRelay 只在你点击“获取当前对话”或“总结为需求”后读取当前会话；新页入口仅作为桥接不可用时的备用方案。"
          )
        );
      }

      function SpecsRelayQuickLoad({ loadLatest }) {
        const [status, setStatus] = useState("DeepSeek Relay");
        const onClick = async () => {
          setStatus("读取中…");
          try {
            const item = await inbox.latest();
            if (!item) {
              setStatus("暂无新需求");
              return;
            }
            const result = loadLatest(item);
            if (!result.ok) {
              setStatus("请先切换项目");
              return;
            }
            try {
              await inbox.receipt(item, result.sessionId);
              setStatus("已载入，请检查");
            } catch {
              setStatus("已载入，回执失败");
            }
          } catch {
            setStatus("读取失败");
          }
        };
        return h(
          "button",
          {
            type: "button",
            onClick,
            title: "载入最近的 SpecsRelay for DeepSeek 需求",
            style: { ...buttonStyle, fontSize: 12, minHeight: 28, padding: "3px 8px" }
          },
          status
        );
      }

      const inject = ["slots", "sessions", "conversation"];

      function apply(ctx) {
        const loadCurrent = (item) => {
          const sessionId = ctx.sessions.list.getSnapshot().current;
          if (!sessionId) {
            return { ok: false, message: "请先在 DSH 中选择项目并创建会话。" };
          }
          return loadIntoSession(ctx, sessionId, item);
        };
        ctx.effect(
          () =>
            ctx.slots.inject("sidebar.footer.action", () =>
              ctx.slots.register(
                {
                  name: "sidebar.footer.action",
                  id: "specsrelay-deepseek",
                  order: -10,
                  inject: () => ({ loadDraft: loadCurrent })
                },
                SpecsRelayShortcut
              )
            ),
          "specsrelay-deepseek: sidebar tab shortcut"
        );
        ctx.effect(
          () =>
            ctx.slots.inject("conversation.view", () =>
              ctx.slots.register(
                {
                  name: "conversation.view",
                  id: "specsrelay-deepseek",
                  order: 20,
                  label: "DeepSeek",
                  inject: (sessionId) => ({
                    loadDraft: (item) => loadIntoSession(ctx, sessionId, item)
                  })
                },
                SpecsRelayDeepSeekView
              )
            ),
          "specsrelay-deepseek: DeepSeek web conversation view"
        );
        ctx.effect(
          () =>
            ctx.slots.inject("conversation.input.right", () =>
              ctx.slots.register(
                {
                  name: "conversation.input.right",
                  id: "specsrelay-deepseek",
                  order: 40,
                  inject: (sessionId) => ({
                    loadLatest: (item) => loadIntoSession(ctx, sessionId, item)
                  })
                },
                SpecsRelayQuickLoad
              )
            ),
          "specsrelay-deepseek: composer shortcut"
        );
      }

      return { apply, inject };
    }
  });
})();
