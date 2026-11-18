#!/usr/bin/env python3
"""Put a JSON file into this skill's page template.

    python3 build.py input.json output.html

Copies assets/template.html, replaces the JSON inside its data element with
the contents of the file you name, and writes the page. The page is one file
with no dependencies: it opens in any browser and can be sent as it is.

Exit code 0 when the page was written, 2 when a file could not be read or the
template has no data element. Standard library only. Reads two files, writes
one, makes no network calls.
"""

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(os.path.dirname(HERE), "assets", "template.html")
SLOT = re.compile(r'(<script id="[a-z-]+-data" type="application/json">)(.*?)(</script>)', re.S)


def main(argv):
    if len(argv) != 3 or argv[1].startswith("-"):
        print(__doc__.strip(), file=sys.stderr)
        return 2
    source, target = argv[1], argv[2]
    try:
        with open(source, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        print(f"build.py: cannot read {source}: {exc}", file=sys.stderr)
        return 2
    try:
        with open(TEMPLATE, encoding="utf-8") as fh:
            template = fh.read()
    except OSError as exc:
        print(f"build.py: cannot read the template at {TEMPLATE}: {exc}", file=sys.stderr)
        return 2
    if not SLOT.search(template):
        print("build.py: the template has no data element to fill", file=sys.stderr)
        return 2

    # "</" inside a string would end the script element early, so it is written as "<\/".
    body = json.dumps(data, ensure_ascii=False, indent=1).replace("</", "<\\/")
    page = SLOT.sub(lambda m: m.group(1) + "\n" + body + "\n" + m.group(3), template, count=1)
    with open(target, "w", encoding="utf-8") as fh:
        fh.write(page)
    print(f"build.py: wrote {target} ({len(page.encode('utf-8')) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
