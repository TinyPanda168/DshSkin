import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { mkdtempSync } from "node:fs";
import { HOSTS, identifyHost, resolveHostInstallation } from "../installer/hosts.js";
import { installCommand, profileDependencyCommand } from "../installer/install.js";

test("client adapters resolve separate profiles and DSH homes", () => {
  assert.equal(HOSTS.find((host) => host.id === "dsh-desktop").profile, "desktop");
  assert.equal(HOSTS.find((host) => host.id === "pilot-harness").profile, "web");
  assert.equal(HOSTS.find((host) => host.id === "dataelement-dsh-desktop").profile, "web");
  assert.equal(HOSTS.find((host) => host.id === "myyang-dsh-desktop").profile, "web");
});

test("metadata distinguishes same-name DSH Desktop applications", () => {
  const root = mkdtempSync(join(tmpdir(), "specsrelay-installer-"));
  try {
    mkdirSync(join(root, "resources", "app"), { recursive: true });
    writeFileSync(
      join(root, "resources", "app", "package.json"),
      JSON.stringify({
        name: "dsh-desktop",
        repository: "https://github.com/dataelement/dsh-desktop"
      })
    );
    assert.equal(identifyHost(root, { platform: "win32" }).host.id, "dataelement-dsh-desktop");

    writeFileSync(
      join(root, "resources", "app", "package.json"),
      JSON.stringify({ name: "dsh-desktop", productName: "DSH Desktop" })
    );
    assert.equal(identifyHost(root, { platform: "win32" }).host.id, "myyang-dsh-desktop");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("install command uses the adapter profile and data directory", () => {
  const root = mkdtempSync(join(tmpdir(), "specsrelay-installer-"));
  try {
    const host = HOSTS.find((candidate) => candidate.id === "dataelement-dsh-desktop");
    const dshBin = join(root, "resources", "app", "node_modules", "@deepseek-ai", "dsh", "lib", "bin.js");
    const nodeBin = join(root, "resources", "app", "node_modules", "node", "bin", "node.exe");
    const marketInstaller = join(
      root,
      "resources",
      "app",
      "node_modules",
      "dsh-desktop-market-installer"
    );
    mkdirSync(join(dshBin, ".."), { recursive: true });
    mkdirSync(join(nodeBin, ".."), { recursive: true });
    mkdirSync(marketInstaller, { recursive: true });
    writeFileSync(dshBin, "");
    writeFileSync(nodeBin, "");
    const installation = resolveHostInstallation(host, root, {
      platform: "win32",
      home: "C:\\Users\\tester",
      dshHome: "C:\\dsh-home"
    });
    const command = installCommand(installation, "github:owner/plugin");
    assert.equal(command.command, nodeBin);
    assert.deepEqual(command.args, [
      dshBin,
      "plugin",
      "--profile",
      "web",
      "add",
      "github:owner/plugin"
    ]);
    assert.equal(command.environment.DSH_HOME, "C:\\dsh-home");
    assert.deepEqual(profileDependencyCommand(installation), {
      command: nodeBin,
      args: [
        dshBin,
        "plugin",
        "--profile",
        "web",
        "add",
        `file:${marketInstaller}`
      ],
      environment: {
        ...process.env,
        DSH_HOME: "C:\\dsh-home"
      }
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
