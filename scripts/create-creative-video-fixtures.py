#!/usr/bin/env python3
"""Original silent geometric studies. Local stdlib + installed FFmpeg; no inputs/network.
Usage: python3 scripts/create-creative-video-fixtures.py NEW_OUTPUT_DIRECTORY
Pinned encoding provenance: FFmpeg 8.0.1/libx264, one thread, 320x180, 12fps, 36frames.
Different encoder builds may produce different bytes; never relabel changed hashes.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

WIDTH, HEIGHT, FRAMES = 320, 180, 36
output = Path(sys.argv[1])
output.mkdir(parents=True, exist_ok=True)
results = []
for name in ("horizontal-square", "vertical-circle"):
    destination = output / f"{name}.mp4"
    if destination.exists():
        raise SystemExit(f"Refusing to replace {destination}")
    raw = bytearray()
    for frame in range(FRAMES):
        pixels = bytearray([255, 255, 255]) * (WIDTH * HEIGHT)
        center_x = 40 + (240 * frame // 35) if name == "horizontal-square" else 160
        center_y = 90 if name == "horizontal-square" else 36 + (108 * frame // 35)
        for y in range(HEIGHT):
            for x in range(WIDTH):
                inside = (abs(x-center_x) < 16 and abs(y-center_y) < 16) if name == "horizontal-square" else (x-center_x)**2 + (y-center_y)**2 <= 16**2
                if inside:
                    offset = (y * WIDTH + x) * 3
                    pixels[offset:offset+3] = bytes((0, 126, 189) if name == "horizontal-square" else (19, 43, 38))
        raw.extend(pixels)
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", "320x180", "-framerate", "12", "-i", "pipe:0", "-frames:v", "36", "-an", "-c:v", "libx264", "-threads", "1", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", "-profile:v", "baseline", "-level:v", "3.0", "-g", "12", "-x264-params", "threads=1:lookahead_threads=1:scenecut=0", "-flags:v", "+bitexact", "-fflags", "+bitexact", "-map_metadata", "-1", "-movflags", "+faststart", "-n", str(destination)]
    subprocess.run(command, input=raw, check=True, timeout=30)
    data = destination.read_bytes()
    if len(data) > 65536:
        raise SystemExit("Fixture exceeds 64KiB bound")
    results.append({"file": destination.name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "rawRgbSha256": hashlib.sha256(raw).hexdigest(), "frames": FRAMES, "fps": 12, "seconds": 3, "command": command})
print(json.dumps({"ffmpeg": subprocess.check_output(["ffmpeg", "-version"], text=True).splitlines()[0], "clips": results}, indent=2))
