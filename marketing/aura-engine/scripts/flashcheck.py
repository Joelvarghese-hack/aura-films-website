"""Approximate WCAG 2.3.1 general-flash check (not a certified PEAT/Harding test).
A transition is a frame-to-frame change where >= 25% of the frame moves >= 0.1 in relative
luminance the same way, with the darker state below 0.8. A flash is a pair of opposing
transitions. Passes when no 1-second window holds more than 3 flashes.
Usage: python3.13 scripts/flashcheck.py video.mp4"""
import subprocess, sys
import numpy as np

W, H = 108, 192
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3) / 255.0
lin = np.where(fr <= 0.04045, fr / 12.92, ((fr + 0.055) / 1.055) ** 2.4)
L = lin @ np.array([0.2126, 0.7152, 0.0722])
events = []
for i in range(1, len(L)):
    d = L[i] - L[i - 1]
    dark = np.minimum(L[i], L[i - 1]) < 0.8
    up = ((d >= 0.1) & dark).mean()
    down = ((d <= -0.1) & dark).mean()
    if up >= 0.25: events.append((i, +1))
    elif down >= 0.25: events.append((i, -1))
flashes = [events[k][0] for k in range(1, len(events)) if events[k][1] != events[k - 1][1]]
worst = max([sum(1 for f in flashes if s <= f < s + 30) for s in range(len(L))] or [0])
print("events", events)
print(f'frames {len(L)}  transitions {len(events)}  flashes {len(flashes)}  worst 1-second window {worst}  ->', 'PASS' if worst <= 3 else 'FAIL')
