import { resolveLink } from "./lib/garden.js";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

// Renders Obsidian-style [[target|alias]] and ![[image]] links.
function wikilinks(md) {
  md.inline.ruler.before("link", "wikilink", (state, silent) => {
    const src = state.src.slice(state.pos);
    const match = /^(!?)\[\[([^\]]+)\]\]/.exec(src);
    if (!match) return false;
    if (!silent) {
      const [target, alias] = match[2].replace(/\\\|/g, "|").split("|");
      const [page, heading] = target.split("#");
      if (match[1] && IMAGE_EXT.test(page)) {
        const token = state.push("html_inline", "", 0);
        token.content = `<img src="/img/user/${encodeURI(page.trim())}" alt="${md.utils.escapeHtml(alias || page)}">`;
      } else {
        const label = md.utils.escapeHtml((alias || page.split("/").pop()).trim());
        const url = resolveLink(page);
        const token = state.push("html_inline", "", 0);
        token.content = url
          ? `<a class="internal-link" href="${url}${heading ? "#" + encodeURIComponent(heading.trim()) : ""}">${label}</a>`
          : `<span class="internal-link is-unresolved">${label}</span>`;
      }
    }
    state.pos += match[0].length;
    return true;
  });
}

export default function (eleventyConfig) {
  eleventyConfig.amendLibrary("md", (md) => md.use(wikilinks));
  eleventyConfig.addPassthroughCopy({ "src/site/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/site/styles": "styles" });

  return {
    dir: { input: "src/site", output: "out" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
