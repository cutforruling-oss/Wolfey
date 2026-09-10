import re
import json

with open("fragrant_raw.html", "r", encoding="utf-8") as f:
    text = f.read()

# Look for json or next_data or push chunks
pushes = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', text, re.DOTALL)
print(f"Found {len(pushes)} next_f chunks")

# Search for media URLs (mp3, mp4, webm, png, jpg, webp)
media = set(re.findall(r'https?://[^\s"\'\\]+?\.(?:mp3|mp4|webm|png|jpg|jpeg|webp|gif|svg)', text, re.I))
print("Media URLs found:")
for m in sorted(media):
    print("  ", m)

# Search for URLs on assets.frozi.lol or cdn
all_urls = set(re.findall(r'https?://[^\s"\'\\]+', text))
frozi_assets = [u for u in all_urls if 'frozi' in u or 'cdn' in u or 'discord' in u or 'stream' in u or 'spotify' in u or 'soundcloud' in u]
print("\nFrozi/CDN assets found:")
for u in sorted(frozi_assets):
    print("  ", u)

# Let's search for JSON data in the chunks
# Unescape the chunks
unescaped = text.replace('\\"', '"').replace('\\n', '\n').replace('\\/', '/')
with open("unescaped.txt", "w", encoding="utf-8") as f:
    f.write(unescaped)

matches = re.findall(r'\{[^{}]*"username"[^{}]*\}', unescaped)
print(f"\nUsername matches: {len(matches)}")
for m in matches[:10]:
    print(" ", m[:150])
