import { getCtx } from "./AudioEngine";

/**
 * Blob / ArrayBuffer を AudioBuffer にデコードする。
 * decodeAudioData は AudioContext のサンプルレートへ自動リサンプルする。
 */
export async function decodeBlob(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return decodeArrayBuffer(arrayBuffer);
}

export async function decodeArrayBuffer(
  arrayBuffer: ArrayBuffer,
): Promise<AudioBuffer> {
  const ctx = getCtx();
  // decodeAudioData は引数の ArrayBuffer を detach することがあるためコピーを渡す
  return ctx.decodeAudioData(arrayBuffer.slice(0));
}
