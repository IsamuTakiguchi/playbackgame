/**
 * AudioBuffer を 16bit PCM の WAV Blob にエンコードする。
 *
 * MediaRecorder の出力形式はブラウザ依存（Chrome/Firefox は WebM/Opus、
 * Safari は MP4/AAC）で、保存後の再デコードが不安定になりやすい。
 * そこで保存時に WAV へ正規化して、どのブラウザでも安定して decode できる
 * ようにする。
 */
export function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2; // 16bit
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const ab = new ArrayBuffer(bufferSize);
  const view = new DataView(ab);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // fmt subchunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true); // bits per sample

  // data subchunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // インターリーブして 16bit に量子化
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      // クリップ防止
      sample = Math.max(-1, Math.min(1, sample));
      // -1..1 → -32768..32767
      const s = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, s | 0, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: "audio/wav" });
}
