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
      const MAX_REQUIREMENT_SOURCE_CHARS = 500000;
      const MAX_WORKSPACE_HISTORY = 3;
      const WORKSPACE_STORAGE_PREFIX = "specsrelay.dsh.workspace.v1:";
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
        if (text.length > MAX_REQUIREMENT_SOURCE_CHARS) {
          throw new Error(
            `DeepSeek 对话不能超过 ${MAX_REQUIREMENT_SOURCE_CHARS.toLocaleString()} 个字符。`
          );
        }
        return text;
      }

      function stableHash(value) {
        let hash = 0x811c9dc5;
        const source = String(value ?? "");
        for (let index = 0; index < source.length; index += 1) {
          hash ^= source.charCodeAt(index);
          hash = Math.imul(hash, 0x01000193);
        }
        return (hash >>> 0).toString(16).padStart(8, "0");
      }

      function normalizeSources(value) {
        if (!Array.isArray(value)) return [];
        const seen = new Set();
        const normalized = [];
        for (const item of value) {
          const transcript = String(item?.transcript || "").trim();
          if (!transcript || transcript.length > MAX_REQUIREMENT_SOURCE_CHARS) continue;
          const identity = `paste:${stableHash(transcript)}`;
          if (seen.has(identity)) continue;
          seen.add(identity);
          normalized.push({
            id: String(item?.id || `source_${stableHash(identity)}`).slice(0, 120),
            identity,
            kind: "paste",
            provider: String(item?.provider || "DeepSeek").slice(0, 120),
            title: String(item?.title || "DeepSeek 对话").slice(0, 500),
            transcript,
            primary: Boolean(item?.primary),
            created_at: item?.created_at || new Date().toISOString(),
            updated_at: item?.updated_at || new Date().toISOString()
          });
          break;
        }
        return normalized.map((source) => ({
          ...source,
          primary: true
        }));
      }

      function addRequirementSource(sources, text, sourceKind) {
        const transcript = normalizeImportedText(text);
        const identity = `paste:${stableHash(transcript)}`;
        const now = new Date().toISOString();
        const source = {
          id: `source_${stableHash(`${identity}:${now}`)}`,
          identity,
          kind: "paste",
          provider: "DeepSeek",
          title:
            sourceKind === "clipboard"
              ? "当前 DeepSeek 网页对话"
              : "手动粘贴的 DeepSeek 对话",
          transcript,
          primary: true,
          created_at: now,
          updated_at: now
        };
        return normalizeSources([source]);
      }

      function sourcesFingerprint(sources) {
        const normalized = normalizeSources(sources);
        return normalized.length
          ? `sources:${stableHash(
              JSON.stringify(
                normalized.map((source) => ({
                  id: source.id,
                  primary: source.primary,
                  hash: stableHash(source.transcript)
                }))
              )
            )}`
          : "";
      }

      function formatSourcesTranscript(sources) {
        return normalizeSources(sources)[0]?.transcript ?? "";
      }

      function normalizeWorkspace(value) {
        const source = value && typeof value === "object" ? value : {};
        return {
          sources: normalizeSources(source.sources),
          integratedFingerprint:
            typeof source.integratedFingerprint === "string"
              ? source.integratedFingerprint
              : "",
          handoff:
            source.handoff && typeof source.handoff === "object"
              ? source.handoff
              : null,
          answers: Array.isArray(source.answers)
            ? source.answers.map((answer) => String(answer || ""))
            : [],
          history: Array.isArray(source.history)
            ? source.history.slice(0, MAX_WORKSPACE_HISTORY)
            : []
        };
      }

      function workspaceSnapshot(sources, integratedFingerprint, handoff, answers) {
        return {
          savedAt: new Date().toISOString(),
          sources: normalizeSources(sources),
          integratedFingerprint,
          handoff,
          answers
        };
      }

      function snapshotHasContent(snapshot) {
        return Boolean(snapshot.sources.length || snapshot.handoff);
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

      function HandoffSummaryPanel({
        answers,
        busy,
        handoff,
        loadDraft,
        onAnswer,
        onApplyReview,
        onBack,
        onClarify,
        onReview,
        onRevise,
        projectPath,
        reviewResult,
        sourcesChanged
      }) {
        const [confirmed, setConfirmed] = useState(false);
        const [message, setMessage] = useState("");
        const [revisionInstruction, setRevisionInstruction] = useState("");
        const prompt = formatHandoffPrompt(handoff);
        const questions = Array.isArray(handoff.open_questions)
          ? handoff.open_questions
          : [];
        const ready =
          handoff.ready_for_execution === true &&
          questions.length === 0 &&
          !sourcesChanged;
        const load = () => {
          const result = loadDraft({
            handoffId: `dsh-live-${Date.now()}`,
            objective: handoff.objective,
            projectPath,
            prompt,
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
            "div",
            {
              style: {
                color: "var(--dsw-alias-text-tertiary)",
                fontSize: 12
              }
            },
            `风险：${handoff.risk_level || "未标注"} · ${
              sourcesChanged ? "来源已变化，需重新整合" : ready ? "可载入" : "待确认"
            }`
          ),
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
          h(
            "section",
            { style: { display: "grid", gap: 6 } },
            h("strong", { style: { fontSize: 13 } }, "背景"),
            h(
              "p",
              {
                style: {
                  color: "var(--dsw-alias-text-secondary)",
                  lineHeight: 1.6,
                  margin: 0
                }
              },
              handoff.context
            )
          ),
          h(SummarySection, { label: "已确认决策", values: handoff.decisions }),
          h(SummarySection, {
            label: "实施建议",
            values: handoff.implementation_plan
          }),
          h(SummarySection, {
            label: "验收标准",
            values: handoff.acceptance_criteria
          }),
          h(SummarySection, {
            label: "验证方式",
            values: handoff.verification_steps
          }),
          h(SummarySection, { label: "约束", values: handoff.constraints }),
          h(SummarySection, { label: "非目标", values: handoff.non_goals }),
          h(SummarySection, {
            label: "需要本地核查",
            values: handoff.local_context_needed
          }),
          h(SummarySection, {
            label: "未解决问题",
            values: handoff.open_questions
          }),
          questions.length > 0 &&
            h(
              "section",
              {
                "aria-label": "SpecsRelay 待确认问题",
                style: {
                  background: "var(--dsw-alias-bg-layer-2)",
                  borderRadius: 10,
                  display: "grid",
                  gap: 10,
                  padding: 12
                }
              },
              h("strong", null, "补充澄清"),
              h(
                "div",
                {
                  style: {
                    color: "var(--dsw-alias-text-secondary)",
                    fontSize: 12,
                    lineHeight: 1.5
                  }
                },
                "可以逐条在这里回答，或复制问题回到左侧 DeepSeek 继续讨论后重新导入。"
              ),
              ...questions.map((question, index) =>
                h(
                  "label",
                  { key: question, style: { display: "grid", gap: 6 } },
                  h("span", { style: { fontSize: 12 } }, `${index + 1}. ${question}`),
                  h("textarea", {
                    rows: 3,
                    value: answers[index] || "",
                    placeholder: "填写你的决定…",
                    style: {
                      background: "var(--dsw-alias-bg-base)",
                      border: "1px solid var(--dsw-alias-border-subtle)",
                      borderRadius: 8,
                      color: "var(--dsw-alias-text-primary)",
                      font: "inherit",
                      padding: 8,
                      resize: "vertical"
                    },
                    onChange: (event) => onAnswer(index, event.target.value)
                  })
                )
              ),
              h(
                "div",
                { style: { display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" } },
                h(
                  "button",
                  {
                    type: "button",
                    style: buttonStyle,
                    onClick: async () => {
                      const text = `为了把当前需求准确交给 Coding Agent，请继续基于上面的完整对话逐条确认以下问题，不要替我假设答案：\n\n${questions
                        .map((question, index) => `${index + 1}. ${question}`)
                        .join("\n")}`;
                      try {
                        await navigator.clipboard.writeText(text);
                        setMessage("待确认问题已复制。可粘贴到左侧 DeepSeek 继续讨论。");
                      } catch {
                        setMessage("浏览器未允许写入剪贴板，请手动复制问题。");
                      }
                    }
                  },
                  "复制问题到 DeepSeek"
                ),
                h(
                  "button",
                  {
                    type: "button",
                    disabled:
                      Boolean(busy) ||
                      questions.some((_, index) => !answers[index]?.trim()),
                    style: primaryButtonStyle,
                    onClick: onClarify
                  },
                  busy === "clarify" ? "重新整理中…" : "提交答案并重新整理"
                )
              )
            ),
          ready &&
            h(
              "button",
              {
                type: "button",
                disabled: Boolean(busy),
                style: buttonStyle,
                onClick: onReview
              },
              busy === "review"
                ? "三角色评审中…"
                : "三角色评审并增强（2 次模型调用）"
            ),
          ready &&
            h(
              "details",
              null,
              h("summary", { style: { cursor: "pointer", fontSize: 13 } }, "继续修订这份需求"),
              h(
                "div",
                { style: { display: "grid", gap: 8, marginTop: 9 } },
                h("textarea", {
                  rows: 4,
                  value: revisionInstruction,
                  placeholder: "例如：保留现有范围，但把离线恢复改成非目标。",
                  style: {
                    background: "var(--dsw-alias-bg-layer-2)",
                    border: "1px solid var(--dsw-alias-border-subtle)",
                    borderRadius: 8,
                    color: "var(--dsw-alias-text-primary)",
                    font: "inherit",
                    padding: 8,
                    resize: "vertical"
                  },
                  onChange: (event) => setRevisionInstruction(event.target.value)
                }),
                h(
                  "button",
                  {
                    type: "button",
                    disabled: Boolean(busy) || !revisionInstruction.trim(),
                    style: buttonStyle,
                    onClick: () => onRevise(revisionInstruction)
                  },
                  busy === "revision" ? "修订中…" : "按说明生成新版本"
                )
              )
            ),
          reviewResult &&
            h(
              "section",
              {
                "aria-label": "SpecsRelay 三角色评审结果",
                style: {
                  background: "var(--dsw-alias-bg-layer-2)",
                  borderRadius: 10,
                  display: "grid",
                  gap: 9,
                  padding: 12
                }
              },
              h("strong", null, "三角色评审结果"),
              h(
                "p",
                {
                  style: {
                    color: "var(--dsw-alias-text-secondary)",
                    fontSize: 12,
                    lineHeight: 1.55,
                    margin: 0
                  }
                },
                reviewResult.review.summary
              ),
              h(SummarySection, { label: "遗漏", values: reviewResult.review.gaps }),
              h(SummarySection, {
                label: "冲突",
                values: reviewResult.review.conflicts
              }),
              h(SummarySection, {
                label: "改进建议",
                values: reviewResult.review.recommendations
              }),
              h(
                "button",
                { type: "button", style: primaryButtonStyle, onClick: onApplyReview },
                "采用增强后的需求"
              )
            ),
          ready &&
            h(
              "section",
              { style: { display: "grid", gap: 8 } },
              h("strong", { style: { fontSize: 13 } }, "载入前预览"),
              h("textarea", {
                readOnly: true,
                rows: 10,
                value: prompt,
                style: {
                  background: "var(--dsw-alias-bg-layer-2)",
                  border: "1px solid var(--dsw-alias-border-subtle)",
                  borderRadius: 8,
                  color: "var(--dsw-alias-text-secondary)",
                  font: "inherit",
                  fontSize: 12,
                  lineHeight: 1.5,
                  padding: 9,
                  resize: "vertical"
                }
              }),
              h(
                "label",
                {
                  style: {
                    alignItems: "flex-start",
                    display: "flex",
                    fontSize: 12,
                    gap: 7,
                    lineHeight: 1.5
                  }
                },
                h("input", {
                  type: "checkbox",
                  checked: confirmed,
                  onChange: (event) => setConfirmed(event.target.checked)
                }),
                "我已检查内容；只载入 DSH 输入草稿，不自动发送。"
              ),
              h(
                "button",
                {
                  type: "button",
                  disabled: !confirmed,
                  style: {
                    ...primaryButtonStyle,
                    cursor: confirmed ? "pointer" : "not-allowed",
                    opacity: confirmed ? 1 : 0.5
                  },
                  onClick: load
                },
                "载入当前 DSH 草稿"
              )
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

      function DeepSeekConversationPanel({ onRemove, source }) {
        if (!source) {
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
            "尚未导入当前 DeepSeek 对话。请在左侧对话中复制需要交接的完整聊天，再从剪贴板导入。"
          );
        }
        return h(
          "section",
          {
            "aria-label": "当前 DeepSeek 对话",
            style: {
              display: "grid",
              gap: 9
            }
          },
          h(
            "article",
            {
              style: {
                background: "var(--dsw-alias-bg-layer-2)",
                border: "1px solid var(--dsw-alias-brand-primary, #4d6bfe)",
                borderRadius: 10,
                display: "grid",
                gap: 7,
                padding: 10
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
                h("strong", { style: { fontSize: 13 } }, source.title),
                h(
                  "span",
                  {
                    style: {
                      color: "var(--dsw-alias-brand-primary, #4d6bfe)",
                      fontSize: 11
                    }
                  },
                  "唯一来源"
                )
              ),
              h(
                "div",
                { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 11 } },
                `${source.transcript.length.toLocaleString()} 字符 · ${relativeTime(
                  source.updated_at
                )}`
              ),
              h(
                "pre",
                {
                  style: {
                    color: "var(--dsw-alias-text-tertiary)",
                    fontFamily: "inherit",
                    fontSize: 11,
                    lineHeight: 1.45,
                    margin: 0,
                    maxHeight: 86,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }
                },
                source.transcript.slice(0, 360),
                source.transcript.length > 360 ? "\n…" : ""
              ),
              h(
                "button",
                {
                  type: "button",
                  style: { ...buttonStyle, minHeight: 27, padding: "2px 7px" },
                  onClick: onRemove
                },
                "移除当前对话"
              )
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
        const [sources, setSources] = useState([]);
        const [integratedFingerprint, setIntegratedFingerprint] = useState("");
        const [answers, setAnswers] = useState([]);
        const [history, setHistory] = useState([]);
        const [loadedStorageKey, setLoadedStorageKey] = useState("");
        const [manualOpen, setManualOpen] = useState(false);
        const [manualText, setManualText] = useState("");
        const [message, setMessage] = useState("");
        const [messageKind, setMessageKind] = useState("info");
        const [panel, setPanel] = useState("home");
        const [reviewResult, setReviewResult] = useState(null);
        const [summary, setSummary] = useState(null);
        const state = useInbox();
        const currentWorkspace = useSessions(
          (sessions) => sessions.byId[sessionId]?.cwd || ""
        );
        const storageKey = useMemo(
          () =>
            `${WORKSPACE_STORAGE_PREFIX}${encodeURIComponent(
              currentWorkspace || sessionId || "global"
            )}`,
          [currentWorkspace, sessionId]
        );
        const sorted = useMemo(
          () =>
            [...state.items].sort((left, right) =>
              right.receivedAt.localeCompare(left.receivedAt)
            ),
          [state.items]
        );
        const currentFingerprint = sourcesFingerprint(sources);
        const needsIntegration = Boolean(
          currentFingerprint && currentFingerprint !== integratedFingerprint
        );

        useEffect(() => {
          let restored = normalizeWorkspace(null);
          try {
            restored = normalizeWorkspace(
              JSON.parse(localStorage.getItem(storageKey) || "null")
            );
          } catch {
            // A malformed or unavailable local draft starts as an empty workspace.
          }
          setSources(restored.sources);
          setIntegratedFingerprint(restored.integratedFingerprint);
          setSummary(restored.handoff);
          setAnswers(restored.answers);
          setHistory(restored.history);
          setReviewResult(null);
          setPanel(restored.handoff ? "summary" : "home");
          setLoadedStorageKey(storageKey);
        }, [storageKey]);

        useEffect(() => {
          if (loadedStorageKey !== storageKey) return;
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                version: 1,
                sources,
                integratedFingerprint,
                handoff: summary,
                answers,
                history
              })
            );
          } catch {
            // The live workspace remains usable when browser persistence is unavailable.
          }
        }, [
          answers,
          history,
          integratedFingerprint,
          loadedStorageKey,
          sources,
          storageKey,
          summary
        ]);

        const acceptImportedText = (value, source) => {
          const nextSources = addRequirementSource(sources, value, source);
          setSources(nextSources);
          setPanel("home");
          setManualOpen(false);
          setManualText("");
          setReviewResult(null);
          setMessageKind("success");
          setMessage(
            `已导入${source === "clipboard" ? "剪贴板中的" : "手动粘贴的"} DeepSeek 对话，尚未调用模型。再次导入会替换当前对话。`
          );
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

        const organize = async (kind, extra = {}) => {
          if (sources.length === 0) return;
          setBusy(kind);
          setMessage("");
          try {
            const response = await fetch(`${API}/organize`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                sessionId,
                text: formatSourcesTranscript(sources),
                ...extra
              }),
              signal: AbortSignal.timeout(190000)
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || `HTTP ${response.status}`);
            }
            setSummary(data.handoff);
            setAnswers(
              Array.isArray(data.handoff?.open_questions)
                ? data.handoff.open_questions.map(() => "")
                : []
            );
            setIntegratedFingerprint(currentFingerprint);
            setReviewResult(null);
            setPanel("summary");
            setMessageKind("success");
            setMessage(
              data.requiresClarification
                ? "需求分析 Skill 已完成强化，但仍有需要你确认的产品决定。"
                : `已使用 ${data.skill?.name || "SpecsRelay 需求分析 Skill"}，并由 DSH 的 ${data.provider} · ${data.model} 完成需求整理。`
            );
          } catch (error) {
            setMessageKind("error");
            setMessage(error instanceof Error ? error.message : String(error));
          } finally {
            setBusy("");
          }
        };

        const clarify = () =>
          organize("clarify", {
            previousHandoff: summary,
            clarifications: (summary?.open_questions || []).map(
              (question, index) => ({ question, answer: answers[index] || "" })
            )
          });

        const review = async () => {
          if (!summary || needsIntegration) return;
          setBusy("review");
          setMessage("");
          try {
            const response = await fetch(`${API}/review`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                sessionId,
                text: formatSourcesTranscript(sources),
                handoff: summary
              }),
              signal: AbortSignal.timeout(370000)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
            setReviewResult(data);
            setMessageKind("success");
            setMessage(
              `已继续使用 ${data.skill?.name || "SpecsRelay 需求分析 Skill"}，并由 DSH 的 ${data.provider} · ${data.model} 完成三角色评审。`
            );
          } catch (error) {
            setMessageKind("error");
            setMessage(error instanceof Error ? error.message : String(error));
          } finally {
            setBusy("");
          }
        };

        const newRequirement = () => {
          const snapshot = workspaceSnapshot(
            sources,
            integratedFingerprint,
            summary,
            answers
          );
          const archived = snapshotHasContent(snapshot);
          if (archived) {
            setHistory((items) => [snapshot, ...items].slice(0, MAX_WORKSPACE_HISTORY));
          }
          setSources([]);
          setIntegratedFingerprint("");
          setSummary(null);
          setAnswers([]);
          setReviewResult(null);
          setPanel("home");
          setMessageKind("success");
          setMessage(
            archived
              ? "已新建空白需求；上一份需求已进入本地恢复记录。"
              : "当前已经是空白需求工作台。"
          );
        };

        const restoreHistory = (index) => {
          const selected = history[index];
          if (!selected) return;
          const current = workspaceSnapshot(
            sources,
            integratedFingerprint,
            summary,
            answers
          );
          const remaining = history.filter((_, itemIndex) => itemIndex !== index);
          setHistory(
            snapshotHasContent(current)
              ? [current, ...remaining].slice(0, MAX_WORKSPACE_HISTORY)
              : remaining
          );
          setSources(normalizeSources(selected.sources));
          setIntegratedFingerprint(selected.integratedFingerprint || "");
          setSummary(selected.handoff || null);
          setAnswers(Array.isArray(selected.answers) ? selected.answers : []);
          setReviewResult(null);
          setPanel(selected.handoff ? "summary" : "home");
          setMessageKind("success");
          setMessage("已恢复所选需求工作区。");
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
                ),
                h(
                  "div",
                  { style: { display: "flex", gap: 6, marginLeft: "auto" } },
                  h(
                    "button",
                    {
                      type: "button",
                      style: { ...buttonStyle, minHeight: 28, padding: "3px 8px" },
                      onClick: () => setPanel("home")
                    },
                    "需求分析"
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      style: { ...buttonStyle, minHeight: 28, padding: "3px 8px" },
                      onClick: newRequirement
                    },
                    "新需求"
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
                      answers,
                      busy,
                      handoff: summary,
                      loadDraft,
                      onAnswer: (index, value) =>
                        setAnswers((items) => {
                          const next = [...items];
                          next[index] = value;
                          return next;
                        }),
                      onApplyReview: () => {
                        const improved = reviewResult?.improvedHandoff;
                        if (!improved) return;
                        setSummary(improved);
                        setAnswers(
                          Array.isArray(improved.open_questions)
                            ? improved.open_questions.map(() => "")
                            : []
                        );
                        setReviewResult(null);
                        setMessageKind("success");
                        setMessage("已采用增强后的结构化需求。");
                      },
                      onBack: () => setPanel("home"),
                      onClarify: () => void clarify(),
                      onReview: () => void review(),
                      onRevise: (instruction) =>
                        void organize("revision", {
                          previousHandoff: summary,
                          revisionInstruction: instruction
                        }),
                      projectPath: currentWorkspace,
                      reviewResult,
                      sourcesChanged: needsIntegration
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
                          "唯一来源是左侧当前 DeepSeek 网页对话。导入后，SpecsRelay 会调用 DSH 已配置的 DeepSeek 模型，并使用内置需求分析 Skill 强化需求。"
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
                            busy === "clipboard"
                              ? "读取中…"
                              : sources.length
                                ? "从剪贴板替换当前对话"
                                : "从剪贴板导入当前对话"
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
                              sources.length ? "替换当前 DeepSeek 对话" : "使用这份 DeepSeek 对话"
                            )
                          ),
                        h(DeepSeekConversationPanel, {
                          source: sources[0] || null,
                          onRemove: () => {
                            setSources([]);
                            setReviewResult(null);
                            setMessageKind("success");
                            setMessage("当前 DeepSeek 对话已移除，尚未调用模型。");
                          }
                        }),
                        sources.length > 0 &&
                          h(
                            "div",
                            {
                              style: {
                                color: needsIntegration
                                  ? "var(--dsw-alias-state-warning-primary, #b7791f)"
                                  : "var(--dsw-alias-state-success-primary)",
                                fontSize: 12
                              }
                            },
                            needsIntegration
                              ? "当前 DeepSeek 对话 · 待 Skill 分析"
                              : "当前 DeepSeek 对话 · 已完成 Skill 分析"
                          ),
                        h(
                          "button",
                          {
                            type: "button",
                            disabled: sources.length === 0 || Boolean(busy),
                            style: {
                              ...primaryButtonStyle,
                              cursor: sources.length && !busy ? "pointer" : "not-allowed",
                              opacity: sources.length && !busy ? 1 : 0.5
                            },
                            onClick: () => void organize("summary")
                          },
                          busy === "summary"
                            ? "Skill 分析中…"
                            : summary
                              ? "重新使用 Skill 分析需求"
                              : "使用 Skill 分析并整理需求"
                        ),
                        history.length > 0 &&
                          h(
                            "section",
                            { style: { display: "grid", gap: 7 } },
                            h("strong", { style: { fontSize: 13 } }, "本地恢复记录"),
                            ...history.map((item, index) =>
                              h(
                                "button",
                                {
                                  key: `${item.savedAt || "history"}-${index}`,
                                  type: "button",
                                  style: {
                                    ...buttonStyle,
                                    textAlign: "left",
                                    whiteSpace: "normal"
                                  },
                                  onClick: () => restoreHistory(index)
                                },
                                `${item.handoff?.title || "未整合需求"} · ${relativeTime(
                                  item.savedAt
                                )}`
                              )
                            )
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
                "当前 DeepSeek 对话、需求和最近 3 份恢复记录保存在此浏览器；只有点击 Skill 分析、澄清或评审后才调用 DSH 已配置的 DeepSeek 模型。无需另填 API Key。"
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
