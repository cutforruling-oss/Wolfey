import re
import json

with open("full_stream.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Let's find "profileData":{...}
pos = text.find('"profileData":{')
if pos != -1:
    # balance braces to find end
    start = pos + len('"profileData":')
    depth = 0
    end = start
    for i in range(start, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    profile_json_str = text[start:end]
    try:
        profile_obj = json.loads(profile_json_str)
        with open("fragrant_profile.json", "w", encoding="utf-8") as f:
            json.dump(profile_obj, f, indent=2)
        print("Successfully dumped fragrant_profile.json!")
    except Exception as e:
        print("JSON parse error:", e)
        # fallback save raw
        with open("fragrant_profile.json", "w", encoding="utf-8") as f:
            f.write(profile_json_str)
        print("Saved raw string to fragrant_profile.json")

# Also let's find pagesContent if separate
pos2 = text.find('"pagesContent":{')
if pos2 != -1:
    start2 = pos2 + len('"pagesContent":')
    depth = 0
    end2 = start2
    for i in range(start2, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                end2 = i + 1
                break
    pages_str = text[start2:end2]
    try:
        pages_obj = json.loads(pages_str)
        with open("fragrant_pages.json", "w", encoding="utf-8") as f:
            json.dump(pages_obj, f, indent=2)
        print("Successfully dumped fragrant_pages.json!")
    except Exception as e:
        print("Pages JSON parse error:", e)
        with open("fragrant_pages.json", "w", encoding="utf-8") as f:
            f.write(pages_str)
