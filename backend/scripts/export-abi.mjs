import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { resolve } from "path";

const root = process.cwd();
const projectRoot = resolve(root, "..");
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", "artifacts", "cache", "typechain-types" , "out"]);

function findDirectoriesNamedDeployments(startDir) {
  const result = [];
  const stack = [startDir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (IGNORE_DIRS.has(entry.name)) continue;
      const full = resolve(current, entry.name);
      if (entry.name === "deployments") {
        result.push(full);
      } else {
        stack.push(full);
      }
    }
  }
  return result;
}

function listNetworkDeploymentFiles(deploymentsDir, contractName) {
  const files = [];
  let entries;
  try {
    entries = readdirSync(deploymentsDir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = resolve(deploymentsDir, entry.name);
    if (entry.isDirectory()) {
      const candidate = resolve(full, `${contractName}.json`);
      if (existsSync(candidate)) {
        files.push({ path: candidate, network: entry.name });
      }
    } else if (entry.isFile() && entry.name === `${contractName}.json`) {
      files.push({ path: full, network: "unknown" });
    }
  }
  return files;
}

function resolveDeploymentPath(contractName) {
  // Priority list
  const priority = ["hardhat", "localhost", "anvil", "sepolia"];

  // 1) Explicit NETWORK override
  if (process.env.NETWORK) {
    const p1 = resolve(root, "deployments", process.env.NETWORK, `${contractName}.json`);
    if (existsSync(p1)) return { path: p1, network: process.env.NETWORK };
  }

  // 2) Check typical locations under current root (backend)
  for (const net of [process.env.NETWORK, ...priority].filter(Boolean)) {
    const candidate = resolve(root, "deployments", net, `${contractName}.json`);
    if (existsSync(candidate)) return { path: candidate, network: net };
  }

  // 3) Scan the entire project for any deployments directory
  const deploymentsDirs = Array.from(new Set([
    resolve(root, "deployments"),
    resolve(projectRoot, "deployments"),
    ...findDirectoriesNamedDeployments(projectRoot),
  ]));

  const found = [];
  for (const d of deploymentsDirs) {
    found.push(...listNetworkDeploymentFiles(d, contractName));
  }

  if (found.length > 0) {
    // Prefer env.NETWORK if present, then priority order
    const envNet = process.env.NETWORK;
    if (envNet) {
      const m = found.find(f => f.network === envNet);
      if (m) return m;
    }
    const byPriority = found.sort((a, b) => {
      const ai = priority.indexOf(a.network);
      const bi = priority.indexOf(b.network);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return byPriority[0];
  }

  // 4) Final fallback (will throw a clear error when trying to read)
  return { path: resolve(root, "deployments", "hardhat", `${contractName}.json`), network: "hardhat" };
}

function readExistingAddresses(addressesPath) {
  try {
    if (!existsSync(addressesPath)) return {};
    const content = readFileSync(addressesPath, "utf-8");
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1) return {};
    const jsonText = content.slice(start, end + 1);
    return JSON.parse(jsonText);
  } catch {
    return {};
  }
}

function main() {
  const contractName = "OnchainDiary";
  const { path: deploymentPath, network } = resolveDeploymentPath(contractName);
  const data = JSON.parse(readFileSync(deploymentPath, "utf-8"));
  const outDir = resolve(root, "..", "frontend", "abi");
  mkdirSync(outDir, { recursive: true });

  // Write ABI file
  const abiTs = `export const ${contractName}ABI = ${JSON.stringify({ abi: data.abi }, null, 2)} as const;\n`;
  writeFileSync(resolve(outDir, `${contractName}ABI.ts`), abiTs);

  // Prepare/merge addresses and ensure 31337 mapping gets written
  const addressesPath = resolve(outDir, `${contractName}Addresses.ts`);
  const addressesMap = readExistingAddresses(addressesPath);

  // Determine chainId for the current deployment (fallbacks for common networks)
  let networkChainId = Number(data.chainId) || undefined;
  if (!networkChainId) {
    if (network === "sepolia") networkChainId = 11155111;
    else networkChainId = 31337; // hardhat/localhost/anvil default
  }
  const chainName = data.networkName || (networkChainId === 11155111 ? "sepolia" : "localhost");

  // Always update the mapping for the detected network
  addressesMap[String(networkChainId)] = { address: data.address, chainId: networkChainId, chainName };

  // Additionally, ensure 31337 mapping is present/updated when running on local networks
  if (networkChainId === 31337) {
    addressesMap["31337"] = { address: data.address, chainId: 31337, chainName: "localhost" };
  }

  const addrTs = `export const ${contractName}Addresses = ${JSON.stringify(addressesMap, null, 2)} as const;\n`;
  writeFileSync(addressesPath, addrTs);

  console.log("ABI exported to Diary/frontend/abi; updated addresses for", networkChainId);
}

main();


