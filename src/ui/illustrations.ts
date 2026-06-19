import { svgEl } from "./dom";

/**
 * ポップ&カラフルな装飾用インラインSVG集。
 * すべて viewBox 指定でレスポンシブ。サイズは CSS クラスで制御する。
 */

// 共通パレット（CSS変数と揃える）
const CORAL = "#ff5d8f";
const TEAL = "#16c8b9";
const YELLOW = "#ffd23f";
const PURPLE = "#7c5cff";
const ORANGE = "#ff924c";
const INK = "#2b2350";

/** マイク＋サウンドウェーブ（Home / Create のヒーロー） */
export function micIllustration(): SVGElement {
  return svgEl(`
<svg class="illu illu-mic" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- サウンドウェーブ 左 -->
  <g stroke="${TEAL}" stroke-width="6" stroke-linecap="round">
    <path d="M44 80 V80"/>
    <path d="M34 66 V94"/>
    <path d="M22 54 V106"/>
  </g>
  <!-- サウンドウェーブ 右 -->
  <g stroke="${PURPLE}" stroke-width="6" stroke-linecap="round">
    <path d="M156 80 V80"/>
    <path d="M166 66 V94"/>
    <path d="M178 54 V106"/>
  </g>
  <!-- マイク本体 -->
  <rect x="80" y="20" width="40" height="74" rx="20" fill="${CORAL}"/>
  <rect x="88" y="30" width="24" height="20" rx="10" fill="#fff" opacity="0.35"/>
  <!-- アーチ -->
  <path d="M66 78 a34 34 0 0 0 68 0" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <!-- スタンド -->
  <path d="M100 112 V132" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <path d="M78 134 H122" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <!-- 音符 -->
  <circle cx="150" cy="34" r="7" fill="${YELLOW}"/>
  <rect x="155" y="14" width="4" height="22" rx="2" fill="${YELLOW}"/>
</svg>`);
}

/** 逆再生を表す左右反転の波形＋ループ矢印（PlaySetup） */
export function reverseWave(): SVGElement {
  return svgEl(`
<svg class="illu illu-wave" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- 波形 -->
  <g stroke-linecap="round" stroke-width="7">
    <path d="M30 60 V60" stroke="${CORAL}"/>
    <path d="M48 44 V76" stroke="${ORANGE}"/>
    <path d="M66 30 V90" stroke="${YELLOW}"/>
    <path d="M84 50 V70" stroke="${TEAL}"/>
    <path d="M102 36 V84" stroke="${PURPLE}"/>
    <path d="M120 48 V72" stroke="${CORAL}"/>
    <path d="M138 26 V94" stroke="${TEAL}"/>
    <path d="M156 46 V74" stroke="${ORANGE}"/>
    <path d="M174 56 V64" stroke="${PURPLE}"/>
  </g>
  <!-- ループ矢印（逆向き） -->
  <path d="M70 108 a34 14 0 1 1 60 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M70 108 l-6 -8 m6 8 l9 -3" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>`);
}

/** ヘッドホンで聞く耳（PlaySetup） */
export function earListen(): SVGElement {
  return svgEl(`
<svg class="illu illu-ear" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- ヘッドバンド -->
  <path d="M40 80 a40 50 0 0 1 80 0" stroke="${PURPLE}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <!-- 左イヤーカップ -->
  <rect x="30" y="74" width="24" height="40" rx="10" fill="${CORAL}"/>
  <!-- 右イヤーカップ -->
  <rect x="106" y="74" width="24" height="40" rx="10" fill="${TEAL}"/>
  <!-- 音符 -->
  <circle cx="78" cy="40" r="6" fill="${YELLOW}"/>
  <rect x="82" y="22" width="4" height="20" rx="2" fill="${YELLOW}"/>
</svg>`);
}

/** 口/吹き出し（Mimic） */
export function speechBubble(): SVGElement {
  return svgEl(`
<svg class="illu illu-speech" viewBox="0 0 170 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M30 22 H140 a16 16 0 0 1 16 16 V86 a16 16 0 0 1 -16 16 H78 l-22 20 v-20 H30 a16 16 0 0 1 -16 -16 V38 a16 16 0 0 1 16 -16 Z" fill="${YELLOW}"/>
  <!-- 喋っている波 -->
  <g stroke="${INK}" stroke-width="6" stroke-linecap="round">
    <path d="M48 62 H62"/>
    <path d="M74 62 H96"/>
    <path d="M108 62 H134"/>
  </g>
  <circle cx="150" cy="30" r="8" fill="${CORAL}"/>
</svg>`);
}

/** キラキラ（Reveal） */
export function sparkles(): SVGElement {
  return svgEl(`
<svg class="illu illu-sparkles" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- トロフィー -->
  <path d="M70 30 H110 V52 a20 20 0 0 1 -40 0 Z" fill="${YELLOW}"/>
  <path d="M70 36 H58 a10 10 0 0 0 12 14" stroke="${ORANGE}" stroke-width="5" fill="none"/>
  <path d="M110 36 H122 a10 10 0 0 1 -12 14" stroke="${ORANGE}" stroke-width="5" fill="none"/>
  <rect x="86" y="70" width="8" height="14" fill="${ORANGE}"/>
  <rect x="72" y="84" width="36" height="8" rx="4" fill="${INK}"/>
  <!-- キラキラ -->
  <path d="M40 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="${CORAL}"/>
  <path d="M146 54 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="${TEAL}"/>
  <circle cx="150" cy="26" r="5" fill="${PURPLE}"/>
  <circle cx="32" cy="78" r="5" fill="${YELLOW}"/>
</svg>`);
}

/** 空状態用のかわいいマイク（Bank の「お題なし」） */
export function emptyMic(): SVGElement {
  return svgEl(`
<svg class="illu illu-empty" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="70" cy="70" r="60" fill="${YELLOW}" opacity="0.25"/>
  <rect x="54" y="36" width="32" height="58" rx="16" fill="${CORAL}"/>
  <path d="M42 80 a28 28 0 0 0 56 0" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M70 108 V120" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M52 122 H88" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
</svg>`);
}

/**
 * 画面背景に散らす紙吹雪・音符レイヤー。pointer-events:none で操作を妨げない。
 * 固定配置で画面全体をカバー。
 */
export function confettiLayer(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "bg-decor";
  wrap.setAttribute("aria-hidden", "true");
  wrap.append(
    svgEl(`
<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <g opacity="0.7">
    <rect x="40" y="60" width="16" height="16" rx="3" fill="${CORAL}" transform="rotate(20 48 68)"/>
    <circle cx="340" cy="90" r="9" fill="${TEAL}"/>
    <rect x="300" y="180" width="14" height="14" rx="3" fill="${YELLOW}" transform="rotate(-15 307 187)"/>
    <circle cx="60" cy="240" r="8" fill="${PURPLE}"/>
    <path d="M120 130 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="${YELLOW}"/>
    <rect x="350" y="320" width="15" height="15" rx="3" fill="${CORAL}" transform="rotate(30 357 327)"/>
    <circle cx="30" cy="420" r="9" fill="${YELLOW}"/>
    <path d="M280 430 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="${TEAL}"/>
    <rect x="70" y="540" width="14" height="14" rx="3" fill="${PURPLE}" transform="rotate(-20 77 547)"/>
    <circle cx="360" cy="560" r="8" fill="${ORANGE}"/>
    <rect x="320" y="660" width="16" height="16" rx="3" fill="${TEAL}" transform="rotate(15 328 668)"/>
    <circle cx="50" cy="700" r="9" fill="${CORAL}"/>
    <path d="M180 720 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="${PURPLE}"/>
  </g>
</svg>`),
  );
  return wrap;
}
