from pathlib import Path
import re

path = Path("android/app/build.gradle")
source = path.read_text()


def find_block(text: str, header: str, start_at: int = 0) -> tuple[int, int]:
    """Return the opening-brace and closing-brace positions for a Gradle block."""
    header_pos = text.find(header, start_at)
    if header_pos < 0:
        raise SystemExit(f"{header} block not found")
    opening = text.find("{", header_pos)
    if opening < 0:
        raise SystemExit(f"{header} opening brace not found")

    depth = 0
    for position in range(opening, len(text)):
        char = text[position]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return opening, position
    raise SystemExit(f"{header} closing brace not found")


signing_open, signing_close = find_block(source, "signingConfigs")
signing_body = source[signing_open + 1 : signing_close]

if not re.search(r"(?m)^\s*release\s*\{", signing_body):
    release_config = """
        release {
            storeFile file(project.findProperty("VAIRA_RELEASE_STORE_FILE"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: project.findProperty("VAIRA_RELEASE_STORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: project.findProperty("VAIRA_RELEASE_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: project.findProperty("VAIRA_RELEASE_KEY_PASSWORD")
        }
"""
    source = source[:signing_close] + release_config + source[signing_close:]

# Locate buildTypes after the signingConfigs edit, then patch only its release block.
build_types_open, build_types_close = find_block(source, "buildTypes")
release_header = re.search(r"(?m)^\s*release\s*\{", source[build_types_open + 1 : build_types_close])
if not release_header:
    raise SystemExit("release build type not found")
release_start = build_types_open + 1 + release_header.start()
release_open = source.find("{", release_start)

depth = 0
release_close = None
for position in range(release_open, build_types_close + 1):
    char = source[position]
    if char == "{":
        depth += 1
    elif char == "}":
        depth -= 1
        if depth == 0:
            release_close = position
            break
if release_close is None:
    raise SystemExit("release build type closing brace not found")

release_body = source[release_open + 1 : release_close]
release_body, replacements = re.subn(
    r"signingConfig\s+signingConfigs\.debug",
    "signingConfig signingConfigs.release",
    release_body,
    count=1,
)
if replacements == 0:
    raise SystemExit("release build type signing config not found")

source = source[: release_open + 1] + release_body + source[release_close:]
path.write_text(source)
print("ANDROID_RELEASE_SIGNING_CONFIGURED")
