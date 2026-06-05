import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([
  ".git",
  ".github",
  ".kamal",
  "_root",
  "config",
  "docker",
  "node_modules",
  "scripts",
]);

function titleize(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const entries = await readdir(root, { withFileTypes: true });
const apps = [];

for (const entry of entries) {
  if (!entry.isDirectory() || ignoredDirs.has(entry.name) || entry.name.startsWith(".")) {
    continue;
  }

  try {
    await readFile(join(root, entry.name, "index.html"), "utf8");
    apps.push(entry.name);
  } catch {
    // Folders without an index.html are intentionally not exposed.
  }
}

apps.sort((a, b) => a.localeCompare(b));

const template = await readFile(join(root, "_root", "index.template.html"), "utf8");
const links = apps
  .map((app) => `        <a href="https://${app}.assetstacks.com">${titleize(app)}</a>`)
  .join("\n");

const html = template
  .replaceAll("{{APP_COUNT}}", String(apps.length))
  .replaceAll("{{APPS}}", links || '        <p class="empty">No games deployed yet.</p>');

await writeFile(join(root, "_root", "index.html"), html);
console.log(`Generated _root/index.html with ${apps.length} games`);
