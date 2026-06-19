import { describe, it, expect } from "vitest";
import { findVoiceBounds } from "./trim";

const SR = 48000;

// 指定区間だけ振幅 1.0 の音を入れたチャンネルを作る
function makeChannel(length: number, loudFrom: number, loudTo: number): Float32Array {
  const ch = new Float32Array(length);
  for (let i = loudFrom; i < loudTo; i++) ch[i] = 1.0;
  return ch;
}

describe("findVoiceBounds", () => {
  it("finds the loud region surrounded by silence", () => {
    const length = SR; // 1 秒
    const ch = makeChannel(length, 10000, 20000);
    const bounds = findVoiceBounds([ch], SR);
    expect(bounds).not.toBeNull();
    // 20ms 窓 RMS 判定のため厳密でなく、概ね有音域に収まることを確認
    expect(bounds!.start).toBeGreaterThanOrEqual(9000);
    expect(bounds!.start).toBeLessThanOrEqual(11000);
    expect(bounds!.end).toBeGreaterThanOrEqual(19000);
    expect(bounds!.end).toBeLessThanOrEqual(21000);
  });

  it("returns null for all-silence input", () => {
    const ch = new Float32Array(SR); // 全部 0
    expect(findVoiceBounds([ch], SR)).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(findVoiceBounds([new Float32Array(0)], SR)).toBeNull();
  });

  it("considers the loudest across channels", () => {
    const length = 24000;
    const left = new Float32Array(length); // 無音
    const right = makeChannel(length, 5000, 8000); // 右だけ有音
    const bounds = findVoiceBounds([left, right], SR);
    expect(bounds).not.toBeNull();
    expect(bounds!.start).toBeLessThan(8000);
    expect(bounds!.end).toBeGreaterThan(5000);
  });
});
