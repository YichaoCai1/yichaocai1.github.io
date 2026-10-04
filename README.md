# Yichao Cai — Academic Website

Source for my personal academic homepage, live at **[yichaocai.com](https://yichaocai.com)**.

This website is based on the [**al-folio**](https://github.com/alshedivat/al-folio) Jekyll theme,
with a full-site visual adaptation of [Pavlo Bazilinskyy’s website](https://github.com/bazilinskyy/bazilinskyy.github.io).
All content (bio, news, publications, blog, teaching & service) is configured through `_config.yml`,
`_pages/`, `_data/`, `_bibliography/papers.bib`, `_news/`, and `_posts/`.

## Run locally

Use Ruby 3.4.2, matching the deployment workflow.

```bash
bundle install
bundle exec jekyll serve --livereload
```

Then open <http://localhost:4000>.

## Add a Markdown blog post

Create `_posts/YYYY-MM-DD-your-post-title.md` with this front matter, followed by the article body:

```yaml
---
layout: essay
title: "Your post title"
date: YYYY-MM-DD
description: A short summary for the blog index.
tags: representation-learning
author: Yichao Cai
read_time: 12
lang: en
essay: true
lang_zh_url: /zh/blog/
---
```

The `essay` layout uses the existing site navigation, article typography, light/dark colors,
MathJax, and automatic contents disclosure. The title is rendered by the layout, so start the
body with prose and use `##` for sections. The post appears automatically in the blog index,
tag/year archives, search, and feed at `/blog/YYYY/your-post-title/`. No redirect entry or
separate HTML copy is needed. The date controls ordering; future-dated posts are excluded
from the normal build until their date arrives.

For this site's Kramdown parser, use `$$...$$` for inline math and put the same delimiters
on separate lines for display equations. Store figures in `assets/img/posts/your-post-title/`
and use the existing figure include for responsive images and captions:

```liquid
{%
  include figure.liquid
  path="assets/img/posts/your-post-title/figure.png"
  alt="A description of what the figure shows."
  caption="Figure 1: The figure caption."
  zoomable=true
%}
```

Preview with `bundle exec jekyll serve --livereload` and check the new post from `/blog/`.

## Deploy

Pushing to the `main` branch triggers the GitHub Actions workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), which builds the site and publishes
it directly to GitHub Pages. The custom domain (`yichaocai.com`) is configured via the `CNAME` file and
the repository's GitHub Pages settings.

## Credits & License

Built with [al-folio](https://github.com/alshedivat/al-folio) by Maruan Al-Shedivat and contributors,
released under the [MIT License](LICENSE). Site content © Yichao Cai.

## Theme, navigation, and publications

The shared design follows [Pavlo Bazilinskyy’s theme](https://github.com/bazilinskyy/bazilinskyy.github.io): a fixed full-width navigation bar, a 1,000px content frame, Source Sans Pro at 16px, a two-column homepage, and light/dark publication panels. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

- Biography and research: _pages/about.md and _pages/about_zh.md. The research-section marker separates the biography and research text.
- Teaching and service: _includes/home/. These records appear on the homepage and dedicated bilingual pages; old homepage anchors remain valid.
- Publication records: _bibliography/papers.bib. Set selected={true} for homepage papers. Both lists use the exact same _layouts/bib.liquid item. A highlight={Spotlight} value is always bold.
- Publication tags: _data/publication_tags.json, keyed by BibTeX ID. Keep type, methods, topics, and domains editorially specific; conference papers with arXiv links remain Conference.
- Catalogue: /publications/ and /zh/publications/. Filters use OR within a group and AND across groups; query parameters preserve searches and paper fragment links remain usable.
- Navigation/footer: _includes/header.liquid and _includes/footer.liquid. The reading list remains a diamond with an accessible label.
- Research agenda: three Markdown-driven research strands in `minimal-agenda/content/strands/`, with contextual publication evidence and separate ongoing/future questions. The four-stage overview is non-clickable and retains its circulating loop, with a pause control and reduced-motion support. Strand URLs such as `/research-agenda/#masked` support direct links and browser history. See `minimal-agenda/content/README.md` for editing instructions.
- Theme: assets/css/academic.css. Essay refinements: assets/essays/blog-theme.css. Agenda refinements: minimal-agenda/assets/academic-agenda.css.
- Standalone essays retain their original HTML URLs and article content. Their old embedded page styles were consolidated into the shared stylesheets. PDF essays use themed reading pages with an embedded viewer and a download link; the original PDF URLs and files are preserved.

Local PDFs open in the self-hosted PDF.js reader on desktop and mobile. The CV uses `/pdf/?file=...`; PDF essays share `_includes/pdf-reader.liquid`. Links with a `download` attribute remain explicit downloads. PDF.js is pinned to 6.3.289 under `assets/vendor/pdfjs/`; its site skin and defaults live in `assets/css/pdf-viewer.css` and `assets/js/pdf-viewer-config.js`. When updating the vendor files, preserve the two local includes in `web/viewer.html` and the upstream licenses. Keep the complete `assets/vendor/pdfjs/` folder in Git: the PDF reader cannot run from the wrapper page alone. `.gitignore` explicitly allows this bundle while ignoring other vendor dependencies.

After building, run `python3 _scripts/validate_pdf_reader.py`. Deployment runs this check before uploading the Pages artifact, verifying the viewer, its bundled resources, and the PDFs linked from reading pages. PDF.js is excluded from Jekyll minification because the CSS minifier corrupts its modern page-sizing calculations. `_plugins/preserve_pdfjs.rb` also keeps Jekyll Terser from rewriting its fallback modules; validation checks that the bundle is copied unchanged.

After building, run python3 _scripts/validate_theme.py for internal links, assets, anchors, shared card identity, and the Spotlight/diamond requirements. Add --external for outbound checks (some sites block automated requests). Run node --test minimal-agenda/tests/content-loader.test.js for agenda content checks. Reports in _design/theme-validation are not published by Jekyll.
