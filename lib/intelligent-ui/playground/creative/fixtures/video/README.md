# Original silent motion studies

These two three-second clips were locally authored for the development-only Video
comparison lab. They contain simple geometry on white, no downloaded samples,
customer footage, speech, music, provider generation or production-quality claim.
They are different studies, not successive edits. No speech captions are invented;
the visible, programmatically associated descriptions explain all visual motion.

Files live outside `public/`. Only the development opt-in route resolves their exact
encoded SHA-256 revisions. Metadata is in `../../videoClips.ts`; altered, missing,
oversized or unknown files fail closed. This directory is source, not an upload store.

Reproduce into a new directory (existing files are refused):

```sh
python3 scripts/create-creative-video-fixtures.py /absolute/new/output-directory
```

The bounded recipe authors 36 RGB frames with Python standard library, then uses
installed FFmpeg 8.0.1/libx264 with one thread, fixed 320 × 180 / 12 fps, baseline
H.264, yuv420p, no audio and fast-start MP4. No installation or network is needed.
Two local executions produced byte-identical outputs on the recorded encoder build.
Other encoder builds may differ: compare hashes; never relabel different bytes as
the pinned revision. This recipe is not run by the app or the test suite.

Actual FFprobe and full FFmpeg decode confirmed one video stream, no audio streams,
36 frames, 12 fps, three seconds, constrained-baseline H.264/yuv420p. All 36 decoded
RGB frames were distinct. Foreground centroids followed the authored direction;
first/middle/last decoded frame inspection matched the descriptions. This is offline
encoding/decoding evidence, not native browser playback, seeking or accessibility.

## horizontal-square.mp4

Encoded: 3991 bytes; SHA-256 `3ee0a78ed36e8abc415d911a0f17d853d4e43e7f5cc713f16edba8b0afbedfe8`.

Decoded RGB stream SHA-256: `41b9d8968aab28a4ff278504a2897b1b586783f498e36dbd6b7e638b3d7e7b56`.

## vertical-circle.mp4

Encoded: 4166 bytes; SHA-256 `e845a7c3eba91b90666a2a31bf92ab93f75f7d66a6fcc77c0dbb76a853d2a81e`.

Decoded RGB stream SHA-256: `57ce42783e41bea4d71509297bc54e4532dec7ae99209138e8c2e6ca39c5f3cd`.

The horizontal study moves a blue square from left to right. The vertical study
moves a dark-green circle downward. No flashing, camera motion or text overlay.
Browser-native playback, controls, screen-reader behavior and captions/accessibility
acceptance remain separately pending; an offline decoder cannot establish them.
