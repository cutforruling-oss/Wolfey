import subprocess
import os
import shutil

print("Generating full Wolfey live background video...")

# Ensure target directories exist
os.makedirs('public/assets/background', exist_ok=True)

# Copy wallpaper 2 and 3 into public/assets/background/ so no assets point to fragrant/
if os.path.exists('public/assets/fragrant/wallpaper_2.mp4'):
    shutil.copy('public/assets/fragrant/wallpaper_2.mp4', 'public/assets/background/wallpaper_2.mp4')
if os.path.exists('public/assets/fragrant/wallpaper_3.mp4'):
    shutil.copy('public/assets/fragrant/wallpaper_3.mp4', 'public/assets/background/wallpaper_3.mp4')

# Generate the primary Wolfey Live video from wallpaper_2.mp4
# With custom high-contrast typography, cyber-lens vignette, and clean AAC audio
output_vid = 'public/assets/background/background.mp4'

cmd = [
    'ffmpeg', '-y',
    '-i', 'public/assets/background/wallpaper_2.mp4',
    '-i', 'public/assets/audio/music.mp3',
    '-filter_complex',
    "[0:v]vignette=PI/4.5,"
    "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='✦  W O L F E Y  ✦':fontcolor=white:fontsize=52:x=(w-text_w)/2:y=95:shadowcolor=0x00F0FF@0.9:shadowx=2:shadowy=2,"
    "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='GAME DESIGNER  •  CODER  •  3D ARTIST  •  ANIMATOR':fontcolor=0x00F0FF:fontsize=15:x=(w-text_w)/2:y=155:shadowcolor=0xA855F7@0.8:shadowx=1:shadowy=1,"
    "drawtext=fontfile=/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf:text='『 孤高の狼  //  WOLFEY CREATIVE LAB 』':fontcolor=0xD8B4FE:fontsize=13:x=(w-text_w)/2:y=178:shadowcolor=black@0.9:shadowx=1:shadowy=1[v]",
    '-map', '[v]',
    '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    output_vid
]

res = subprocess.run(cmd, capture_output=True)
if res.returncode == 0:
    print(f"✓ Successfully generated {output_vid} ({os.path.getsize(output_vid)} bytes)")
else:
    print("FFmpeg error:", res.stderr.decode()[-400:])
