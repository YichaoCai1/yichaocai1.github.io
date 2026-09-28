# Yichao Cai — Academic Website

Source for my personal academic homepage, live at **[yichaocai.com](https://yichaocai.com)**.

This website is based on the [**al-folio**](https://github.com/alshedivat/al-folio) Jekyll theme,
with the layout inspired by [smsnobin77.github.io](https://github.com/smsnobin77/smsnobin77.github.io).
All content (bio, news, publications, blog, teaching & service) is configured through `_config.yml`,
`_pages/`, `_data/`, `_bibliography/papers.bib`, `_news/`, and `_posts/`.

## Run locally

Requires Ruby ≥ 3.1 (developed on 3.3.5).

```bash
bundle install
bundle exec jekyll serve --livereload
```

Then open <http://localhost:4000>.

## Deploy

Pushing to the `main` branch triggers the GitHub Actions workflow
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), which builds the site and publishes
it to the `gh-pages` branch. The custom domain (`yichaocai.com`) is configured via the `CNAME` file and
the repository's GitHub Pages settings.

## Credits & License

Built with [al-folio](https://github.com/alshedivat/al-folio) by Maruan Al-Shedivat and contributors,
released under the [MIT License](LICENSE). Site content © Yichao Cai.

## Academic design and navigation

The presentation adapts [Leonid Keselman's Jekyll template](https://github.com/leonidk/leonidk.github.io), based on [Jon Barron's website](https://jonbarron.info/), while retaining the Jekyll/al-folio build and bibliography. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

- Biography and research: `_pages/about.md` and `_pages/about_zh.md`; the `research-section` marker separates the introductory portrait layout from the research section.
- Teaching and service: `_includes/home/`; former standalone addresses redirect to the homepage anchors.
- Shared navigation/footer: `_includes/header.liquid` and `_includes/footer.liquid`. The reading-list link intentionally displays only a diamond, with an accessible label.
- Shared visual rules: `assets/css/academic.css`; agenda refinements: `minimal-agenda/assets/academic-agenda.css`.
- Original HTML essays and readings retain their URLs under `assets/essays/` and now use Jekyll includes for the shared site frame. `blog-theme.css` controls article typography; `blog-shell.js` adds the compact contents disclosure without replacing content.
