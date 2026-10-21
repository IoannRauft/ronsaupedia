import { permalinkFor } from "../../../lib/garden.js";

export default {
  layout: "note.njk",
  tags: ["note"],
  eleventyComputed: {
    // Unpublished notes (dg-publish: false) get no page; the garden home note becomes "/".
    permalink: (data) => permalinkFor(data.page.inputPath),
    eleventyExcludeFromCollections: (data) => data["dg-publish"] === false,
    title: (data) => data.title || data.page.fileSlug,
  },
};
