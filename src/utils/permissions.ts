/**
 * マイクの getUserMedia をラップし、分かりやすい日本語エラーにする。
 * echoCancellation / noiseSuppression / autoGainControl を無効化して、
 * マネ音声を歪ませない（逆再生の忠実度を保つ）。
 */
export async function getMicStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "このブラウザはマイク録音に対応していません（または HTTPS/localhost ではありません）。",
    );
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
  } catch (err) {
    const name = (err as DOMException)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") {
      throw new Error(
        "マイクの使用が許可されませんでした。ブラウザの権限設定を確認してください。",
      );
    }
    if (name === "NotFoundError") {
      throw new Error("マイクが見つかりませんでした。");
    }
    throw new Error("マイクの取得に失敗しました: " + String(err));
  }
}
