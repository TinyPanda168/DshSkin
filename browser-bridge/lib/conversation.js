export const CONVERSATION_ENVELOPE_VERSION = "1.0";
export const CONVERSATION_PROFILE = "conversation@1";

const ALLOWED_ROLES = new Set(["user", "assistant", "system", "tool"]);
const MAX_MESSAGES = 2000;
const MAX_CONTENT_CHARACTERS = 2_000_000;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function messageContentLength(messages) {
  return messages.reduce(
    (total, message) => total + String(message?.content ?? "").length,
    0
  );
}

export function validateConversationEnvelope(value) {
  const errors = [];
  const warnings = [];

  if (!isRecord(value)) {
    return {
      errors: ["Conversation envelope must be an object."],
      warnings
    };
  }
  if (value.conversation_version !== CONVERSATION_ENVELOPE_VERSION) {
    errors.push(
      `conversation_version must be "${CONVERSATION_ENVELOPE_VERSION}".`
    );
  }
  if (value.profile !== CONVERSATION_PROFILE) {
    errors.push(`profile must be "${CONVERSATION_PROFILE}".`);
  }
  if (!nonEmptyString(value.capture_id)) {
    errors.push("capture_id must be a non-empty string.");
  }
  if (!nonEmptyString(value.captured_at)) {
    errors.push("captured_at must be a non-empty string.");
  }
  if (!isRecord(value.source) || !nonEmptyString(value.source.connector_id)) {
    errors.push("source.connector_id must be a non-empty string.");
  }
  if (!Array.isArray(value.messages) || value.messages.length === 0) {
    errors.push("messages must contain at least one conversation message.");
    return { errors, warnings };
  }
  if (value.messages.length > MAX_MESSAGES) {
    errors.push(`messages must not contain more than ${MAX_MESSAGES} items.`);
  }

  let userMessages = 0;
  let assistantMessages = 0;
  value.messages.forEach((message, index) => {
    if (!isRecord(message)) {
      errors.push(`messages[${index}] must be an object.`);
      return;
    }
    if (!ALLOWED_ROLES.has(message.role)) {
      errors.push(`messages[${index}].role is unsupported.`);
    }
    if (
      !nonEmptyString(message.content) &&
      (!Array.isArray(message.media) || message.media.length === 0)
    ) {
      errors.push(`messages[${index}] has no text or media content.`);
    }
    if (message.role === "user") {
      userMessages += 1;
    } else if (message.role === "assistant") {
      assistantMessages += 1;
    }
  });

  if (messageContentLength(value.messages) > MAX_CONTENT_CHARACTERS) {
    errors.push(
      `conversation content must not exceed ${MAX_CONTENT_CHARACTERS} characters.`
    );
  }
  if (userMessages === 0) {
    warnings.push("No user messages were captured.");
  }
  if (assistantMessages === 0) {
    warnings.push("No assistant messages were captured.");
  }

  return { errors, warnings };
}

function appendMedia(lines, media) {
  if (!Array.isArray(media)) {
    return;
  }
  for (const item of media) {
    if (!isRecord(item)) {
      continue;
    }
    const label = String(item.name ?? item.type ?? "media").trim() || "media";
    const url = String(item.url ?? "").trim();
    lines.push(url ? `[Attachment: ${label}] ${url}` : `[Attachment: ${label}]`);
  }
}

export function formatConversationTranscript(envelope) {
  const validation = validateConversationEnvelope(envelope);
  if (validation.errors.length > 0) {
    throw new Error(
      `Invalid conversation envelope: ${validation.errors.join(" ")}`
    );
  }

  const source = envelope.source;
  const lines = [
    `Conversation provider: ${source.provider_label ?? source.provider ?? source.connector_id}`,
    `Conversation title: ${source.title ?? "Untitled conversation"}`
  ];
  if (source.url) {
    lines.push(`Conversation URL: ${source.url}`);
  }
  lines.push("");

  envelope.messages.forEach((message, index) => {
    const role =
      message.role === "assistant"
        ? "Assistant"
        : message.role === "user"
          ? "User"
          : message.role[0].toUpperCase() + message.role.slice(1);
    const turn = Number.isFinite(message.turn_index)
      ? ` · Turn ${message.turn_index + 1}`
      : "";
    lines.push(`## ${role}${turn}`);
    const content = String(message.content ?? "").trim();
    if (content) {
      lines.push(content);
    }
    appendMedia(lines, message.media);
    appendMedia(lines, message.attachments);
    lines.push("");
  });

  return lines.join("\n").trim();
}
