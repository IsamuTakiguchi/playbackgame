/**
 * 前後の無音をトリミングする。
 *
 * 逆再生ゲームでは前後の無音が体験を大きく損なう（出題者が無音を聞かされ、
 * タイミングがずれる）ので、素材・マネ音声の両方に適用する。
 *
 * 純粋関数として書き、AudioContext に依存しないようチャンネル配列レベルで
 * 境界を計算する関数を分離している。
 */

const DEFAULT_THRESHOLD_DB = -45; // これより小さい音は無音とみなす
const DEFAULT_PADDING_SEC = 0.05; // 前後 50ms の余白を残す
const WINDOW_SEC = 0.02; // 20ms 窓の RMS で判定

function dbToAmplitude(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * モノラル相当（複数チャンネルは各サンプルの絶対値の最大）で、
 * 有音区間の [start, end) サンプルインデックスを求める。
 * 全部無音なら null を返す。
 */
export function findVoiceBounds(
  channels: Float32Array[],
  sampleRate: number,
  thresholdDb: number = DEFAULT_THRESHOLD_DB,
): { start: number; end: number } | null {
  const length = channels[0]?.length ?? 0;
  if (length === 0) return null;

  const threshold = dbToAmplitude(thresholdDb);
  const windowSize = Math.max(1, Math.floor(WINDOW_SEC * sampleRate));

  // 各サンプルの「チャンネル横断の絶対値最大」を求めてエンベロープにする
  const env = new Float32Array(length);
  for (const ch of channels) {
    for (let i = 0; i < length; i++) {
      const a = Math.abs(ch[i]);
      if (a > env[i]) env[i] = a;
    }
  }

  const isLoud = (center: number): boolean => {
    const from = Math.max(0, center - (windowSize >> 1));
    const to = Math.min(length, from + windowSize);
    let sum = 0;
    for (let i = from; i < to; i++) sum += env[i] * env[i];
    const rms = Math.sqrt(sum / (to - from));
    return rms >= threshold;
  };

  let start = -1;
  for (let i = 0; i < length; i++) {
    if (isLoud(i)) {
      start = i;
      break;
    }
  }
  if (start === -1) return null; // 全部無音

  let end = length;
  for (let i = length - 1; i >= 0; i--) {
    if (isLoud(i)) {
      end = i + 1;
      break;
    }
  }

  return { start, end };
}

/**
 * AudioBuffer 版。無音しか無い場合は元の buffer をそのまま返す。
 */
export function trimSilence(
  input: AudioBuffer,
  ctx: BaseAudioContext,
  thresholdDb: number = DEFAULT_THRESHOLD_DB,
  paddingSec: number = DEFAULT_PADDING_SEC,
): AudioBuffer {
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < input.numberOfChannels; ch++) {
    channels.push(input.getChannelData(ch));
  }

  const bounds = findVoiceBounds(channels, input.sampleRate, thresholdDb);
  if (!bounds) return input;

  const pad = Math.floor(paddingSec * input.sampleRate);
  const start = Math.max(0, bounds.start - pad);
  const end = Math.min(input.length, bounds.end + pad);
  const newLength = end - start;
  if (newLength <= 0 || newLength === input.length) return input;

  const out = ctx.createBuffer(
    input.numberOfChannels,
    newLength,
    input.sampleRate,
  );
  for (let ch = 0; ch < input.numberOfChannels; ch++) {
    const src = input.getChannelData(ch);
    out.getChannelData(ch).set(src.subarray(start, end));
  }
  return out;
}
