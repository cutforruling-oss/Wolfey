import urllib.request, os, json

with open("fragrant_pages.json") as f:
    pages = json.load(f)

gallery = pages.get("galleryPosts", [])
os.makedirs("public/assets/fragrant/gallery", exist_ok=True)

for i, item in enumerate(gallery):
    url = item["mediaUrl"]
    ext = url.split(".")[-1].split("?")[0]
    filename = f"gallery_{i+1}_{item['id'][:8]}.{ext}"
    filepath = os.path.join("public/assets/fragrant/gallery", filename)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://frozi.lol/"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp, open(filepath, "wb") as f:
            f.write(resp.read())
        print(f"Downloaded gallery #{i+1}: {filename} ({os.path.getsize(filepath)} bytes)")
    except Exception as e:
        print(f"Failed gallery #{i+1}: {e}")
