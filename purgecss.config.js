module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: ["_site/assets/css/*.css"],
  output: "_site/assets/css/",
  safelist: { standard: ["js", "menu-open", "open", "light", "dark"], greedy: [/data-theme/, /data-tag/, /publication-/, /pub-tag/, /paper-action/] },
  skippedContentGlobs: ["_site/assets/**/*.html"],
};
