import { describe, it, expect } from "vitest";
import { reverseChannel } from "./reverse";

describe("reverseChannel", () => {
  it("reverses a known array", () => {
    const src = new Float32Array([1, 2, 3, 4]);
    const out = reverseChannel(src);
    expect(Array.from(out)).toEqual([4, 3, 2, 1]);
  });

  it("returns to original when applied twice", () => {
    const src = new Float32Array([0.1, -0.2, 0.3, -0.4, 0.5]);
    const twice = reverseChannel(reverseChannel(src));
    expect(Array.from(twice)).toEqual(Array.from(src));
  });

  it("handles empty and single-element arrays", () => {
    expect(Array.from(reverseChannel(new Float32Array([])))).toEqual([]);
    expect(Array.from(reverseChannel(new Float32Array([7])))).toEqual([7]);
  });

  it("does not mutate the input", () => {
    const src = new Float32Array([1, 2, 3]);
    reverseChannel(src);
    expect(Array.from(src)).toEqual([1, 2, 3]);
  });
});
