import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const uxAuditDir = path.join(repoRoot, "output", "playwright", "ux-audit");
const transientFiles = [
  path.join(repoRoot, ".agent", "ux-audit.md"),
  path.join(repoRoot, ".agent", "execplan-pending.md"),
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function clearDirContents(dir) {
  await ensureDir(dir);
  const entries = await fs.readdir(dir);
  await Promise.all(
    entries.map((entry) =>
      fs.rm(path.join(dir, entry), { recursive: true, force: true }),
    ),
  );
}

async function removeIfPresent(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

async function main() {
  await clearDirContents(uxAuditDir);
  for (const transientFile of transientFiles) {
    await removeIfPresent(transientFile);
  }
  console.log("cleanup:ux-artifacts complete");
}

main().catch((error) => {
  console.error("cleanup:ux-artifacts failed");
  console.error(error);
  process.exit(1);
});
