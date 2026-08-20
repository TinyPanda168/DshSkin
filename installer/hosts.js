import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { execFileSync } from "node:child_process";

export const HOSTS = [
  {
    id: "dsh-desktop",
    name: "DSH Desktop by anywhere-labs",
    bundleId: "ai.deepseek.dsh.desktop",
    profile: "desktop",
    dshHome: ({ home, environment }) => environment.DSH_HOME || join(home, ".dsh"),
    dshBins: [
      "Contents/Resources/app.asar.unpacked/node_modules/@deepseek-ai/dsh/lib/bin.js",
      "resources/app.asar.unpacked/node_modules/@deepseek-ai/dsh/lib/bin.js"
    ],
    nodeBins: []
  },
  {
    id: "pilot-harness",
    name: "Pilot Harness",
    bundleId: "com.codepilot.pilotharness",
    profile: "web",
    dshHome: ({ home, environment, platform }) =>
      environment.PILOT_HARNESS_DSH_HOME ||
      (platform === "win32"
        ? join(environment.APPDATA || join(home, "AppData", "Roaming"), "Pilot Harness", "harness")
        : join(home, "Library", "Application Support", "Pilot Harness", "harness")),
    dshBins: [
      "Contents/Resources/app/node_modules/@deepseek-ai/dsh/lib/bin.js",
      "resources/app/node_modules/@deepseek-ai/dsh/lib/bin.js"
    ],
    nodeBins: []
  },
  {
    id: "dataelement-dsh-desktop",
    name: "DSH Desktop by DataElement",
    bundleId: "io.dsh.desktop",
    profile: "web",
    dshHome: ({ home, environment, platform }) =>
      environment.DSH_HOME ||
      (platform === "win32"
        ? join(environment.APPDATA || join(home, "AppData", "Roaming"), "dsh-desktop", "harness")
        : join(home, "Library", "Application Support", "dsh-desktop", "harness")),
    dshBins: [
      "Contents/Resources/app/node_modules/@deepseek-ai/dsh/lib/bin.js",
      "resources/app/node_modules/@deepseek-ai/dsh/lib/bin.js"
    ],
    nodeBins: [
      "Contents/Resources/app/node_modules/node/bin/node",
      "resources/app/node_modules/node/bin/node.exe"
    ],
    profileDependencies: [
      {
        name: "dsh-desktop-market-installer",
        paths: [
          "Contents/Resources/app/node_modules/dsh-desktop-market-installer",
          "resources/app/node_modules/dsh-desktop-market-installer"
        ]
      }
    ]
  },
  {
    id: "myyang-dsh-desktop",
    name: "DSH Desktop by myYangyunfan",
    bundleId: "com.deepseek.dsh.desktop",
    profile: "web",
    dshHome: ({ home, environment }) => environment.DSH_HOME || join(home, ".dsh"),
    dshBins: [
      "Contents/Resources/app/node_modules/@deepseek-ai/dsh/lib/bin.js",
      "resources/app/node_modules/@deepseek-ai/dsh/lib/bin.js"
    ],
    nodeBins: [
      "Contents/Resources/node/node",
      "resources/node/node.exe"
    ]
  }
];

function firstExisting(root, candidates) {
  return candidates.map((candidate) => join(root, candidate)).find(existsSync);
}

function macBundleValue(appPath, key) {
  return execFileSync(
    "/usr/bin/plutil",
    ["-extract", key, "raw", "-o", "-", join(appPath, "Contents", "Info.plist")],
    { encoding: "utf8" }
  ).trim();
}

function applicationRoot(appPath, platform) {
  return platform === "win32" && extname(appPath).toLowerCase() === ".exe"
    ? dirname(appPath)
    : appPath;
}

function packageMetadata(appPath, platform) {
  const root = applicationRoot(appPath, platform);
  const candidates =
    platform === "darwin"
      ? [
          "Contents/Resources/app/package.json",
          "Contents/Resources/app.asar.unpacked/package.json"
        ]
      : ["resources/app/package.json", "resources/app.asar.unpacked/package.json"];
  for (const candidate of candidates) {
    try {
      return JSON.parse(readFileSync(join(root, candidate), "utf8"));
    } catch {
      // Continue to the next unpacked package metadata location.
    }
  }
  return undefined;
}

function hostFromMetadata(metadata) {
  const repository = String(
    typeof metadata?.repository === "string"
      ? metadata.repository
      : metadata?.repository?.url || ""
  ).toLowerCase();
  if (repository.includes("dataelement/dsh-desktop")) return HOSTS[2];
  if (repository.includes("op7418/pilot-harness")) return HOSTS[1];
  if (repository.includes("anywhere-labs/deepseek-harness-desktop")) return HOSTS[0];
  if (metadata?.name === "dsh-plugin-desktop") return HOSTS[0];
  if (metadata?.productName === "Pilot Harness") return HOSTS[1];
  if (metadata?.name === "dsh-desktop") return HOSTS[3];
  return undefined;
}

function executableFor(appPath, platform, bundleExecutable) {
  if (platform === "darwin") {
    return join(appPath, "Contents", "MacOS", bundleExecutable || basename(appPath, ".app"));
  }
  return appPath;
}

export function resolveHostInstallation(host, appPath, {
  platform = process.platform,
  home = homedir(),
  environment = process.env,
  dshHome,
  bundleExecutable
} = {}) {
  const root = applicationRoot(appPath, platform);
  const dshBin = firstExisting(root, host.dshBins);
  const bundledNode = firstExisting(root, host.nodeBins);
  const profileDependencies = (host.profileDependencies || []).map((dependency) => {
    const dependencyPath = firstExisting(root, dependency.paths);
    if (!dependencyPath) {
      throw new Error(`${host.name} 中没有找到配套组件 ${dependency.name}。请升级客户端后重试。`);
    }
    return { name: dependency.name, packageSpec: `file:${dependencyPath}` };
  });
  const executable = executableFor(appPath, platform, bundleExecutable);
  if (!dshBin) {
    throw new Error(`${host.name} 中没有找到 DSH 命令。请升级客户端后重试。`);
  }
  if (!bundledNode && !existsSync(executable)) {
    throw new Error(`${host.name} 的运行程序不存在：${executable}`);
  }
  return {
    hostId: host.id,
    hostName: host.name,
    appPath,
    profile: host.profile,
    dshHome: dshHome || host.dshHome({ home, environment, platform }),
    executable: bundledNode || executable,
    dshBin,
    profileDependencies,
    electronRunAsNode: !bundledNode
  };
}

function macApplicationRoots(extraRoots = []) {
  return ["/Applications", join(homedir(), "Applications"), ...extraRoots];
}

function macApplications(roots) {
  const apps = [];
  for (const root of roots) {
    let entries;
    try {
      entries = readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith(".app")) {
        apps.push(join(root, entry.name));
      }
    }
  }
  return apps;
}

function windowsApplications(environment, extraRoots) {
  const roots = [
    environment.LOCALAPPDATA && join(environment.LOCALAPPDATA, "Programs"),
    environment.ProgramFiles,
    environment["ProgramFiles(x86)"],
    ...extraRoots
  ].filter(Boolean);
  const directories = ["DSH Desktop", "Pilot Harness", "pilot-harness", "dsh-desktop"];
  const executables = ["DSH Desktop.exe", "Pilot Harness.exe", "pilot-harness.exe", "dsh-desktop.exe"];
  const candidates = [];
  for (const root of roots) {
    for (const directory of directories) {
      for (const executable of executables) {
        const candidate = join(root, directory, executable);
        if (existsSync(candidate)) candidates.push(candidate);
      }
    }
  }
  return [...new Set(candidates)];
}

export function identifyHost(appPath, { platform = process.platform } = {}) {
  if (platform === "darwin") {
    try {
      const bundleId = macBundleValue(appPath, "CFBundleIdentifier");
      const host = HOSTS.find((candidate) => candidate.bundleId === bundleId);
      if (host) {
        return {
          host,
          bundleExecutable: macBundleValue(appPath, "CFBundleExecutable")
        };
      }
    } catch {
      // Fall back to unpacked package metadata below.
    }
  }
  const host = hostFromMetadata(packageMetadata(appPath, platform));
  return host ? { host } : undefined;
}

export function detectHostInstallations({
  platform = process.platform,
  appPaths,
  hostId,
  dshHome,
  extraRoots = [],
  environment = process.env
} = {}) {
  const candidates = appPaths?.length
    ? appPaths
    : platform === "darwin"
      ? macApplications(macApplicationRoots(extraRoots))
      : platform === "win32"
        ? windowsApplications(environment, extraRoots)
        : [];
  const installations = [];
  for (const appPath of candidates) {
    const identified = identifyHost(appPath, { platform });
    if (!identified || (hostId && identified.host.id !== hostId)) continue;
    installations.push(
      resolveHostInstallation(identified.host, appPath, {
        platform,
        dshHome,
        environment,
        bundleExecutable: identified.bundleExecutable
      })
    );
  }
  return installations;
}
