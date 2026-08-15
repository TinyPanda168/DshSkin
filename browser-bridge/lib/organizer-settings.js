export const ORGANIZER_SETTINGS_KEY = "organizerApi";

const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

export function normalizeOrganizerSettings(value = {}) {
  return {
    model:
      typeof value.model === "string"
        ? value.model.trim()
        : DEFAULT_DEEPSEEK_MODEL,
    apiKey: typeof value.apiKey === "string" ? value.apiKey.trim() : ""
  };
}

export function validateOrganizerSettings(value, { requireApiKey = true } = {}) {
  const settings = normalizeOrganizerSettings(value);
  const errors = [];

  if (!settings.model) {
    errors.push("Organizer model is required.");
  } else if (
    settings.model.length > 160 ||
    /[\0\r\n]/.test(settings.model)
  ) {
    errors.push("Organizer model is invalid.");
  }
  if (requireApiKey && !settings.apiKey) {
    errors.push("API key is required.");
  }
  if (settings.apiKey.length > 4096 || /[\0\r\n]/.test(settings.apiKey)) {
    errors.push("API key is invalid.");
  }

  return { settings, errors };
}

export function organizerDisplayName() {
  return "DeepSeek";
}

export function isOrganizerConfigured(value) {
  return validateOrganizerSettings(value).errors.length === 0;
}
