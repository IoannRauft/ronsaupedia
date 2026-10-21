import { hasHome } from "../../lib/garden.js";

// Fallback home page listing every note, used until a note is marked as the garden home.
export default class {
  data() {
    return { layout: "note.njk", title: "Ронсаупедия", permalink: hasHome ? false : "/" };
  }

  render({ collections }) {
    const groups = new Map();
    for (const note of collections.note || []) {
      const folder = note.page.filePathStem.replace(/^\/notes\/?/, "").split("/").slice(0, -1).join(" / ") || "Заметки";
      if (!groups.has(folder)) groups.set(folder, []);
      groups.get(folder).push(note);
    }
    const sections = [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "ru"))
      .map(([folder, items]) => {
        const links = items
          .sort((a, b) => a.data.title.localeCompare(b.data.title, "ru"))
          .map((n) => `<li><a href="${n.url}">${n.data.title}</a></li>`)
          .join("");
        return `<h2>${folder}</h2><ul>${links}</ul>`;
      })
      .join("");
    return `<h1>Ронсаупедия</h1><p>Легенды Бал'лазатта.</p>${sections}`;
  }
}
