"""Check the generated site's routes, assets, anchors, and shared publication items.

Run after a Jekyll build. --external also checks unique outbound HTTP links.
Reports live under _design/theme-validation, outside the published site.
"""
import argparse
import concurrent.futures
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
OUT = ROOT / "_design" / "theme-validation"


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.ids = set()
        self.publication_keys = set()
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if attrs.get("data-publication-keys"):
            self.publication_keys.update(attrs["data-publication-keys"].split("|"))
        if tag in ("a", "link") and attrs.get("href"):
            self.links.append((tag, attrs["href"]))
        if tag in ("img", "script", "iframe", "source") and attrs.get("src"):
            self.links.append((tag, attrs["src"]))


def external_status(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; WebsiteLinkCheck/1.0)"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return {"url": url, "status": response.status, "final_url": response.url}
    except urllib.error.HTTPError as error:
        return {"url": url, "status": error.code}
    except Exception as error:
        return {"url": url, "error": str(error)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--external", action="store_true")
    args = parser.parse_args()
    pages = {path: Page(path.read_text(encoding="utf-8")) for path in SITE.rglob("*.html")}
    broken = []
    external = set()
    checked = 0
    for path, page in pages.items():
        relative = "/" + path.relative_to(SITE).as_posix()
        for tag, href in page.links:
            if href.startswith(("data:", "mailto:", "tel:", "javascript:")):
                continue
            url = urllib.parse.urlsplit(urllib.parse.urljoin("https://yichaocai.com" + relative, href))
            if url.scheme not in ("http", "https"):
                continue
            # Project sites are separate repositories served under the same domain.
            project = re.match(r"/(?:nce_geo|misalignment|clap_paper)\.github\.io(?:/|$)", url.path)
            if url.netloc not in ("yichaocai.com", "www.yichaocai.com") or project:
                if tag == "a":
                    external.add(urllib.parse.urlunsplit(url._replace(fragment="")))
                continue
            target = SITE / urllib.parse.unquote(url.path).lstrip("/")
            if target.is_dir():
                target /= "index.html"
            checked += 1
            if not target.is_file():
                broken.append({"page": relative, "url": href, "reason": "missing file"})
            elif url.fragment and target in pages:
                target_page = pages[target]
                anchor = urllib.parse.unquote(url.fragment)
                if anchor not in target_page.ids and anchor not in target_page.publication_keys:
                    broken.append({"page": relative, "url": href, "reason": "missing anchor"})
    # Agenda links are hydrated from Markdown at runtime.
    for path in (ROOT / "minimal-agenda" / "content").rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        external.update(re.findall(r"https?://[^\s)\]>\"}]+", text))
    home = (SITE / "index.html").read_text(encoding="utf-8")
    catalogue = (SITE / "publications" / "index.html").read_text(encoding="utf-8")
    pattern = r'<article id="([^"]+)" class="publication-entry"[\s\S]*?</article>'
    home_cards = {match.group(1): match.group(0) for match in re.finditer(pattern, home)}
    all_cards = {match.group(1): match.group(0) for match in re.finditer(pattern, catalogue)}
    bibliography = (ROOT / "_bibliography" / "papers.bib").read_text(encoding="utf-8")
    records = dict(re.findall(r"@\w+\{([^,\s]+),([\s\S]*?)(?=\n@|\Z)", bibliography))
    selected_keys = {key for key, body in records.items() if re.search(r"selected\s*=\s*\{true\}", body)}
    checks = {
        "selected_cards_match_bibliography": set(home_cards) == selected_keys,
        "all_cards_match_bibliography": set(all_cards) == set(records),
        "identical_shared_cards": all(all_cards.get(key) == card for key, card in home_cards.items()),
        "spotlight_bold_both_pages": all('class="publication-highlight">Spotlight</strong>' in html for html in (home, catalogue)),
        "reading_diamond_both_pages": all('aria-label="Reading list">&#9670;</a>' in html or 'aria-label="Reading list">◆</a>' in html for html in (home, catalogue)),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    report = {"html_pages": len(pages), "internal_links_checked": checked, "broken_internal_links": broken, "checks": checks, "external_urls": sorted(external)}
    if args.external:
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
            report["external_results"] = list(pool.map(external_status, sorted(external)))
    (OUT / "link-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key not in ("external_urls", "external_results")}, ensure_ascii=False, indent=2))
    if args.external:
        print("External URLs:", len(external))
        print(json.dumps([item for item in report["external_results"] if item.get("status", 0) >= 400 or "error" in item], indent=2))
    return 1 if broken or not all(checks.values()) else 0


if __name__ == "__main__":
    raise SystemExit(main())
