"""Turn data.json into the dashboard page.

    python3 render.py --data data.json --out dashboard.html

The page is self-contained: the payload is embedded, so it keeps working
after the container that built it is gone.
"""

import argparse
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def render(data: dict) -> str:
    tpl = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
    # </script> inside JSON would close the tag early; the rest is safe in a
    # JSON script block.
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    return tpl.replace("__DATA__", blob)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="data.json")
    ap.add_argument("--out", default="dashboard.html")
    args = ap.parse_args()
    html = render(json.load(open(args.data, encoding="utf-8")))
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {args.out}  ({len(html)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
