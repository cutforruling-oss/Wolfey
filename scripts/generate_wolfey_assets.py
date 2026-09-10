import math
import os
import random
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('public/assets/images', exist_ok=True)
os.makedirs('public/assets/background', exist_ok=True)

# ----------------------------------------------------
# 1. GENERATE WOLFEY ANIMATED BANNER GIF (716 x 253)
# ----------------------------------------------------
print("Generating Wolfey Animated Banner GIF...")

W, H = 716, 253
NUM_FRAMES = 36
FPS = 20

font_large = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 44)
font_sub = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 11)
font_mono = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 10)
try:
    font_jp = ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf', 13)
except:
    font_jp = font_sub

# Pre-generate particles for deterministic seamless looping
random.seed(42)
particles = []
for _ in range(45):
    particles.append({
        'x': random.uniform(20, W - 20),
        'base_y': random.uniform(0, H),
        'speed': random.uniform(1.2, 3.0),
        'size': random.uniform(1.5, 3.5),
        'color': random.choice([(0, 240, 255), (168, 85, 247), (236, 72, 153), (255, 255, 255)])
    })

frames = []

for f in range(NUM_FRAMES):
    t = f / NUM_FRAMES  # 0.0 to 1.0
    pulse = (math.sin(t * 2 * math.pi) + 1) / 2  # 0 to 1

    # Base background: deep cyberpunk dark gradient
    im = Image.new('RGB', (W, H), (10, 11, 20))
    draw = ImageDraw.Draw(im)

    # 1. Background radial glow
    for r in range(160, 0, -10):
        alpha_val = int(22 * (1 - r / 160) * (0.8 + 0.4 * pulse))
        glow_color = (int(30 + 40 * pulse), int(15 + 20 * (1 - pulse)), int(70 + 60 * pulse))
        draw.ellipse([W//2 - r*2, H//2 - r - 20, W//2 + r*2, H//2 + r - 20], outline=glow_color)

    # 2. Animated Perspective Grid at the bottom
    horizon_y = 175
    grid_offset = (t * 24) % 24
    
    # Horizontal lines
    for i in range(7):
        prog = (i + (t % 1)) / 7.0
        y_pos = horizon_y + int((prog ** 1.8) * (H - horizon_y))
        if y_pos < H:
            intensity = int(35 + 45 * prog)
            draw.line([(0, y_pos), (W, y_pos)], fill=(intensity, intensity // 2, intensity + 30), width=1)

    # Perspective vertical vanishing lines
    vp_x = W // 2
    for x_step in range(-12, 13):
        bot_x = vp_x + x_step * 55
        draw.line([(vp_x, horizon_y), (bot_x, H)], fill=(25, 20, 48), width=1)

    # 3. Floating starlight particles
    for p in particles:
        py = (p['base_y'] - t * p['speed'] * 50) % H
        px = (p['x'] + math.sin((t + p['speed']) * 2 * math.pi) * 8) % W
        p_alpha = math.sin((py / H) * math.pi)
        if p_alpha > 0.1:
            c = tuple(int(ch * p_alpha) for ch in p['color'])
            draw.ellipse([px - p['size'], py - p['size'], px + p['size'], py + p['size']], fill=c)

    # 4. Animated Equalizer Waveform along bottom
    num_bars = 48
    bar_w = 6
    bar_spacing = 11
    start_x = (W - (num_bars * bar_spacing)) // 2
    for b in range(num_bars):
        bx = start_x + b * bar_spacing
        freq = (b / num_bars) * 4 * math.pi
        bh = int(8 + 24 * abs(math.sin(freq + t * 4 * math.pi)) * (0.6 + 0.4 * math.sin(b * 0.7 + t * 2 * math.pi)))
        by1 = H - 8 - bh
        by2 = H - 8
        bar_col = (
            int(30 + 190 * (b / num_bars)),
            int(220 - 100 * (b / num_bars)),
            255
        )
        draw.rectangle([bx, by1, bx + bar_w, by2], fill=bar_col)
        # Top peak dot
        draw.rectangle([bx, by1 - 3, bx + bar_w, by1 - 1], fill=(255, 255, 255))

    # 5. Corner HUD brackets and Tech Telemetry
    hud_c = (0, 220, 255, 200)
    # Top Left
    draw.line([(16, 16), (42, 16)], fill=(0, 220, 255), width=2)
    draw.line([(16, 16), (16, 42)], fill=(0, 220, 255), width=2)
    # Top Right
    draw.line([(W - 42, 16), (W - 16, 16)], fill=(0, 220, 255), width=2)
    draw.line([(W - 16, 16), (W - 16, 42)], fill=(0, 220, 255), width=2)
    # Bottom Left
    draw.line([(16, H - 42), (16, H - 16)], fill=(168, 85, 247), width=2)
    draw.line([(16, H - 16), (42, H - 16)], fill=(168, 85, 247), width=2)
    # Bottom Right
    draw.line([(W - 16, H - 42), (W - 16, H - 16)], fill=(168, 85, 247), width=2)
    draw.line([(W - 42, H - 16), (W - 16, H - 16)], fill=(168, 85, 247), width=2)

    # Telemetry text
    draw.text((24, 22), "SYS.SYS // WOLFEY CORE", font=font_mono, fill=(0, 200, 240))
    draw.text((24, 35), f"STATUS: ONLINE • 144FPS • SYNCHRONIZED", font=font_mono, fill=(130, 140, 170))
    draw.text((W - 175, 22), "EST. 2026 • CREATIVE LAB", font=font_mono, fill=(168, 85, 247))
    draw.text((W - 145, 35), "ROLE: MASTER DESIGNER", font=font_mono, fill=(130, 140, 170))

    # 6. Geometric Cyber-Wolf Crest
    crest_x = W // 2
    crest_y = 62
    crest_r = 24 + int(2 * pulse)
    # Outer diamond
    draw.polygon([
        (crest_x, crest_y - crest_r),
        (crest_x + crest_r, crest_y),
        (crest_x, crest_y + crest_r),
        (crest_x - crest_r, crest_y)
    ], outline=(0, 240, 255), width=2)
    # Inner wolf ears silhouette
    draw.polygon([
        (crest_x - 14, crest_y + 10),
        (crest_x - 10, crest_y - 12),
        (crest_x - 3, crest_y + 2),
        (crest_x + 3, crest_y + 2),
        (crest_x + 10, crest_y - 12),
        (crest_x + 14, crest_y + 10),
        (crest_x, crest_y + 16)
    ], fill=(168, 85, 247), outline=(255, 255, 255))
    # Glowing eyes
    draw.ellipse([crest_x - 6, crest_y - 1, crest_x - 3, crest_y + 2], fill=(0, 255, 255))
    draw.ellipse([crest_x + 3, crest_y - 1, crest_x + 6, crest_y + 2], fill=(0, 255, 255))

    # 7. Main Title: "W O L F E Y" with Glitch & Neon Glow
    title_text = "W O L F E Y"
    bbox = draw.textbbox((0, 0), title_text, font=font_large)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (W - tw) // 2
    ty = 92

    # Subtle glitch displacement on frames 8, 9, 24, 25
    glitch_dx = 0
    glitch_dy = 0
    if f in [8, 9, 24, 25]:
        glitch_dx = random.choice([-4, 4, -6, 6])
        glitch_dy = random.choice([-1, 1])

    # Glow layers (Neon Cyan & Magenta)
    glow_offsets = [(-2, 0), (2, 0), (0, -2), (0, 2), (-1, -1), (1, 1), (-1, 1), (1, -1)]
    for ox, oy in glow_offsets:
        draw.text((tx + ox + glitch_dx, ty + oy + glitch_dy), title_text, font=font_large, fill=(0, 160, 240))
        draw.text((tx + ox * 2 + glitch_dx, ty + oy * 2 + glitch_dy), title_text, font=font_large, fill=(120, 40, 200))

    # Chromatic aberration split if glitching
    if glitch_dx != 0:
        draw.text((tx + glitch_dx * 2, ty), title_text, font=font_large, fill=(255, 0, 128))
        draw.text((tx - glitch_dx * 2, ty), title_text, font=font_large, fill=(0, 255, 255))

    # Main text (Crisp Diamond White)
    draw.text((tx + glitch_dx, ty + glitch_dy), title_text, font=font_large, fill=(255, 255, 255))

    # 8. Subtitle with clean dot separators
    sub_text = "✦  GAME DESIGNER  •  CODER  •  3D ARTIST  •  ANIMATOR  ✦"
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    st_w = s_bbox[2] - s_bbox[0]
    st_x = (W - st_w) // 2
    st_y = 150
    # Glow for subtext
    draw.text((st_x, st_y), sub_text, font=font_sub, fill=(180, 210, 255))

    # Japanese accent pill in bottom center / top
    jp_badge = "『 孤高の狼 • WOLFEY CREATIVE 』"
    jp_bbox = draw.textbbox((0, 0), jp_badge, font=font_jp)
    jp_w = jp_bbox[2] - jp_bbox[0]
    jp_x = (W - jp_w) // 2
    jp_y = 172
    draw.text((jp_x, jp_y), jp_badge, font=font_jp, fill=(160, 140, 220))

    # 9. Animated Scanline passing through
    scanline_y = int((t * 2 * H) % H)
    draw.line([(0, scanline_y), (W, scanline_y)], fill=(0, 255, 255), width=1)
    if scanline_y + 1 < H:
        draw.line([(0, scanline_y + 1), (W, scanline_y + 1)], fill=(0, 120, 180), width=1)

    frames.append(im)

# Save the GIF with seamless loop
gif_path = 'public/assets/images/banner.gif'
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=int(1000 / FPS),
    loop=0,
    optimize=True
)
print(f"✓ Wolfey banner GIF generated successfully: {gif_path} ({os.path.getsize(gif_path)} bytes)")
