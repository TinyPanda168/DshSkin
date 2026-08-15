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

      function SpecsRelayInbox({ wide, loadDraft, useSessions }) {
        const [open, setOpen] = useState(false);
        const state = useInbox();
        const currentWorkspace = useSessions((sessions) => {
          const id = sessions.current;
          return id ? sessions.byId[id]?.cwd || "" : "";
        });
        useEffect(() => {
          if (open) void inbox.refresh();
        }, [open]);
        const sorted = useMemo(
          () => [...state.items].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
          [state.items]
        );
        return h(
          React.Fragment,
          null,
          h(
            "button",
            {
              type: "button",
              onClick: () => setOpen(true),
              title: "SpecsRelay for DeepSeek",
              "aria-label": "打开 SpecsRelay for DeepSeek",
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
                role: "dialog",
                "aria-modal": true,
                "aria-label": "SpecsRelay for DeepSeek 收件箱",
                style: {
                  background: "var(--dsw-alias-bg-base)",
                  color: "var(--dsw-alias-text-primary)",
                  inset: 0,
                  overflow: "auto",
                  position: "fixed",
                  zIndex: 1000
                }
              },
              h(
                "main",
                {
                  style: {
                    display: "grid",
                    gap: 18,
                    margin: "0 auto",
                    maxWidth: 1080,
                    padding: "32px clamp(20px, 5vw, 64px) 64px"
                  }
                },
                h(
                  "header",
                  {
                    style: {
                      alignItems: "flex-start",
                      display: "flex",
                      gap: 18,
                      justifyContent: "space-between"
                    }
                  },
                  h(
                    "div",
                    null,
                    h(
                      "div",
                      {
                        style: {
                          color: "var(--dsw-alias-text-tertiary)",
                          fontSize: 13,
                          marginBottom: 6
                        }
                      },
                      "DeepSeek-first requirement relay"
                    ),
                    h(
                      "h1",
                      { style: { fontSize: 28, margin: 0 } },
                      "SpecsRelay for DeepSeek"
                    ),
                    h(
                      "p",
                      {
                        style: {
                          color: "var(--dsw-alias-text-secondary)",
                          lineHeight: 1.6,
                          margin: "8px 0 0"
                        }
                      },
                      "接收经过整理和确认的需求，载入 DSH 草稿后由你最终检查并发送。"
                    )
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      style: buttonStyle,
                      onClick: () => setOpen(false)
                    },
                    "关闭"
                  )
                ),
                h(
                  "section",
                  {
                    style: {
                      background: "var(--dsw-alias-bg-layer-1)",
                      borderRadius: 12,
                      color: "var(--dsw-alias-text-secondary)",
                      display: "flex",
                      flexWrap: "wrap",
                      fontSize: 13,
                      gap: 10,
                      justifyContent: "space-between",
                      padding: "12px 14px"
                    }
                  },
                  h(
                    "span",
                    null,
                    currentWorkspace
                      ? `当前 DSH 项目：${currentWorkspace}`
                      : "当前尚未选择 DSH 项目"
                  ),
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
                          borderRadius: 14,
                          color: "var(--dsw-alias-text-tertiary)",
                          padding: 48,
                          textAlign: "center"
                        }
                      },
                      "暂无需求。请从 DeepSeek 网页中的 SpecsRelay 发送任务。"
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
                SpecsRelayInbox
              )
            ),
          "specsrelay-deepseek: sidebar inbox"
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
