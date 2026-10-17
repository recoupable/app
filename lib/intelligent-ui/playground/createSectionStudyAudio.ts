/** Original, deterministic instrumental fixture. No recordings or external samples. */
export function createSectionStudyAudio(): Uint8Array<ArrayBuffer> {
  const sampleRate = 22050;
  const samples = sampleRate * 48;
  const bytes = new Uint8Array(44 + samples * 2);
  const view = new DataView(bytes.buffer);
  const header = "RIFF____WAVEfmt ";
  for (let index = 0; index < header.length; index++)
    bytes[index] = header.charCodeAt(index);
  view.setUint32(4, bytes.length - 8, true);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  for (let index = 0; index < 4; index++)
    bytes[36 + index] = "data".charCodeAt(index);
  view.setUint32(40, samples * 2, true);
  const chords = [
    [48, 55, 60, 63],
    [44, 51, 56, 60],
    [51, 58, 63, 67],
    [46, 53, 58, 62],
  ];
  const motif = [60, 63, 67, 63, 58, 60, 63, 67];
  const frequencies = Array.from(
    { length: 100 },
    (_, midi) => 440 * 2 ** ((midi - 69) / 12),
  );
  let noiseState = 93817;
  for (let index = 0; index < samples; index++) {
    const time = index / sampleRate;
    const beat = Math.floor(time * 2);
    const beatTime = time % 0.5;
    const chordTime = time % 2;
    const chord = chords[Math.floor(time / 2) % chords.length];
    const chorus = time >= 28 && time < 40;
    const lift = time >= 20 && time < 28;
    const groove = time >= 8 && time < 40;
    const padEnvelope = Math.min(1, chordTime / 0.08, (2 - chordTime) / 0.18);
    let signal = 0;
    for (const note of chord)
      signal +=
        0.035 * Math.sin(2 * Math.PI * frequencies[note] * time) * padEnvelope;
    const note = motif[beat % motif.length] + (chorus ? 12 : lift ? 7 : 0);
    const phase = 2 * Math.PI * frequencies[note] * beatTime;
    const pluck = Math.min(1, beatTime / 0.008) * Math.exp(-beatTime * 7);
    signal +=
      (0.14 + (chorus ? 0.035 : 0)) *
      pluck *
      (Math.sin(phase) +
        0.22 * Math.sin(phase * 2) +
        0.07 * Math.sin(phase * 3));
    if (groove) {
      signal +=
        0.095 *
        Math.sin(2 * Math.PI * frequencies[chord[0] - 12] * beatTime) *
        Math.min(1, beatTime / 0.015) *
        Math.exp(-beatTime * 4);
      noiseState = (Math.imul(noiseState, 1664525) + 1013904223) | 0;
      const noise = noiseState / 2147483648;
      const drumGain = chorus ? 1 : 0.55;
      if (beat % 2 === 0)
        signal +=
          drumGain *
          0.19 *
          Math.sin(
            2 *
              Math.PI *
              (42 * beatTime + 2.2 * (1 - Math.exp(-beatTime / 0.02))),
          ) *
          Math.exp(-beatTime * 18);
      else signal += drumGain * 0.075 * noise * Math.exp(-beatTime * 28);
      if (lift || chorus)
        signal += 0.027 * noise * Math.exp(-(time % 0.25) * 65);
    }
    const fade = Math.min(1, time / 0.1, (48 - time) / 3);
    view.setInt16(
      44 + index * 2,
      Math.round(Math.tanh(signal * 1.8) * fade * 25000),
      true,
    );
  }
  return bytes;
}
