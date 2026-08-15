# SpecsRelay DSH Bridge

This private browser bridge belongs to SpecsRelay-DSH. It has no toolbar workflow or general chatbot side panel. It gives the DSH WebUI permission to capture the embedded `chat.deepseek.com` frame after a user click and stores the DeepSeek organizer API settings entered inside DSH.

Load this directory as an unpacked Chromium extension once. The bridge calls the DeepSeek API directly from its isolated background worker; it does not require the Chrome Web Store extension or the SpecsRelay native host.

The bridge never reads DeepSeek cookies or credentials. Conversation capture stays local until the user selects **总结为需求** in DSH.
