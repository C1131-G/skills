"""Check skills/INDEX.md against the filesystem.

    python scripts/check-skills.py

Verifies that every SKILL.md on disk has exactly one row in the index, that
every path in a row resolves, that each skill's frontmatter `name` matches its
directory, and that the reference files a row lists are the ones in that
skill's directory. Exits non-zero when anything is off.
"""

import glob
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "skills")
ROW = re.compile(r"^\| ([a-z0-9-]+) \| .*? \| \[[^\]]+\]\(([^)]+)\) \| (.*?) \|$", re.M)


def indexed():
    text = open(os.path.join(ROOT, "INDEX.md"), encoding="utf-8").read()
    rows = {}
    for name, path, refs in ROW.findall(text):
        rows[name] = (path, sorted(r.strip(" `") for r in refs.split(",") if r.strip() != "—"))
    return rows


def on_disk():
    return {os.path.basename(os.path.dirname(p)): p for p in glob.glob(os.path.join(ROOT, "*", "*", "SKILL.md"))}


def problems(rows, skills):
    for name in sorted(set(rows) | set(skills)):
        if name not in rows:
            yield f"{name}: on disk but missing from INDEX.md"
            continue
        if name not in skills:
            yield f"{name}: listed in INDEX.md but not on disk"
            continue

        path, refs = rows[name]
        if not os.path.exists(os.path.normpath(os.path.join(ROOT, path))):
            yield f"{name}: INDEX.md path does not resolve: {path}"

        frontmatter = open(skills[name], encoding="utf-8").read()
        declared = re.search(r"^name:\s*(\S+)", frontmatter, re.M)
        if declared is None:
            yield f"{name}: SKILL.md has no name in its frontmatter"
        elif declared.group(1) != name:
            yield f"{name}: frontmatter name is {declared.group(1)}"

        directory = os.path.dirname(skills[name])
        actual = sorted(
            os.path.basename(f)
            for f in glob.glob(os.path.join(directory, "*.md"))
            if os.path.basename(f) != "SKILL.md"
        )
        if refs != actual:
            yield f"{name}: INDEX.md lists {refs or '—'}, directory holds {actual or '—'}"


def main():
    rows, skills = indexed(), on_disk()
    found = list(problems(rows, skills))
    print("\n".join(found) if found else "INDEX.md matches the filesystem")
    print(f"{len(skills)} skills on disk, {len(rows)} rows")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main())
