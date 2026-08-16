(function registerSpecsRelayDeepSeekClient() {
  const PLUGIN_ID = "@specsrelay/dsh-deepseek";
  globalThis.__ModuleLoader__.load({
    id: PLUGIN_ID,
    factory: (require) => {
      const React = require("react");
      const {
        createElement: h,
        useMemo,
        useState,
        useSyncExternalStore
      } = React;

      const API = "/specsrelay/v1";
      const DEEPSEEK_URL = "https://chat.deepseek.com/";
      const MAX_IMPORTED_CONTEXT_CHARS = 400000;
      const SPECSRELAY_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAGGElEQVR42s2Xf2xVZxnHP897zj33Z7m3hd16W1rGjyEwhamkWn6YkVE7/L3gsikzJm5CdOBiFJeYxcSYkcBMHX+YBRKjhh9h0zm00VHNmBAGcRmbpTBG+TXWUtpbaGlv7217zz3v6x/3UqDrLbSSuDe5ObnJe87zfb7v83yf7wv/5yV3aM94y0wWmH0HE7WLJXLL7KLRGTGiZnIs9Inp67twdVQ8Mx6Akf9l8cqnsOXbglQZgwV5EAIYbTBaX99txkzNgHggFzFmV293RwOgR4OQUcEFkFg88aJl2auzAxm8rAtyfZsxBtvv4Av6McaMldTNOEQQUWgv19jbfWk14BVeMKMB2EAuVp74oaXsre7QcLZ62SK7bM50yQ1lEaXAGCy/j853WulqOYPtOJhCcOPp8YrQVcryay/3dG/3pS3XYo3JQNnHKptzQ+6C0lkVZk3TVssJBTAYjM5nawccuo+f5XfL16HdHKaQpX9KOM+UGZMNLSIYo8/2Ji8tKLAAYKwbiyM6Y0ZUefqZ3FA2NHVutdx9/6el8fFn8UcjHPzlb7EdH68/s40Fj6xk1gOLufeROuavXoETDpI8dgaQPFNjL2UQxy4Jb88ODKSvJX9zqxkjgAiCznmEy8uo3fgYsZkJpkyPE46XEptViWVb9J67SG7IJRCLsHLLeqqX38ffn3wOy3LGFwVzc0d9qNeNNlgBh95zF2k71MycLy6h53Qbls8mc/kqgWiEYzub+MdPtuIE/OSGshzdvpc1+57n/Gtv0bK7iWBpCbp4TTAuAIxB+WwyyV7e2LwDlLBvQwPZVBpl2xijcQeHiVbEGUinsUIOHUeO09p4iDmrajm249UJSd+YB2Y8DycSpK+ti8YnNjF4pQ9E8HI5tKcJloS5cvkyy5csobamhkE9SDQxjWx6sFBQMiGJLNbAuOkhRMAOOhhtUJbCsm2SyW4eWLGCl/bsoiQYZs1T38fESzj1/B4sxy7ow//AwAgGJaAEow2iFNr16LnYRX1dHX98cTfRkgh/2vsKD3/hy+id/6Z1/5v4I6G8St4JANdkRJTCzQwSrSqn5sffpOHXv+I/7zTz0OqH+c0L2/hczWLWfv3RfOYysbFxSwAigpd1Cd9VyjdeepZ7H1rB2g1PEovF+Pi8eezZvQNRirUb1uMEAohSiJX/qcJzcjUwcgyKbCrD53/+XXKuy8tf/Sl9/X08vm4dhw8eoD/Vz8r6VbS83UwkGCKdyuRLsMCEKIUTDhadu7cEYIxG+WwSn5nHqb8cJHM1RbyqghMn3qVmyTIs2+LkiXf5xIPLiFSXo90cooTcsAuAmx6k/XBLYXrKJBiQvCqmO3soX3gP2suR7ukj5A9w+r1W3MwQM2sXsmrb0/S0foAd8JNND1K1dCHByBQAGn+wiebf/w1/LALamygDYDk2R7fv5dG/Pkd9w49o2bkPRCizbbKpAeKfmksm2cupxkP4gn5ECZdPnscdHKZ62X2Uzq5Ee94kj0BrnEiI9iMtND6xift/8T0++a16tOfl2fE8gmVR9v/sBVp2NRGdHkf5LBKL53Pyz6/z/v6jzKqrKdodt+X78iCCvPfKAc6/9haxmQmUZYEI2VSa2Q/WgsDSjY+RPH6WkoppXDndRt3m9bz/r7fxsi5yWwBETDF7Y7TBHw2jcx7dJ86N6MNgXz/T5t/NlMo4hzb/gdl1n6W/PUnbG8fob0viCwcoX3TPiDhJPsaHABhA+i5cSMXiFZ1KJGbyemrdPCM0ohS+UKDwMQUCqfZuFn3nS4itcMIhbL+PqXOrGU6lqVq6iHP/fNMoyzIgXQOdnb03GiFrFBgvGC4JKmXVG2PcokJV4MkYg2XbpDq66Wn9AF8oSCbZw0BXL0P9aTw3R/vhFnP21SOuEwr6tPYahtKpA4VYupgptUrvSrysLPsrxujbGiyiBDczTN47yghIg8GyLfwlETztNV2dEvoaZ864xUzpjb7dKi1PbBQjawxMN6OOohiIvO+7/lWV934dxtO7e5IdWwB3PFs+1uVBIonE1LDWamCCd5IIkBYxA52dV67RfUsP/1G8mskdAmD4qK7/Aogcgw2IpLcjAAAAAElFTkSuQmCC";
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
            const response = await fetch(`${API}/handoffs`, {
              cache: "no-store"
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || `HTTP ${response.status}`);
            }
            const items = Array.isArray(data.items) ? data.items : [];
            publish({ items, loading: false, error: "" });
            return items;
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
          if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
          }
          return data.item || null;
        },
        async receipt(item, sessionId) {
          const response = await fetch(`${API}/receipts`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ handoffId: item.handoffId, sessionId })
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
          }
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

      function useInbox() {
        return useSyncExternalStore(
          inbox.subscribe,
          inbox.getSnapshot,
          inbox.getSnapshot
        );
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

      function normalizedPath(value) {
        const text = String(value || "")
          .trim()
          .replaceAll("\\", "/")
          .replace(/\/+$/, "");
        return /^[A-Za-z]:\//.test(text) ? text.toLowerCase() : text;
      }

      function relativeTime(value) {
        const time = Date.parse(value);
        return Number.isFinite(time) ? new Date(time).toLocaleString() : "";
      }

      function normalizeImportedText(value) {
        const text = String(value || "").trim();
        if (!text) throw new Error("没有读取到对话内容，请复制后重试或手动粘贴。");
        if (text.length > MAX_IMPORTED_CONTEXT_CHARS) {
          throw new Error(
            `导入内容不能超过 ${MAX_IMPORTED_CONTEXT_CHARS.toLocaleString()} 个字符。`
          );
        }
        return text;
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

      const primaryButtonStyle = {
        ...buttonStyle,
        background: "var(--dsw-alias-brand-primary, #4d6bfe)",
        borderColor: "transparent",
        color: "#fff"
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

      function HandoffSummaryPanel({ handoff, loadDraft, onBack, projectPath }) {
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
          "section",
          { style: { display: "grid", gap: 14 } },
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
            h("strong", null, "结构化需求总结"),
            h(
              "button",
              {
                type: "button",
                style: { ...buttonStyle, minHeight: 28, padding: "3px 9px" },
                onClick: onBack
              },
              "返回"
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
          h(SummarySection, {
            label: "验收标准",
            values: handoff.acceptance_criteria
          }),
          h(SummarySection, { label: "约束", values: handoff.constraints }),
          h(SummarySection, {
            label: "未解决问题",
            values: handoff.open_questions
          }),
          h(
            "button",
            { type: "button", style: primaryButtonStyle, onClick: load },
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

      function ImportedContextPanel({ imported, onClear }) {
        if (!imported) {
          return h(
            "section",
            {
              style: {
                border: "1px dashed var(--dsw-alias-border-subtle)",
                borderRadius: 10,
                color: "var(--dsw-alias-text-tertiary)",
                lineHeight: 1.6,
                padding: 16
              }
            },
            "尚未导入对话。请先在左侧 DeepSeek 页面复制需要交接的内容。"
          );
        }
        const source = imported.source === "clipboard" ? "剪贴板" : "手动粘贴";
        const preview = imported.text.slice(0, 900);
        return h(
          "section",
          {
            "aria-label": "已导入的 DeepSeek 对话",
            style: {
              background: "var(--dsw-alias-bg-layer-2)",
              borderRadius: 10,
              display: "grid",
              gap: 9,
              padding: 12
            }
          },
          h(
            "div",
            {
              style: {
                alignItems: "center",
                display: "flex",
                gap: 8,
                justifyContent: "space-between"
              }
            },
            h("strong", null, "已导入对话"),
            h(
              "button",
              {
                type: "button",
                style: { ...buttonStyle, minHeight: 26, padding: "2px 8px" },
                onClick: onClear
              },
              "清除"
            )
          ),
          h(
            "div",
            {
              style: {
                color: "var(--dsw-alias-text-secondary)",
                fontSize: 12
              }
            },
            `${source} · ${imported.text.length.toLocaleString()} 字符 · ${relativeTime(
              imported.importedAt
            )}`
          ),
          h(
            "pre",
            {
              style: {
                color: "var(--dsw-alias-text-tertiary)",
                fontFamily: "inherit",
                fontSize: 12,
                lineHeight: 1.5,
                margin: 0,
                maxHeight: 180,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }
            },
            preview,
            imported.text.length > preview.length ? "\n…" : ""
          )
        );
      }

      function InboxCard({ item, loadDraft }) {
        const [message, setMessage] = useState("");
        const load = async () => {
          const result = loadDraft(item);
          if (!result.ok) {
            setMessage(result.message);
            return;
          }
          try {
            await inbox.receipt(item, result.sessionId);
            setMessage("已载入当前会话草稿，请检查后发送。");
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
              borderRadius: 10,
              display: "grid",
              gap: 9,
              padding: 12
            }
          },
          h("strong", null, item.title),
          h(
            "div",
            {
              style: {
                color: "var(--dsw-alias-text-tertiary)",
                fontSize: 12,
                wordBreak: "break-all"
              }
            },
            `${item.sourceProvider || "DeepSeek"} · ${relativeTime(item.receivedAt)}`
          ),
          h(
            "p",
            {
              style: {
                color: "var(--dsw-alias-text-secondary)",
                fontSize: 13,
                lineHeight: 1.55,
                margin: 0
              }
            },
            item.objective
          ),
          h(
            "button",
            { type: "button", style: buttonStyle, onClick: () => void load() },
            item.state === "loaded" ? "重新载入草稿" : "载入当前会话草稿"
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
                  fontSize: 12
                }
              },
              message
            )
        );
      }

      function InboxPanel({ items, loadDraft, loading, onBack, onRefresh }) {
        return h(
          "section",
          { style: { display: "grid", gap: 12 } },
          h(
            "header",
            {
              style: {
                alignItems: "center",
                display: "flex",
                gap: 8,
                justifyContent: "space-between"
              }
            },
            h("strong", null, "交接记录"),
            h(
              "div",
              { style: { display: "flex", gap: 6 } },
              h(
                "button",
                {
                  type: "button",
                  style: { ...buttonStyle, minHeight: 28, padding: "3px 8px" },
                  onClick: onRefresh
                },
                loading ? "刷新中…" : "刷新"
              ),
              h(
                "button",
                {
                  type: "button",
                  style: { ...buttonStyle, minHeight: 28, padding: "3px 8px" },
                  onClick: onBack
                },
                "返回"
              )
            )
          ),
          items.length === 0
            ? h(
                "div",
                {
                  style: {
                    border: "1px dashed var(--dsw-alias-border-subtle)",
                    borderRadius: 10,
                    color: "var(--dsw-alias-text-tertiary)",
                    padding: 20,
                    textAlign: "center"
                  }
                },
                loading ? "正在读取…" : "暂无已整理的交接记录。"
              )
            : h(
                "div",
                { style: { display: "grid", gap: 10 } },
                ...items.map((item) =>
                  h(InboxCard, {
                    key: item.handoffId,
                    item,
                    loadDraft
                  })
                )
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
        const [busy, setBusy] = useState("");
        const [frameKey, setFrameKey] = useState(0);
        const [imported, setImported] = useState(null);
        const [manualOpen, setManualOpen] = useState(false);
        const [manualText, setManualText] = useState("");
        const [message, setMessage] = useState("");
        const [messageKind, setMessageKind] = useState("info");
        const [panel, setPanel] = useState("home");
        const [summary, setSummary] = useState(null);
        const state = useInbox();
        const currentWorkspace = useSessions(
          (sessions) => sessions.byId[sessionId]?.cwd || ""
        );
        const sorted = useMemo(
          () =>
            [...state.items].sort((left, right) =>
              right.receivedAt.localeCompare(left.receivedAt)
            ),
          [state.items]
        );

        const acceptImportedText = (value, source) => {
          const text = normalizeImportedText(value);
          setImported({ text, source, importedAt: new Date().toISOString() });
          setSummary(null);
          setPanel("home");
          setManualOpen(false);
          setManualText("");
          setMessageKind("success");
          setMessage(`已从${source === "clipboard" ? "剪贴板" : "手动粘贴"}导入对话。`);
        };

        const importClipboard = async () => {
          setBusy("clipboard");
          setMessage("");
          try {
            if (!navigator.clipboard?.readText) {
              throw new Error("当前浏览器不支持直接读取剪贴板。");
            }
            acceptImportedText(await navigator.clipboard.readText(), "clipboard");
          } catch (error) {
            setManualOpen(true);
            setMessageKind("error");
            setMessage(
              `${error instanceof Error ? error.message : String(error)} 请改用手动粘贴。`
            );
          } finally {
            setBusy("");
          }
        };

        const summarize = async () => {
          if (!imported) return;
          setBusy("summary");
          setMessage("");
          try {
            const response = await fetch(`${API}/organize`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ sessionId, text: imported.text }),
              signal: AbortSignal.timeout(190000)
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || `HTTP ${response.status}`);
            }
            setSummary(data.handoff);
            setPanel("summary");
            setMessageKind("success");
            setMessage(`已由 DSH 的 ${data.provider} · ${data.model} 完成需求总结。`);
          } catch (error) {
            setMessageKind("error");
            setMessage(error instanceof Error ? error.message : String(error));
          } finally {
            setBusy("");
          }
        };

        const openInbox = () => {
          setPanel("inbox");
          void inbox.refresh();
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
              { style: { display: "flex", gap: 8 } },
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
                  { type: "button", style: buttonStyle, onClick: onClose },
                  "关闭"
                )
            )
          ),
          h(
            "div",
            {
              style: {
                display: "grid",
                flex: "1 1 auto",
                gap: 10,
                gridTemplateColumns: "minmax(0, 1fr) minmax(340px, 400px)",
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
            h(
              "aside",
              {
                "aria-label": "SpecsRelay 常驻侧栏",
                style: {
                  background: "var(--dsw-alias-bg-layer-1)",
                  border: "1px solid var(--dsw-alias-border-subtle)",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  overflow: "hidden"
                }
              },
              h(
                "header",
                {
                  style: {
                    alignItems: "center",
                    borderBottom: "1px solid var(--dsw-alias-border-subtle)",
                    display: "flex",
                    gap: 10,
                    padding: "12px 14px"
                  }
                },
                h("img", {
                  src: SPECSRELAY_ICON,
                  alt: "",
                  "aria-hidden": true,
                  draggable: false,
                  style: { borderRadius: 6, height: 26, width: 26 }
                }),
                h(
                  "div",
                  null,
                  h("strong", null, "SpecsRelay"),
                  h(
                    "div",
                    {
                      style: {
                        color: "var(--dsw-alias-text-tertiary)",
                        fontSize: 11,
                        marginTop: 2
                      }
                    },
                    "DeepSeek → DSH 需求交接"
                  )
                )
              ),
              h(
                "div",
                {
                  style: {
                    display: "grid",
                    flex: "1 1 auto",
                    gap: 12,
                    overflow: "auto",
                    padding: 14
                  }
                },
                panel === "summary" && summary
                  ? h(HandoffSummaryPanel, {
                      handoff: summary,
                      loadDraft,
                      onBack: () => setPanel("home"),
                      projectPath: currentWorkspace
                    })
                  : panel === "inbox"
                    ? h(InboxPanel, {
                        items: sorted,
                        loadDraft,
                        loading: state.loading,
                        onBack: () => setPanel("home"),
                        onRefresh: () => void inbox.refresh()
                      })
                    : h(
                        React.Fragment,
                        null,
                        h(
                          "p",
                          {
                            style: {
                              color: "var(--dsw-alias-text-secondary)",
                              fontSize: 13,
                              lineHeight: 1.6,
                              margin: 0
                            }
                          },
                          "在左侧 DeepSeek 中复制对话，再导入此侧栏。SpecsRelay 会使用 DSH 已配置的 DeepSeek 模型整理需求。"
                        ),
                        h(
                          "div",
                          {
                            style: {
                              display: "grid",
                              gap: 8,
                              gridTemplateColumns: "1fr 1fr"
                            }
                          },
                          h(
                            "button",
                            {
                              type: "button",
                              disabled: Boolean(busy),
                              style: buttonStyle,
                              onClick: () => void importClipboard()
                            },
                            busy === "clipboard" ? "读取中…" : "从剪贴板导入"
                          ),
                          h(
                            "button",
                            {
                              type: "button",
                              disabled: Boolean(busy),
                              style: buttonStyle,
                              onClick: () => setManualOpen((value) => !value)
                            },
                            manualOpen ? "收起粘贴框" : "手动粘贴"
                          )
                        ),
                        manualOpen &&
                          h(
                            "section",
                            { style: { display: "grid", gap: 8 } },
                            h("textarea", {
                              value: manualText,
                              placeholder: "把 DeepSeek 对话或分享内容粘贴到这里…",
                              rows: 9,
                              style: {
                                background: "var(--dsw-alias-bg-layer-2)",
                                border: "1px solid var(--dsw-alias-border-subtle)",
                                borderRadius: 8,
                                color: "var(--dsw-alias-text-primary)",
                                font: "inherit",
                                lineHeight: 1.5,
                                padding: 10,
                                resize: "vertical",
                                width: "100%"
                              },
                              onChange: (event) => setManualText(event.target.value)
                            }),
                            h(
                              "button",
                              {
                                type: "button",
                                style: buttonStyle,
                                onClick: () => {
                                  try {
                                    acceptImportedText(manualText, "manual");
                                  } catch (error) {
                                    setMessageKind("error");
                                    setMessage(
                                      error instanceof Error
                                        ? error.message
                                        : String(error)
                                    );
                                  }
                                }
                              },
                              "导入粘贴内容"
                            )
                          ),
                        h(ImportedContextPanel, {
                          imported,
                          onClear: () => {
                            setImported(null);
                            setSummary(null);
                            setMessage("");
                          }
                        }),
                        h(
                          "button",
                          {
                            type: "button",
                            disabled: !imported || Boolean(busy),
                            style: {
                              ...primaryButtonStyle,
                              cursor: imported && !busy ? "pointer" : "not-allowed",
                              opacity: imported && !busy ? 1 : 0.5
                            },
                            onClick: () => void summarize()
                          },
                          busy === "summary" ? "总结中…" : "总结为需求"
                        ),
                        h(
                          "button",
                          {
                            type: "button",
                            style: buttonStyle,
                            onClick: openInbox
                          },
                          `交接记录${state.items.length ? ` ${state.items.length}` : ""}`
                        )
                      ),
                state.error && panel === "inbox" &&
                  h(
                    "div",
                    {
                      role: "alert",
                      style: {
                        color: "var(--dsw-alias-state-error-primary)",
                        fontSize: 12
                      }
                    },
                    `无法读取交接记录：${state.error}`
                  ),
                message &&
                  h(
                    "div",
                    {
                      role: "status",
                      style: {
                        color:
                          messageKind === "error"
                            ? "var(--dsw-alias-state-error-primary)"
                            : messageKind === "success"
                              ? "var(--dsw-alias-state-success-primary)"
                              : "var(--dsw-alias-text-secondary)",
                        fontSize: 12,
                        lineHeight: 1.5
                      }
                    },
                    message
                  )
              ),
              h(
                "footer",
                {
                  style: {
                    borderTop: "1px solid var(--dsw-alias-border-subtle)",
                    color: "var(--dsw-alias-text-tertiary)",
                    fontSize: 11,
                    lineHeight: 1.45,
                    padding: "9px 14px"
                  }
                },
                "导入内容先保存在当前浏览器内存；只有点击“总结为需求”后才会交给 DSH 的 DeepSeek 模型。"
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
            "DeepSeek 登录状态由当前浏览器管理。SpecsRelay 不会自动读取跨域网页；复制和导入均由你主动触发。"
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
            style: {
              ...buttonStyle,
              fontSize: 12,
              minHeight: 28,
              padding: "3px 8px"
            }
          },
          status
        );
      }

      const inject = ["slots", "sessions", "conversation"];

      function apply(ctx) {
        const loadCurrent = (item) => {
          const sessionId = ctx.sessions.list.getSnapshot().current;
          if (!sessionId) {
            return {
              ok: false,
              message: "请先在 DSH 中选择项目并创建会话。"
            };
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
