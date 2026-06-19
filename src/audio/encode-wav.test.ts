import { describe, it, expect } from "vitest";
import { encodeWav } from "./encode-wav";

// AudioBuffer のテスト用最小スタブ（node 環境には Web Audio が無い）
function fakeBuffer(channelsData: Float32Array[], sampleRate = 48000): AudioBuffer {
  const length = channelsData[0]?.length ?? 0;
  return {
    numberOfChannels: channelsData.length,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: (ch: number) => channelsData[ch],
  } as unknown as AudioBuffer;
}

async function blobToDataView(blob: Blob): Promise<DataView> {
  const ab = await blob.arrayBuffer();
  return new DataView(ab);
}

function readString(view: DataView, offset: number, len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(offset + i));
  return s;
}

describe("encodeWav", () => {
  it("writes a valid RIFF/WAVE header", async () => {
    const buf = fakeBuffer([new Float32Array([0, 0.5, -0.5, 1, -1])]);
    const blob = encodeWav(buf);
    expect(blob.type).toBe("audio/wav");
    const view = await blobToDataView(blob);
    expect(readString(view, 0, 4)).toBe("RIFF");
    expect(readString(view, 8, 4)).toBe("WAVE");
    expect(readString(view, 12, 4)).toBe("fmt ");
    expect(readString(view, 36, 4)).toBe("data");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(48000); // sample rate
    expect(view.getUint16(34, true)).toBe(16); // bits
  });

  it("computes the correct data size and sample count", async () => {
    const frames = 100;
    const buf = fakeBuffer([new Float32Array(frames)], 44100);
    const blob = encodeWav(buf);
    const view = await blobToDataView(blob);
    const dataSize = view.getUint32(40, true);
    expect(dataSize).toBe(frames * 2); // mono * 16bit
    expect(blob.size).toBe(44 + frames * 2);
  });

  it("quantizes amplitude correctly (clipping handled)", async () => {
    const buf = fakeBuffer([new Float32Array([1, -1, 0])]);
    const view = await blobToDataView(buf2blob(buf));
    expect(view.getInt16(44, true)).toBe(32767); // +1 → 32767
    expect(view.getInt16(46, true)).toBe(-32768); // -1 → -32768
    expect(view.getInt16(48, true)).toBe(0);
  });
});

function buf2blob(buf: AudioBuffer): Blob {
  return encodeWav(buf);
}
