import re
import json

with open("unescaped.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find JSON objects or arrays inside the next_f stream
# Find all occurrences of "user": or "profile": or "config": or "socials": or "data":
sections = re.findall(r'(\{[^{}]{100,}\})', content)
print(f"Total curly sections > 100 chars: {len(sections)}")

# Search for "fragrant" in context
fragrant_pos = [m.start() for m in re.finditer(r'fragrant', content, re.I)]
print(f"Occurrences of fragrant: {len(fragrant_pos)}")
for i, pos in enumerate(fragrant_pos):
    start = max(0, pos - 200)
    end = min(len(content), pos + 400)
    print(f"\n--- MATCH {i+1} ---")
    print(content[start:end])
