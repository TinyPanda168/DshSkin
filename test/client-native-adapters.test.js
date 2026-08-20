import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses a desktop-provided directory picker before the DSH web fallback", async () => {
  const client = await readFile(new URL("../client-native.js", import.meta.url), "utf8");

  assert.match(client, /const desktopPicker = window\.dshDesktopDirectoryPicker;/);
  assert.match(client, /desktopPicker\.pick\(\)/);
  assert.match(client, /ctx\.workspaces\.pickDirectory\(\)/);
});
