// Scale raw 16-bit PCM (44.1kHz mono) by GAIN and wrap in a WAV header.
// Exact volume control for the Vapi background sound — their API has no knob.
import { readFileSync, writeFileSync } from 'node:fs';

const GAIN = 0.7;
const pcm = readFileSync('office-raw.pcm');
const out = Buffer.alloc(pcm.length);
for (let i = 0; i < pcm.length - 1; i += 2) {
  out.writeInt16LE(Math.round(pcm.readInt16LE(i) * GAIN), i);
}

const rate = 44100, channels = 1, bits = 16;
const byteRate = rate * channels * (bits / 8);
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + out.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(rate, 24);
header.writeUInt32LE(byteRate, 28);
header.writeUInt16LE(channels * (bits / 8), 32);
header.writeUInt16LE(bits, 34);
header.write('data', 36);
header.writeUInt32LE(out.length, 40);

writeFileSync('office-keys-quiet.wav', Buffer.concat([header, out]));
console.log('office-keys-quiet.wav written at gain', GAIN);

