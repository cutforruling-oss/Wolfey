import re
import json

with open("fragrant_raw.html", "r", encoding="utf-8") as f:
    raw = f.read()

# Let's concatenate all push strings in order
chunks = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', raw, re.DOTALL)
full_text = ""
for c in chunks:
    # unescape standard json string
    full_text += c.encode('utf-8').decode('unicode_escape', errors='ignore')

with open("full_stream.txt", "w", encoding="utf-8") as f:
    f.write(full_text)

print(f"Wrote full_stream.txt with {len(full_text)} chars")

# Search for initialProfile or profile: {
pos = full_text.find('"username":"fragrant"')
print("Pos of username fragrant:", pos)
if pos != -1:
    # Print around pos
    print(full_text[pos-200:pos+3000])
