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
        useRef,
        useState,
        useSyncExternalStore
      } = React;
      const {
        Button,
        Pill,
        StateDot,
        Toast,
        IconArchiveOutline20,
        IconCheckOutline16,
        IconChevronLeftOutline14,
        IconCloseOutline16,
        IconCopyOutline16,
        IconEditOutline16,
        IconEnhanceOutline16,
        IconNewChatOutline16,
        IconRefreshOutline16,
        IconSendOutline14,
        IconSkillOutline16,
        IconTrashOutline16,
        IconWarningOutline16
      } = require("@deepseek-ai/dsh-client-ui-primitives");

      const API = "/specsrelay/v1";
      const DEEPSEEK_URL = "https://chat.deepseek.com/";
      const DEEPSEEK_ORIGIN = "https://chat.deepseek.com";
      const CAPTURE_PROTOCOL_VERSION = 1;
      const CAPTURE_PROBE_TYPE = "specsrelay.dsh.capture.probe";
      const CAPTURE_READY_TYPE = "specsrelay.dsh.capture.ready";
      const CAPTURE_REQUEST_TYPE = "specsrelay.dsh.capture.request";
      const CAPTURE_RESULT_TYPE = "specsrelay.dsh.capture.result";
      const CAPTURE_TIMEOUT_MS = 90000;
      const MAX_EXECUTION_SNAPSHOTS = 12;
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
          const kind = item?.kind === "chatbot" ? "chatbot" : "paste";
          const identity = `${kind}:${stableHash(transcript)}`;
          if (seen.has(identity)) continue;
          seen.add(identity);
          normalized.push({
            id: String(item?.id || `source_${stableHash(identity)}`).slice(0, 120),
            identity,
            kind,
            provider: String(item?.provider || "DeepSeek").slice(0, 120),
            title: String(item?.title || "DeepSeek 对话").slice(0, 500),
            transcript,
            message_count: Number.isInteger(item?.message_count)
              ? Math.max(0, item.message_count)
              : 0,
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

      function addCapturedRequirementSource(capture) {
        const transcript = normalizeImportedText(capture?.transcript);
        const identity = `capture:${stableHash(transcript)}`;
        const now = new Date().toISOString();
        return normalizeSources([
          {
            id: `source_${stableHash(`${identity}:${capture?.captureId || now}`)}`,
            identity,
            kind: "chatbot",
            provider: "DeepSeek",
            title: String(capture?.title || "当前 DeepSeek 网页对话").slice(0, 500),
            transcript,
            message_count: Number.isInteger(capture?.messageCount)
              ? capture.messageCount
              : 0,
            primary: true,
            created_at: capture?.capturedAt || now,
            updated_at: now
          }
        ]);
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
            : [],
          executionHistory: normalizeExecutionHistory(source.executionHistory),
          organizerRoute:
            source.organizerRoute && typeof source.organizerRoute === "object"
              ? {
                  provider: String(source.organizerRoute.provider || ""),
                  model: String(source.organizerRoute.model || "")
                }
              : { provider: "", model: "" }
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

      function normalizeExecutionHistory(value) {
        if (!Array.isArray(value)) return [];
        return value
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              item.handoff &&
              typeof item.handoff === "object" &&
              typeof item.prompt === "string" &&
              item.prompt.trim()
          )
          .slice(0, MAX_EXECUTION_SNAPSHOTS)
          .map((item) => ({
            id: String(item.id || crypto.randomUUID()).slice(0, 160),
            createdAt: String(item.createdAt || new Date().toISOString()),
            handoff: item.handoff,
            projectPath: String(item.projectPath || ""),
            prompt: item.prompt,
            sources: normalizeSources(item.sources),
            status: item.status === "loaded" ? "loaded" : "snapshot",
            fingerprint: String(item.fingerprint || "")
          }));
      }

      function createExecutionSnapshot(handoff, projectPath, prompt, sources) {
        return {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          handoff,
          projectPath,
          prompt,
          sources: normalizeSources(sources),
          status: "loaded",
          fingerprint: stableHash(`${projectPath}\n${prompt}`)
        };
      }

      const textAreaStyle = {
        background: "var(--dsw-alias-bg-layer-1)",
        border: "1px solid var(--dsw-alias-border-l2)",
        borderRadius: 8,
        color: "var(--dsw-alias-label-primary)",
        font: "inherit",
        outline: "none",
        padding: 10,
        resize: "vertical",
        width: "100%"
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

      const stepCardStyle = {
        background: "var(--dsw-alias-bg-layer-1)",
        border: "1px solid var(--dsw-alias-border-subtle)",
        borderRadius: 14,
        display: "grid",
        gap: 14,
        padding: 14
      };

      function WorkflowStep({ children, description, number, title }) {
        return h(
          "section",
          { style: stepCardStyle },
          h(
            "header",
            { style: { alignItems: "flex-start", display: "flex", gap: 10 } },
            h(
              "span",
              {
                style: {
                  alignItems: "center",
                  background: "color-mix(in srgb, var(--dsw-alias-brand-primary, #35d39a) 14%, transparent)",
                  border: "1px solid var(--dsw-alias-brand-primary, #35d39a)",
                  borderRadius: 7,
                  color: "var(--dsw-alias-brand-primary, #35d39a)",
                  display: "inline-flex",
                  flex: "0 0 24px",
                  fontSize: 12,
                  fontWeight: 700,
                  height: 24,
                  justifyContent: "center"
                }
              },
              String(number)
            ),
            h(
              "div",
              { style: { display: "grid", gap: 3, minWidth: 0 } },
              h("h2", { style: { fontSize: 16, margin: 0 } }, title),
              h(
                "p",
                {
                  style: {
                    color: "var(--dsw-alias-text-tertiary)",
                    fontSize: 12,
                    lineHeight: 1.5,
                    margin: 0
                  }
                },
                description
              )
            )
          ),
          children
        );
      }

      function HandoffSummaryPanel({
        answers,
        busy,
        handoff,
        onAnswer,
        onApplyReview,
        onClarify,
        onRecapture,
        onReview,
        reviewResult,
        sourcesChanged
      }) {
        const [message, setMessage] = useState("");
        const questions = Array.isArray(handoff.open_questions)
          ? handoff.open_questions
          : [];
        const ready =
          handoff.ready_for_execution === true &&
          questions.length === 0 &&
          !sourcesChanged;
        return h(
          React.Fragment,
          null,
          h(
            "section",
            {
              "aria-label": "结构化需求总结",
              style: {
                background: "color-mix(in srgb, var(--dsw-alias-brand-primary, #35d39a) 7%, var(--dsw-alias-bg-layer-2))",
                border: "1px solid var(--dsw-alias-brand-primary, #35d39a)",
                borderRadius: 11,
                display: "grid",
                gap: 12,
                padding: 12
              }
            },
            h("h3", { style: { fontSize: 16, lineHeight: 1.35, margin: 0 } }, handoff.title),
            h(
              "div",
              { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 12 } },
              `风险等级：${handoff.risk_level || "未标注"} · ${
                sourcesChanged ? "来源待重新整合" : ready ? "可交接" : "待确认"
              }`
            ),
            h(
              "section",
              { style: { display: "grid", gap: 5 } },
              h("strong", { style: { color: "var(--dsw-alias-brand-primary, #35d39a)", fontSize: 12 } }, "目标"),
              h(
                "p",
                { style: { color: "var(--dsw-alias-text-secondary)", lineHeight: 1.55, margin: 0 } },
                handoff.objective
              )
            ),
            h(SummarySection, { label: "已确认决策", values: handoff.decisions }),
            h(SummarySection, { label: "验收标准", values: handoff.acceptance_criteria }),
            h(SummarySection, { label: "约束", values: handoff.constraints })
          ),
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
              h("strong", null, "需求澄清 · 还有几项需要确认"),
              h(
                "p",
                { style: { color: "var(--dsw-alias-text-secondary)", fontSize: 12, lineHeight: 1.5, margin: 0 } },
                "回到 DeepSeek 继续聊并重新抓取，或者直接在这里逐条回答。"
              ),
              ...questions.map((question, index) =>
                h(
                  "label",
                  { key: question, style: { display: "grid", gap: 6 } },
                  h("span", { style: { fontSize: 12 } }, `${index + 1}. ${question}`),
                  h("textarea", {
                    rows: 3,
                    value: answers[index] || "",
                    placeholder: "输入你的决定、偏好或补充背景…",
                    style: textAreaStyle,
                    onChange: (event) => onAnswer(index, event.target.value)
                  })
                )
              ),
              h(
                "div",
                { style: { display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" } },
                h(
                  Button,
                  {
                    icon: h(IconCopyOutline16),
                    variant: "outline",
                    onClick: async () => {
                      const text = `为了把当前需求准确交给 Coding Agent，请继续基于上面的完整对话逐条确认以下问题，不要替我假设答案：\n\n${questions
                        .map((question, index) => `${index + 1}. ${question}`)
                        .join("\n")}`;
                      try {
                        await navigator.clipboard.writeText(text);
                        setMessage("待确认问题已复制。");
                      } catch {
                        setMessage("浏览器未允许写入剪贴板。");
                      }
                    }
                  },
                  "复制问题"
                ),
                h(
                  Button,
                  {
                    disabled: Boolean(busy) || !onRecapture,
                    icon: h(IconRefreshOutline16),
                    variant: "outline",
                    onClick: onRecapture
                  },
                  busy === "capture" ? "重新抓取中…" : "重新抓取当前对话"
                ),
                h(
                  Button,
                  {
                    disabled: Boolean(busy) || questions.some((_, index) => !answers[index]?.trim()),
                    icon: h(IconEnhanceOutline16),
                    variant: "primary",
                    onClick: onClarify
                  },
                  busy === "clarify" ? "继续整理中…" : "提交回答并继续整理"
                )
              )
            ),
          ready &&
            h(
              "section",
              {
                style: {
                  alignItems: "center",
                  background: "var(--dsw-alias-bg-layer-2)",
                  border: "1px solid var(--dsw-alias-brand-primary, #35d39a)",
                  borderRadius: 10,
                  display: "grid",
                  gap: 9,
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  padding: 12
                }
              },
              h(
                "div",
                null,
                h("strong", { style: { fontSize: 13 } }, "需求评审室"),
                h(
                  "p",
                  { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 11, lineHeight: 1.45, margin: "4px 0 0" } },
                  "从产品、架构和交付角度自动复核当前需求。"
                )
              ),
              h(
                Button,
                { disabled: Boolean(busy), icon: h(IconEnhanceOutline16), variant: "outline", onClick: onReview },
                busy === "review" ? "评审中…" : "打开评审室"
              )
            ),
          reviewResult &&
            h(
              "section",
              { style: { background: "var(--dsw-alias-bg-layer-2)", borderRadius: 10, display: "grid", gap: 9, padding: 12 } },
              h("strong", null, "三角色评审结果"),
              h("p", { style: { color: "var(--dsw-alias-text-secondary)", fontSize: 12, lineHeight: 1.55, margin: 0 } }, reviewResult.review.summary),
              h(SummarySection, { label: "遗漏", values: reviewResult.review.gaps }),
              h(SummarySection, { label: "冲突", values: reviewResult.review.conflicts }),
              h(SummarySection, { label: "改进建议", values: reviewResult.review.recommendations }),
              h(Button, { icon: h(IconCheckOutline16), variant: "primary", onClick: onApplyReview }, "采用增强后的需求")
            ),
          message && h(Toast, { text: message, onDone: () => setMessage("") })
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
            "还没有当前来源。点击“添加当前对话为来源”后，SpecsRelay 会先在本地保存完整多轮对话；只有你点击整合时才调用 DSH 模型。"
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
              { style: { alignItems: "flex-start", display: "flex", gap: 8, justifyContent: "space-between" } },
              h(
                "div",
                { style: { display: "grid", gap: 3, minWidth: 0 } },
                h("span", { style: { color: "var(--dsw-alias-brand-primary, #35d39a)", fontSize: 11, fontWeight: 700 } }, source.provider),
                h("strong", { style: { fontSize: 12, lineHeight: 1.4 } }, source.title)
              ),
              h(Pill, { active: true }, "主要来源")
            ),
            h(
              "div",
              { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 10 } },
              `${source.message_count > 0 ? `${source.message_count} 条消息 · ` : ""}更新于 ${relativeTime(source.updated_at)}`
            ),
            h(
              Button,
              { icon: h(IconTrashOutline16), size: "sm", variant: "ghost", onClick: onRemove },
              "移除"
            )
          )
        );
      }

      function DshTargetStep({ projectPath }) {
        return h(
          WorkflowStep,
          {
            number: 2,
            title: "选择目标 DSH Agent",
            description: "当前 DSH 版只交接给正在使用的 DeepSeek Harness 会话。"
          },
          h(
            "section",
            { style: { display: "grid", gap: 8 } },
            h("strong", { style: { fontSize: 12 } }, "目标 Coding Agent"),
            h(
              "div",
              {
                style: {
                  alignItems: "center",
                  background: "var(--dsw-alias-bg-layer-2)",
                  border: "1px solid var(--dsw-alias-border-subtle)",
                  borderRadius: 9,
                  display: "flex",
                  gap: 8,
                  minHeight: 38,
                  padding: "0 10px"
                }
              },
              h(StateDot, { state: "done" }),
              h("span", { style: { fontSize: 13 } }, "当前 DeepSeek Harness 会话"),
              h(Pill, { active: true, style: { marginLeft: "auto" } }, "固定目标")
            ),
            h(
              "p",
              { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 11, lineHeight: 1.45, margin: 0 } },
              "需求会载入当前会话的输入草稿，由你最后检查并发送，不会自动启动 Agent。"
            )
          ),
          h(
            "section",
            { style: { display: "grid", gap: 7 } },
            h("strong", { style: { fontSize: 12 } }, "项目目录"),
            h(
              "code",
              {
                title: projectPath,
                style: {
                  background: "var(--dsw-alias-bg-layer-2)",
                  border: "1px solid var(--dsw-alias-border-subtle)",
                  borderRadius: 9,
                  color: projectPath
                    ? "var(--dsw-alias-text-secondary)"
                    : "var(--dsw-alias-state-warning-primary)",
                  fontSize: 11,
                  lineHeight: 1.5,
                  overflowWrap: "anywhere",
                  padding: 10
                }
              },
              projectPath || "当前 DSH 会话尚未关联项目"
            )
          )
        );
      }

      function DeliveryStep({
        alreadyLoaded,
        busy,
        handoff,
        onLoad,
        projectPath,
        sourcesChanged
      }) {
        const [confirmed, setConfirmed] = useState(false);
        const [message, setMessage] = useState("");
        const prompt = handoff ? formatHandoffPrompt(handoff) : "";
        const questions = Array.isArray(handoff?.open_questions)
          ? handoff.open_questions
          : [];
        const ready = Boolean(
          projectPath &&
            handoff?.ready_for_execution === true &&
            questions.length === 0 &&
            !sourcesChanged
        );
        useEffect(() => setConfirmed(false), [projectPath, prompt]);
        const load = () => {
          const result = onLoad(prompt);
          setMessage(
            result.ok
              ? "已载入当前 DSH 草稿；这一版已保存为冻结快照。"
              : result.message
          );
          if (result.ok) setConfirmed(false);
        };
        return h(
          WorkflowStep,
          {
            number: 3,
            title: "检查并载入",
            description: "下面的完整指令会载入当前 DSH 会话草稿。"
          },
          h("textarea", {
            readOnly: true,
            rows: 12,
            value: prompt,
            placeholder: "完成需求整理并关联 DSH 项目后，这里会显示完整提示词。",
            style: {
              ...textAreaStyle,
              color: "var(--dsw-alias-label-secondary)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              lineHeight: 1.5,
              minHeight: 220
            }
          }),
          alreadyLoaded &&
            h(
              "p",
              { style: { color: "var(--dsw-alias-brand-primary, #35d39a)", fontSize: 11, lineHeight: 1.45, margin: 0 } },
              "当前版本已经载入过。需要重开时请使用下方冻结快照；需要改需求时请基于快照继续修改。"
            ),
          h(
            "label",
            { style: { alignItems: "flex-start", display: "flex", fontSize: 12, gap: 7, lineHeight: 1.5 } },
            h("input", {
              type: "checkbox",
              checked: confirmed,
              disabled: !ready || Boolean(busy) || alreadyLoaded,
              onChange: (event) => setConfirmed(event.target.checked)
            }),
            "我已核对当前 DSH 会话、项目目录和草稿提示词。"
          ),
          h(
            Button,
            {
              disabled: !ready || !confirmed || Boolean(busy) || alreadyLoaded,
              icon: h(IconSendOutline14),
              variant: "primary",
              onClick: load
            },
            alreadyLoaded ? "当前版本已载入" : "载入当前版本到 DSH 草稿"
          ),
          message && h(Toast, { text: message, onDone: () => setMessage("") })
        );
      }

      function ExecutionSnapshotPanel({
        busy,
        history,
        onReload,
        onRevise
      }) {
        const [selectedId, setSelectedId] = useState(history[0]?.id || "");
        const [revisionOpen, setRevisionOpen] = useState(false);
        const [revisionInstruction, setRevisionInstruction] = useState("");
        const [message, setMessage] = useState("");
        useEffect(() => {
          if (!history.some((item) => item.id === selectedId)) {
            setSelectedId(history[0]?.id || "");
          }
        }, [history, selectedId]);
        if (history.length === 0) return null;
        const snapshot =
          history.find((item) => item.id === selectedId) || history[0];
        return h(
          "section",
          {
            "aria-label": "执行快照",
            style: {
              ...stepCardStyle,
              borderColor: "var(--dsw-alias-brand-primary, #35d39a)"
            }
          },
          h(
            "header",
            { style: { alignItems: "flex-start", display: "flex", gap: 8, justifyContent: "space-between" } },
            h(
              "div",
              null,
              h("div", { style: { color: "var(--dsw-alias-brand-primary, #35d39a)", fontSize: 11, fontWeight: 700 } }, "执行快照"),
              h("h2", { style: { fontSize: 16, lineHeight: 1.35, margin: "3px 0 0" } }, snapshot.handoff.title)
            ),
            h(Pill, { active: true }, "已载入")
          ),
          h(
            "p",
            { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 11, lineHeight: 1.45, margin: 0 } },
            "已载入 DSH 的版本会被冻结；之后继续修改不会改变这一版。"
          ),
          h("strong", { style: { fontSize: 12 } }, "执行版本"),
          h(
            "select",
            {
              value: snapshot.id,
              style: { ...textAreaStyle, minHeight: 38, padding: "0 9px" },
              onChange: (event) => setSelectedId(event.target.value)
            },
            ...history.map((item) =>
              h(
                "option",
                { key: item.id, value: item.id },
                `${relativeTime(item.createdAt)} · ${item.handoff.title}`
              )
            )
          ),
          h(
            "div",
            { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 11, overflowWrap: "anywhere" } },
            `${relativeTime(snapshot.createdAt)} · DSH · ${snapshot.projectPath}`
          ),
          h(
            "section",
            {
              style: {
                background: "color-mix(in srgb, var(--dsw-alias-brand-primary, #35d39a) 8%, var(--dsw-alias-bg-layer-2))",
                border: "1px solid var(--dsw-alias-brand-primary, #35d39a)",
                borderRadius: 10,
                display: "grid",
                gap: 9,
                padding: 10
              }
            },
            h("p", { style: { color: "var(--dsw-alias-text-secondary)", fontSize: 11, lineHeight: 1.5, margin: 0 } }, "这份冻结快照可以重新载入为当前 DSH 草稿。"),
            h(
              Button,
              {
                disabled: Boolean(busy),
                icon: h(IconRefreshOutline16),
                variant: "primary",
                onClick: () => {
                  const result = onReload(snapshot);
                  setMessage(result.ok ? "已重新载入这份冻结快照。" : result.message);
                }
              },
              "重新载入此快照"
            )
          ),
          h(
            Button,
            { disabled: Boolean(busy), icon: h(IconEditOutline16), variant: "outline", onClick: () => setRevisionOpen((value) => !value) },
            "基于此版本继续修改"
          ),
          revisionOpen &&
            h(
              "section",
              { style: { display: "grid", gap: 8 } },
              h("textarea", {
                rows: 5,
                value: revisionInstruction,
                maxLength: 12000,
                placeholder: "例如：增加 iPad 横屏适配，但保留当前 DSH 范围。",
                style: textAreaStyle,
                onChange: (event) => setRevisionInstruction(event.target.value)
              }),
              h(
                Button,
                {
                  disabled: Boolean(busy) || !revisionInstruction.trim(),
                  icon: h(IconEnhanceOutline16),
                  variant: "primary",
                  onClick: () => {
                    onRevise(snapshot, revisionInstruction);
                    setRevisionOpen(false);
                    setRevisionInstruction("");
                  }
                },
                busy === "revision" ? "正在生成新版本…" : "生成新的需求版本"
              )
            ),
          message && h(Toast, { text: message, onDone: () => setMessage("") })
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
            Button,
            {
              icon: h(IconSendOutline14),
              variant: "outline",
              onClick: () => void load()
            },
            item.state === "loaded" ? "重新载入草稿" : "载入当前会话草稿"
          ),
          message && h(Toast, { text: message, onDone: () => setMessage("") })
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
                Button,
                {
                  icon: h(IconRefreshOutline16),
                  size: "sm",
                  variant: "toolbar",
                  onClick: onRefresh
                },
                loading ? "刷新中…" : "刷新"
              ),
              h(
                Button,
                {
                  icon: h(IconChevronLeftOutline14),
                  size: "sm",
                  variant: "ghost",
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
        const [captureBridgeReady, setCaptureBridgeReady] = useState(false);
        const [compactLayout, setCompactLayout] = useState(false);
        const [compactPane, setCompactPane] = useState("web");
        const [frameKey, setFrameKey] = useState(0);
        const [sources, setSources] = useState([]);
        const [integratedFingerprint, setIntegratedFingerprint] = useState("");
        const [answers, setAnswers] = useState([]);
        const [executionHistory, setExecutionHistory] = useState([]);
        const [history, setHistory] = useState([]);
        const [loadedStorageKey, setLoadedStorageKey] = useState("");
        const [manualOpen, setManualOpen] = useState(false);
        const [manualText, setManualText] = useState("");
        const [message, setMessage] = useState("");
        const [messageKind, setMessageKind] = useState("info");
        const [organizerRoute, setOrganizerRoute] = useState({
          provider: "",
          model: ""
        });
        const [panel, setPanel] = useState("workbench");
        const [reviewResult, setReviewResult] = useState(null);
        const [summary, setSummary] = useState(null);
        const captureFrameRef = useRef(null);
        const capturePendingRef = useRef(null);
        const viewRef = useRef(null);
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
          (currentFingerprint || summary) &&
            currentFingerprint !== integratedFingerprint
        );
        const currentPrompt = summary ? formatHandoffPrompt(summary) : "";
        const currentExecutionFingerprint =
          currentWorkspace && currentPrompt
            ? stableHash(`${currentWorkspace}\n${currentPrompt}`)
            : "";
        const currentVersionLoaded = Boolean(
          currentExecutionFingerprint &&
            executionHistory.some(
              (item) => item.fingerprint === currentExecutionFingerprint
            )
        );

        useEffect(() => {
          const node = viewRef.current;
          if (!node || typeof ResizeObserver !== "function") return;
          const observer = new ResizeObserver(([entry]) => {
            if (entry) setCompactLayout(entry.contentRect.width < 1040);
          });
          observer.observe(node);
          return () => observer.disconnect();
        }, []);

        useEffect(() => {
          const onCaptureMessage = (event) => {
            if (
              event.origin !== DEEPSEEK_ORIGIN ||
              event.source !== captureFrameRef.current?.contentWindow
            ) {
              return;
            }
            const value = event.data;
            if (
              !value ||
              typeof value !== "object" ||
              value.protocolVersion !== CAPTURE_PROTOCOL_VERSION
            ) {
              return;
            }
            if (value.type === CAPTURE_READY_TYPE) {
              setCaptureBridgeReady(true);
              return;
            }
            const pending = capturePendingRef.current;
            if (
              value.type !== CAPTURE_RESULT_TYPE ||
              !pending ||
              value.requestId !== pending.requestId
            ) {
              return;
            }
            clearTimeout(pending.timeoutId);
            capturePendingRef.current = null;
            if (value.ok) pending.resolve(value.receipt);
            else pending.reject(new Error(value.error || "自动抓取失败。"));
          };
          window.addEventListener("message", onCaptureMessage);
          return () => {
            window.removeEventListener("message", onCaptureMessage);
            const pending = capturePendingRef.current;
            if (pending) {
              clearTimeout(pending.timeoutId);
              capturePendingRef.current = null;
              pending.reject(new Error("DeepSeek 捕获页面已关闭。"));
            }
          };
        }, []);

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
          setExecutionHistory(restored.executionHistory);
          setOrganizerRoute(restored.organizerRoute);
          setReviewResult(null);
          setPanel("workbench");
          setLoadedStorageKey(storageKey);
        }, [storageKey]);

        useEffect(() => {
          if (!sessionId) return;
          const controller = new AbortController();
          fetch(
            `${API}/organizer/status?sessionId=${encodeURIComponent(sessionId)}`,
            { cache: "no-store", signal: controller.signal }
          )
            .then(async (response) => {
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
              setOrganizerRoute({
                provider: String(data.provider || ""),
                model: String(data.model || "")
              });
            })
            .catch((error) => {
              if (error?.name !== "AbortError") {
                setOrganizerRoute({ provider: "", model: "" });
              }
            });
          return () => controller.abort();
        }, [sessionId]);

        useEffect(() => {
          if (loadedStorageKey !== storageKey) return;
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                version: 2,
                sources,
                integratedFingerprint,
                handoff: summary,
                answers,
                history,
                executionHistory,
                organizerRoute
              })
            );
          } catch {
            // The live workspace remains usable when browser persistence is unavailable.
          }
        }, [
          answers,
          executionHistory,
          history,
          integratedFingerprint,
          loadedStorageKey,
          organizerRoute,
          sources,
          storageKey,
          summary
        ]);

        const acceptImportedText = (value, source) => {
          const nextSources = addRequirementSource(sources, value, source);
          setSources(nextSources);
          setPanel("workbench");
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

        const probeCaptureBridge = () => {
          const target = captureFrameRef.current?.contentWindow;
          if (!target) return;
          target.postMessage(
            {
              type: CAPTURE_PROBE_TYPE,
              protocolVersion: CAPTURE_PROTOCOL_VERSION
            },
            DEEPSEEK_ORIGIN
          );
        };

        const requestCaptureDelivery = (requestId) => {
          const target = captureFrameRef.current?.contentWindow;
          if (!target) {
            return Promise.reject(new Error("DeepSeek 网页尚未准备好。"));
          }
          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              if (capturePendingRef.current?.requestId === requestId) {
                capturePendingRef.current = null;
              }
              reject(
                new Error(
                  "自动抓取组件未响应。请确认 SpecsRelay 浏览器扩展已更新并允许访问 DeepSeek。"
                )
              );
            }, CAPTURE_TIMEOUT_MS);
            capturePendingRef.current = {
              requestId,
              resolve,
              reject,
              timeoutId
            };
            target.postMessage(
              {
                type: CAPTURE_REQUEST_TYPE,
                protocolVersion: CAPTURE_PROTOCOL_VERSION,
                requestId
              },
              DEEPSEEK_ORIGIN
            );
          });
        };

        const fetchCapturedConversation = async (requestId) => {
          const response = await fetch(
            `${API}/captures/latest?requestId=${encodeURIComponent(requestId)}`,
            { cache: "no-store" }
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
          }
          if (!data.item) {
            throw new Error("DSH 尚未收到自动抓取的 DeepSeek 对话。请重试。");
          }
          return data.item;
        };

        const organizeSources = async (kind, sourceItems, extra = {}) => {
          if (sourceItems.length === 0) return;
          const fingerprint = sourcesFingerprint(sourceItems);
          setBusy(kind);
          setMessage("");
          try {
            const response = await fetch(`${API}/organize`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                sessionId,
                text: formatSourcesTranscript(sourceItems),
                ...extra
              }),
              signal: AbortSignal.timeout(190000)
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || `HTTP ${response.status}`);
            }
            setSummary(data.handoff);
            setOrganizerRoute({
              provider: String(data.provider || ""),
              model: String(data.model || "")
            });
            setAnswers(
              Array.isArray(data.handoff?.open_questions)
                ? data.handoff.open_questions.map(() => "")
                : []
            );
            setIntegratedFingerprint(fingerprint);
            setReviewResult(null);
            setPanel("workbench");
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

        const organize = (kind, extra = {}) =>
          organizeSources(kind, sources, extra);

        const captureCurrentConversation = async () => {
          if (!captureBridgeReady || busy) return;
          setBusy("capture");
          setMessage("");
          try {
            const requestId = crypto.randomUUID();
            await requestCaptureDelivery(requestId);
            const capture = await fetchCapturedConversation(requestId);
            const nextSources = addCapturedRequirementSource(capture);
            setSources(nextSources);
            setPanel("workbench");
            setManualOpen(false);
            setManualText("");
            setReviewResult(null);
            setMessageKind("success");
            setMessage(
              `已添加 ${capture.messageCount} 条 DeepSeek 消息作为当前来源，尚未调用 DSH 模型。`
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
            setOrganizerRoute({
              provider: String(data.provider || ""),
              model: String(data.model || "")
            });
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
          setPanel("workbench");
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
          setPanel("workbench");
          setMessageKind("success");
          setMessage("已恢复所选需求工作区。");
        };

        const openInbox = () => {
          setPanel("inbox");
          void inbox.refresh();
        };

        const loadCurrentVersion = (prompt) => {
          if (!summary) {
            return { ok: false, message: "当前还没有可载入的结构化需求。" };
          }
          const result = loadDraft({
            handoffId: `dsh-live-${Date.now()}`,
            objective: summary.objective,
            projectPath: currentWorkspace,
            prompt,
            receivedAt: new Date().toISOString(),
            sourceProvider: "DeepSeek",
            state: "received",
            title: summary.title
          });
          if (result.ok) {
            const snapshot = createExecutionSnapshot(
              summary,
              currentWorkspace,
              prompt,
              sources
            );
            setExecutionHistory((items) =>
              normalizeExecutionHistory([
                snapshot,
                ...items.filter(
                  (item) => item.fingerprint !== snapshot.fingerprint
                )
              ])
            );
          }
          return result;
        };

        const reloadExecutionSnapshot = (snapshot) =>
          loadDraft({
            handoffId: `dsh-snapshot-${snapshot.id}`,
            objective: snapshot.handoff.objective,
            projectPath: snapshot.projectPath,
            prompt: snapshot.prompt,
            receivedAt: snapshot.createdAt,
            sourceProvider: "DeepSeek",
            state: "loaded",
            title: snapshot.handoff.title
          });

        const reviseFromSnapshot = (snapshot, revisionInstruction) => {
          const snapshotSources = snapshot.sources.length
            ? snapshot.sources
            : sources;
          setSources(snapshotSources);
          setSummary(snapshot.handoff);
          setIntegratedFingerprint(sourcesFingerprint(snapshotSources));
          setReviewResult(null);
          setPanel("workbench");
          void organizeSources("revision", snapshotSources, {
            previousHandoff: snapshot.handoff,
            revisionInstruction
          });
        };

        return h(
          "section",
          {
            "aria-label": "SpecsRelay DeepSeek 网页",
            ref: viewRef,
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
          compactLayout &&
            h(
              "div",
              {
                role: "tablist",
                "aria-label": "DeepSeek 与 SpecsRelay",
                style: { display: "flex", gap: 6 }
              },
              h(
                Pill,
                {
                  active: compactPane === "web",
                  role: "tab",
                  "aria-selected": compactPane === "web",
                  onClick: () => setCompactPane("web")
                },
                "DeepSeek 网页"
              ),
              h(
                Pill,
                {
                  active: compactPane === "relay",
                  role: "tab",
                  "aria-selected": compactPane === "relay",
                  onClick: () => setCompactPane("relay")
                },
                "SpecsRelay"
              )
            ),
          h(
            "div",
              { style: { display: "flex", gap: 8 } },
              h(
                Button,
                {
                  icon: h(IconRefreshOutline16),
                  size: "sm",
                  variant: "toolbar",
                  onClick: () => {
                    setCaptureBridgeReady(false);
                    setFrameKey((value) => value + 1);
                  }
                },
                "刷新网页"
              ),
              onClose &&
                h(
                  Button,
                  {
                    icon: h(IconCloseOutline16),
                    size: "sm",
                    variant: "ghost",
                    onClick: onClose
                  },
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
                gridTemplateColumns: compactLayout
                  ? "minmax(0, 1fr)"
                  : "minmax(0, 1fr) minmax(440px, 510px)",
                minHeight: 0
              }
            },
            h(
              "div",
              {
                style: {
                  border: "1px solid var(--dsw-alias-border-subtle)",
                  borderRadius: 12,
                  display: compactLayout && compactPane !== "web" ? "none" : "block",
                  minHeight: 0,
                  overflow: "hidden"
                }
              },
              h("iframe", {
                key: frameKey,
                ref: captureFrameRef,
                src: DEEPSEEK_URL,
                title: "DeepSeek 网页端",
                allow: "clipboard-read; clipboard-write",
                referrerPolicy: "strict-origin-when-cross-origin",
                onLoad: () => {
                  setCaptureBridgeReady(false);
                  setTimeout(probeCaptureBridge, 0);
                },
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
                  display: compactLayout && compactPane !== "relay" ? "none" : "flex",
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
                  h(Pill, { active: true }, "DSH 模型"),
                  h(
                    Button,
                    {
                      icon: h(IconNewChatOutline16),
                      size: "sm",
                      variant: "ghost",
                      onClick: newRequirement
                    },
                    "新需求"
                  ),
                  h(
                    Button,
                    {
                      icon: h(IconArchiveOutline20, { size: 16 }),
                      size: "sm",
                      variant: "ghost",
                      onClick: openInbox
                    },
                    "记录"
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
                panel === "inbox"
                  ? h(InboxPanel, {
                      items: sorted,
                      loadDraft,
                      loading: state.loading,
                      onBack: () => setPanel("workbench"),
                      onRefresh: () => void inbox.refresh()
                    })
                  : h(
                      React.Fragment,
                      null,
                      h(
                        "div",
                        {
                          style: {
                            alignItems: "center",
                            background: "var(--dsw-alias-bg-layer-2)",
                            border: "1px solid var(--dsw-alias-border-subtle)",
                            borderRadius: 9,
                            display: "flex",
                            gap: 8,
                            minHeight: 38,
                            padding: "0 10px"
                          }
                        },
                        h(StateDot, { state: captureBridgeReady ? "done" : "warning" }),
                        h(
                          "span",
                          { style: { fontSize: 12 } },
                          captureBridgeReady
                            ? "DeepSeek 网页捕获已连接"
                            : "正在等待 DeepSeek 网页捕获组件"
                        )
                      ),
                      h(
                        "div",
                        {
                          style: {
                            alignItems: "center",
                            background: "color-mix(in srgb, var(--dsw-alias-brand-primary, #35d39a) 8%, var(--dsw-alias-bg-layer-2))",
                            border: "1px solid var(--dsw-alias-brand-primary, #35d39a)",
                            borderRadius: 9,
                            display: "flex",
                            gap: 8,
                            minHeight: 42,
                            padding: "0 10px"
                          }
                        },
                        h(StateDot, { state: organizerRoute.model ? "done" : "warning" }),
                        h(
                          "strong",
                          { style: { fontSize: 12, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                          organizerRoute.model
                            ? `需求模型：DeepSeek · ${organizerRoute.model}`
                            : "正在读取 DSH 当前需求模型"
                        ),
                        h(Pill, { active: true, style: { marginLeft: "auto" } }, "DSH 提供")
                      ),
                      h(
                        WorkflowStep,
                        {
                          number: 1,
                          title: "建立并强化当前需求",
                          description: "把当前 DeepSeek 网页对话保存为需求来源，再由你决定何时调用 DSH 模型和 Skill 整合。"
                        },
                        h(
                          "section",
                          {
                            style: {
                              background: "color-mix(in srgb, var(--dsw-alias-brand-primary, #35d39a) 5%, var(--dsw-alias-bg-layer-2))",
                              border: "1px solid var(--dsw-alias-brand-primary, #35d39a)",
                              borderRadius: 11,
                              display: "grid",
                              gap: 10,
                              padding: 12
                            }
                          },
                          h(
                            "header",
                            { style: { alignItems: "flex-start", display: "flex", gap: 8, justifyContent: "space-between" } },
                            h(
                              "div",
                              { style: { minWidth: 0 } },
                              h("div", { style: { color: "var(--dsw-alias-brand-primary, #35d39a)", fontSize: 10, fontWeight: 700 } }, "当前需求工作区"),
                              h(
                                "h3",
                                { style: { fontSize: 15, lineHeight: 1.35, margin: "3px 0 0" } },
                                summary?.title || sources[0]?.title || "还没有当前需求"
                              ),
                              h(
                                "div",
                                { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 11, marginTop: 3 } },
                                sources.length
                                  ? `${sources.length}/1 个来源 · ${needsIntegration ? "待整合" : "已整合"}`
                                  : "抓取当前 DeepSeek 对话即可创建"
                              )
                            ),
                            (sources.length > 0 || summary) &&
                              h(Button, { icon: h(IconNewChatOutline16), size: "sm", variant: "ghost", onClick: newRequirement }, "新建需求")
                          ),
                          h(DeepSeekConversationPanel, {
                            source: sources[0] || null,
                            onRemove: () => {
                              setSources([]);
                              setReviewResult(null);
                              setMessageKind("success");
                              setMessage("当前 DeepSeek 对话已移除，需求需要重新建立。 ");
                            }
                          }),
                          sources.length > 0 &&
                            h(
                              "div",
                              { style: { alignItems: "center", display: "grid", gap: 8, gridTemplateColumns: "minmax(0, 1fr) auto" } },
                              h(
                                Button,
                                {
                                  disabled: Boolean(busy) || !needsIntegration,
                                  icon: h(IconSkillOutline16),
                                  variant: "primary",
                                  onClick: () => void organize("integrate")
                                },
                                busy === "integrate" ? "正在整合来源…" : "整合并强化来源"
                              ),
                              h("span", { style: { color: "var(--dsw-alias-text-tertiary)", fontSize: 10 } }, "最多 1 个来源")
                            )
                        ),
                        h(
                          "div",
                          {
                            style: {
                              alignItems: "center",
                              background: "var(--dsw-alias-bg-layer-2)",
                              border: "1px solid var(--dsw-alias-border-subtle)",
                              borderRadius: 9,
                              display: "flex",
                              gap: 8,
                              minHeight: 42,
                              padding: "0 10px"
                            }
                          },
                          h(StateDot, { state: captureBridgeReady ? "done" : "warning" }),
                          h(
                            "span",
                            { style: { color: "var(--dsw-alias-text-secondary)", flex: 1, fontSize: 11, lineHeight: 1.4 } },
                            captureBridgeReady
                              ? "已识别当前 DeepSeek 网页，可以自动抓取完整多轮对话。"
                              : "当前网页暂时无法自动抓取，请刷新网页或使用备用粘贴。"
                          ),
                          !captureBridgeReady &&
                            h(Button, { size: "sm", variant: "ghost", onClick: probeCaptureBridge }, "重试")
                        ),
                        h(
                          Button,
                          {
                            disabled: !captureBridgeReady || Boolean(busy),
                            icon: h(IconEnhanceOutline16),
                            variant: "primary",
                            onClick: () => void captureCurrentConversation()
                          },
                          busy === "capture"
                            ? "正在抓取当前对话…"
                            : sources.length
                              ? "更新当前对话来源"
                              : "添加当前对话为来源"
                        ),
                        (sources.length > 0 || summary) &&
                          h(
                            "div",
                            {
                              style: {
                                alignItems: "center",
                                border: "1px dashed var(--dsw-alias-border-subtle)",
                                borderRadius: 9,
                                display: "flex",
                                gap: 8,
                                minHeight: 42,
                                padding: "0 10px"
                              }
                            },
                            h(StateDot, { state: "done" }),
                            h("span", { style: { color: "var(--dsw-alias-text-secondary)", flex: 1, fontSize: 11 } }, "已自动保存当前工作草稿。"),
                            history.length > 0 &&
                              h(Button, { size: "sm", variant: "ghost", onClick: () => restoreHistory(0) }, "恢复上一版")
                          ),
                        h(
                          "details",
                          { style: { borderTop: "1px solid var(--dsw-alias-border-subtle)", paddingTop: 8 } },
                          h("summary", { style: { color: "var(--dsw-alias-text-tertiary)", cursor: "pointer", fontSize: 11 } }, "备用：粘贴原始对话"),
                          h(
                            "div",
                            { style: { display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", marginTop: 8 } },
                            h(Button, { disabled: Boolean(busy), icon: h(IconCopyOutline16), variant: "outline", onClick: () => void importClipboard() }, busy === "clipboard" ? "读取中…" : "从剪贴板导入"),
                            h(Button, { disabled: Boolean(busy), icon: h(IconEditOutline16), variant: "outline", onClick: () => setManualOpen((value) => !value) }, manualOpen ? "收起粘贴框" : "手动粘贴")
                          ),
                          manualOpen &&
                            h(
                              "section",
                              { style: { display: "grid", gap: 8, marginTop: 8 } },
                              h("textarea", { value: manualText, placeholder: "把 DeepSeek 对话粘贴到这里…", rows: 9, style: { ...textAreaStyle, lineHeight: 1.5, minHeight: 180 }, onChange: (event) => setManualText(event.target.value) }),
                              h(
                                Button,
                                {
                                  icon: h(IconCheckOutline16),
                                  variant: "primary",
                                  onClick: () => {
                                    try {
                                      acceptImportedText(manualText, "manual");
                                    } catch (error) {
                                      setMessageKind("error");
                                      setMessage(error instanceof Error ? error.message : String(error));
                                    }
                                  }
                                },
                                sources.length ? "替换当前来源" : "添加为当前来源"
                              )
                            )
                        ),
                        summary &&
                          h(HandoffSummaryPanel, {
                            answers,
                            busy,
                            handoff: summary,
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
                              setAnswers(Array.isArray(improved.open_questions) ? improved.open_questions.map(() => "") : []);
                              setReviewResult(null);
                              setMessageKind("success");
                              setMessage("已采用增强后的结构化需求。");
                            },
                            onClarify: () => void clarify(),
                            onRecapture: captureBridgeReady ? () => void captureCurrentConversation() : null,
                            onReview: () => void review(),
                            reviewResult,
                            sourcesChanged: needsIntegration
                          })
                      ),
                      h(DshTargetStep, { projectPath: currentWorkspace }),
                      h(DeliveryStep, {
                        alreadyLoaded: currentVersionLoaded,
                        busy,
                        handoff: summary,
                        onLoad: loadCurrentVersion,
                        projectPath: currentWorkspace,
                        sourcesChanged: needsIntegration
                      }),
                      h(ExecutionSnapshotPanel, {
                        busy,
                        history: executionHistory,
                        onReload: reloadExecutionSnapshot,
                        onRevise: reviseFromSnapshot
                      })
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
                  h(Toast, {
                    text: message,
                    icon: messageKind === "error" ? h(IconWarningOutline16) : undefined,
                    onDone: () => setMessage("")
                  })
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
                "当前来源、需求草稿、最近 3 份恢复记录和冻结执行快照保存在此浏览器；只有点击“整合并强化来源”才调用 DSH 模型。无需另填 API Key。"
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
            "DeepSeek 登录状态由当前浏览器管理。自动抓取由 SpecsRelay 浏览器捕获组件在当前 DeepSeek 页面内执行，原始对话通过本地桥直接交给 DSH。"
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
            Button,
            {
              onClick,
              title: "打开 DeepSeek 页签",
              "aria-label": "打开 DeepSeek 页签",
              variant: "ghost",
              style: {
                justifyContent: wide ? "flex-start" : "center",
                margin: "0 8px",
                overflow: "hidden",
                padding: wide ? "0 10px" : 0,
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
          Button,
          {
            icon: h(IconSendOutline14),
            onClick,
            size: "sm",
            title: "载入最近的 SpecsRelay for DeepSeek 需求",
            variant: "toolbar"
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
