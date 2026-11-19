from pathlib import Path

path = Path("android/app/build.gradle")
source = path.read_text()
marker = "signingConfigs {"
start = source.index(marker)
depth = 0
end = None
for position in range(start, len(source)):
    char = source[position]
    if char == "{":
        depth += 1
    elif char == "}":
        depth -= 1
        if depth == 0:
            end = position
            break
if end is None:
    raise SystemExit("signingConfigs block not found")

release_config = '''
        release {
            storeFile file(project.findProperty("VAIRA_RELEASE_STORE_FILE"))
            storePassword project.findProperty("VAIRA_RELEASE_STORE_PASSWORD")
            keyAlias project.findProperty("VAIRA_RELEASE_KEY_ALIAS")
            keyPassword project.findProperty("VAIRA_RELEASE_KEY_PASSWORD")
        }
'''
source = source[:end] + release_config + source[end:]
old = "release {\n            signingConfig signingConfigs.debug"
if old not in source:
    raise SystemExit("release build type signing config not found")
source = source.replace(old, "release {\n            signingConfig signingConfigs.release", 1)
path.write_text(source)
print("ANDROID_RELEASE_SIGNING_CONFIGURED")
