/** ごく小さな DOM ヘルパ。フレームワーク無しで要素を組み立てる。 */

type Child = Node | string | null | undefined | false;

interface Attrs {
  class?: string;
  id?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  accept?: string;
  hidden?: boolean;
  href?: string;
  download?: string;
  style?: string;
  [key: `data-${string}`]: string | undefined;
  onclick?: (e: MouseEvent) => void;
  oninput?: (e: Event) => void;
  onchange?: (e: Event) => void;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val == null || val === false) continue;
    if (key === "class") node.className = String(val);
    else if (key === "onclick") node.addEventListener("click", val as EventListener);
    else if (key === "oninput") node.addEventListener("input", val as EventListener);
    else if (key === "onchange") node.addEventListener("change", val as EventListener);
    else if (key === "disabled") (node as HTMLButtonElement).disabled = Boolean(val);
    else if (key === "hidden") node.hidden = Boolean(val);
    else if (key === "value") (node as HTMLInputElement).value = String(val);
    else node.setAttribute(key, String(val));
  }
  for (const child of children) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return node;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}

/**
 * 自前のインラインSVG文字列を要素化する。装飾イラスト用。
 * 外部入力は渡さない前提（XSS懸念なし）。
 */
export function svgEl(markup: string): SVGElement {
  const tpl = document.createElement("template");
  tpl.innerHTML = markup.trim();
  return tpl.content.firstElementChild as SVGElement;
}
