"""Fail deployment if the self-hosted PDF reader or its documents are missing."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = Path("assets/vendor/pdfjs")
REQUIRED = (
    "pdf/index.html",
    "assets/js/pdf-reader.js",
    "assets/js/pdf-viewer-config.js",
    "assets/css/pdf-viewer.css",
    "assets/vendor/pdfjs/LICENSE",
    "assets/vendor/pdfjs/web/viewer.html",
    "assets/vendor/pdfjs/web/viewer.mjs",
    "assets/vendor/pdfjs/web/viewer.css",
    "assets/vendor/pdfjs/build/pdf.mjs",
    "assets/vendor/pdfjs/build/pdf.worker.mjs",
    "assets/vendor/pdfjs/web/locale/locale.json",
    "assets/vendor/pdfjs/web/locale/en-US/viewer.ftl",
)


class ReaderReferences(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.urls = set()
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("data-viewer-url", "data-pdf-file"):
            if attrs.get(key):
                self.urls.add(attrs[key])
        if tag == "a" and attrs.get("href"):
            url = urlsplit(attrs["href"])
            if url.path.rstrip("/") == "/pdf":
                self.urls.update(parse_qs(url.query).get("file", []))


def validate(site):
    errors = []
    required = {Path(name) for name in REQUIRED}
    # Check every packaged locale, font, CMap, image, and WebAssembly dependency.
    required.update(p.relative_to(ROOT) for p in (ROOT / BUNDLE).rglob("*") if p.is_file())
    for relative in sorted(required):
        target = site / relative
        if not target.is_file() or target.stat().st_size == 0:
            errors.append(f"Missing PDF reader asset: {relative.as_posix()}")
        elif BUNDLE in relative.parents and (ROOT / relative).is_file():
            if target.read_bytes() != (ROOT / relative).read_bytes():
                errors.append(f"PDF.js asset was modified by the build: {relative.as_posix()}")

    documents = set()
    for page in site.rglob("*.html"):
        text = page.read_text(encoding="utf-8")
        if "data-pdf-reader" not in text and "/pdf/?" not in text:
            continue
        for href in ReaderReferences(text).urls:
            url = urlsplit(href)
            if url.netloc and url.netloc not in ("yichaocai.com", "www.yichaocai.com"):
                continue
            target = site / unquote(url.path).lstrip("/")
            if not target.is_file():
                errors.append(f"{page.relative_to(site)}: missing PDF reader target {href}")
            elif target.suffix.lower() == ".pdf":
                documents.add(target)
    for document in sorted(documents):
        with document.open("rb") as stream:
            if stream.read(5) != b"%PDF-":
                errors.append(f"Invalid PDF file: {document.relative_to(site)}")
    return errors, len(required), len(documents)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, default=ROOT / "_site")
    args = parser.parse_args()
    errors, assets, documents = validate(args.site.resolve())
    if errors:
        print("PDF reader validation failed:\n" + "\n".join(errors))
        return 1
    print(f"PDF reader validation passed: {assets} assets and {documents} documents.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
