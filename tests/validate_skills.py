"""Validate skill metadata, code fences, local resources, and README inventory.

Run from any directory: python3 tests/validate_skills.py
This checks document structure, not agent behavior or external integrations.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
skills = sorted((ROOT / "skills").glob("*/*/SKILL.md"))
errors = []
names = set()
for skill in skills:
    text = skill.read_text()
    frontmatter = re.match(r"\A---\n(.*?)\n---\n", text, re.S)
    if not frontmatter:
        errors.append(f"{skill}: missing frontmatter")
        continue
    fields = dict(re.findall(r"^([a-z-]+): (.+)$", frontmatter[1], re.M))
    name = fields.get("name")
    if name != skill.parent.name or name in names:
        errors.append(f"{skill}: mismatched or duplicate name")
    names.add(name)
    if not fields.get("description"):
        errors.append(f"{skill}: missing description")
    if fields.get("disable-model-invocation", "false") not in {"true", "false"}:
        errors.append(f"{skill}: invalid invocation setting")
    for target in re.findall(r"\]\(([^)]+)\)", text):
        if "://" not in target and not target.startswith("#"):
            resolved = (skill.parent / target.split("#")[0]).resolve()
            if not resolved.exists() or not resolved.is_relative_to(skill.parent.resolve()):
                errors.append(f"{skill}: missing or nonportable resource {target}")

for document in [ROOT / "README.md", *ROOT.glob("skills/**/*.md"), *ROOT.glob("tests/*.md")]:
    text = document.read_text()
    if sum(line.lstrip().startswith("```") for line in text.splitlines()) % 2:
        errors.append(f"{document}: unbalanced code fences")
    for target in re.findall(r"\]\(([^)]+)\)", text):
        if "://" not in target and not target.startswith("#"):
            if not (document.parent / target.split("#")[0]).exists():
                errors.append(f"{document}: missing link {target}")

readme = (ROOT / "README.md").read_text()
for skill in skills:
    if f"[{chr(96)}{skill.parent.name}{chr(96)}]" not in readme:
        errors.append(f"README missing {skill.parent.name}")
if errors:
    raise SystemExit("\n".join(errors))
print(f"PASS: {len(skills)} skills; metadata, fences, local resources, README inventory")
