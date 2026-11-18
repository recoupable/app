# Continuation v1 synthetic qualification

projection-step.json is the exact API1287 dfb906dd26f75cf0b3eb33232dee3c55c8aae610 owner's synthetic per-step projection fixture (SHA256 5f7e82291c09f0348c77dc34d1246a4f7fbb8d29bfb7fc57a6e9057b88550862). It includes canonical observations, original payloads and synthetic proof material. It is not live history or admission evidence.

Tests wrap this unchanged step output with the agreed proposed continuation start envelope. That envelope is initially synthetic; it does not claim the old API head emits the new marker. The new API producer fixture and exact paired-source qualification remain required before acceptance. No parts, fallback indexes or provenance fields are filtered from the equality oracle.
