"""產生神聖抽牌每個網址的頁面＋網站地圖。

網站只有一份 index.html，畫面靠「狀態」切換。為了讓 /draw/tarot/、/healing/ 這些網址
直接打開也找得到、Google 也收得到，每個網址放一份 index.html 的副本，只換 <head> 裡的
標題、簡介、正牌網址和身分證；打開後由 index.html 裡的「網址管理員」照網址擺好畫面。

用法（改完 index.html 後在專案資料夾跑；GitHub 上的自動小幫手也會自己跑）：
    python tools/build_routes.py

會更新：各網址資料夾的 index.html、sitemap.xml、tools/generated.txt（產生過的清單）
只會刪除 generated.txt 裡記過、這次不再需要的檔案；月光寶盒、呼吸花園等手寫的頁不會被動到。
"""

from __future__ import annotations

import datetime
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://raindeercoffee.com/sacred-tarot"
SOURCE = ROOT / "index.html"
MANIFEST = ROOT / "tools" / "generated.txt"
HOME_TITLE = "神聖抽牌 · Sacred Thoth Tarot Oracle"
# 不是 index.html 產生的、但也要放進網站地圖的頁
EXTRA_PAGES = ["/moonlight/", "/garden/"]


def load_routes(text: str) -> dict[str, dict]:
    block = re.search(r'<script type="application/json" id="route-meta">(.*?)</script>', text, re.S)
    if not block:
        raise SystemExit("index.html 裡找不到 #route-meta")
    return json.loads(block.group(1))


def replace_once(text: str, pattern: str, replacement: str) -> str:
    new, count = re.subn(pattern, lambda _: replacement, text, count=1)
    if count != 1:
        raise SystemExit(f"index.html 找不到：{pattern}")
    return new


def page_for(text: str, path: str, meta: dict) -> str:
    title, desc = meta["title"], meta["desc"]
    attr_title, attr_desc = html.escape(title, quote=True), html.escape(desc, quote=True)
    url = SITE + path
    text = replace_once(text, r"<title>[^<]*</title>", f"<title>{attr_title}</title>")
    text = replace_once(text, r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{attr_desc}">')
    text = replace_once(text, r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">')
    text = replace_once(text, r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{attr_title}">')
    text = replace_once(text, r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{attr_desc}">')
    text = replace_once(text, r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">')
    # 身分證（結構化資料）裡的這一頁資料也換成這個網址
    text = replace_once(text, re.escape(f'"@id": "{SITE}/#page"'), f'"@id": "{url}#page"')
    text = replace_once(text, re.escape(f'"name": "{HOME_TITLE}"'), f'"name": {json.dumps(title, ensure_ascii=False)}')
    text = replace_once(text, re.escape(f'"url": "{SITE}/"'), f'"url": "{url}"')
    text = re.sub(
        r'(<script type="application/ld\+json">.*?"description": )"[^"]*"',
        lambda m: m.group(1) + json.dumps(desc, ensure_ascii=False),
        text, count=1, flags=re.S,
    )
    return text


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def main() -> None:
    text = SOURCE.read_text(encoding="utf-8")
    routes = load_routes(text)

    previous = set(MANIFEST.read_text(encoding="utf-8").split()) if MANIFEST.exists() else set()
    generated = []
    for path, meta in routes.items():
        if path == "/":
            continue
        target = ROOT / path.strip("/") / "index.html"
        write(target, page_for(text, path, meta))
        generated.append(target.relative_to(ROOT).as_posix())

    for stale in sorted(previous - set(generated)):
        stale_path = ROOT / stale
        if stale_path.exists():
            stale_path.unlink()
    write(MANIFEST, "\n".join(sorted(generated)) + "\n")

    today = datetime.date.today().isoformat()
    pages = list(routes) + EXTRA_PAGES
    urls = "".join(f"  <url>\n    <loc>{SITE}{p}</loc>\n    <lastmod>{today}</lastmod>\n  </url>\n" for p in pages)
    write(ROOT / "sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')

    print(f"產生 {len(generated)} 個網址頁、sitemap.xml（共 {len(pages)} 個網址）")


if __name__ == "__main__":
    main()
