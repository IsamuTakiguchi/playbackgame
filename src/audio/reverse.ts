/**
 * 逆再生の中核ロジック。
 *
 * AudioBuffer の各チャンネルのサンプル列を逆順にコピーするだけで「逆再生」になる。
 * FFT などは不要。2 回適用すれば（サンプル単位で）元に戻る。
 *
 * このゲームの肝なので、純粋関数として切り出して単体テスト可能にしている。
 */
export function reverseAudioBuffer(
  input: AudioBuffer,
  ctx: BaseAudioContext,
): AudioBuffer {
  const out = ctx.createBuffer(
    input.numberOfChannels,
    input.length,
    input.sampleRate,
  );
  for (let ch = 0; ch < input.numberOfChannels; ch++) {
    const src = input.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0, j = src.length - 1; i < src.length; i++, j--) {
      dst[i] = src[j];
    }
  }
  return out;
}

/**
 * テスト・環境非依存用。生のチャンネル配列だけを逆順にする。
 * 本物の AudioContext が無い場面（Vitest の node 環境）でも検証できる。
 */
export function reverseChannel(src: Float32Array): Float32Array {
  const dst = new Float32Array(src.length);
  for (let i = 0, j = src.length - 1; i < src.length; i++, j--) {
    dst[i] = src[j];
  }
  return dst;
}
