// Scans the notes published by the Obsidian Digital Garden plugin so that
// [[wikilinks]] can be resolved to the permalink of the target note.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const NOTES_DIR = "src/site/notes";

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

export function isHome(data) {
  const tags = [].concat(data.tags || []);
  return data["dg-home"] === true || tags.includes("gardenEntry");
}

export const notes = walk(NOTES_DIR)
  .map((file) => {
    const { data } = matter(fs.readFileSync(file, "utf8"));
    const rel = path.relative(NOTES_DIR, file).split(path.sep).join("/").replace(/\.md$/, "");
    return { rel, name: rel.split("/").pop(), data };
  })
  .filter((note) => note.data["dg-publish"] !== false);

export const hasHome = notes.some((note) => isHome(note.data));

const byKey = new Map();
for (const note of notes) {
  const url = isHome(note.data) ? "/" : note.data.permalink || `/notes/${note.rel}/`;
  byKey.set(note.rel.toLowerCase(), url);
  if (!byKey.has(note.name.toLowerCase())) byKey.set(note.name.toLowerCase(), url);
}

export function permalinkFor(inputPath) {
  const rel = path.relative(NOTES_DIR, inputPath).split(path.sep).join("/").replace(/\.md$/, "");
  const note = notes.find((n) => n.rel === rel);
  if (!note) return false;
  return isHome(note.data) ? "/" : note.data.permalink || `/notes/${rel}/`;
}

export function resolveLink(target) {
  return byKey.get(target.replace(/\.md$/, "").trim().toLowerCase());
}
