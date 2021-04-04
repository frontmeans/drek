/**
 * Custom element.
 */
export interface CustomElement extends Element {

  attributeChangedCallback?(
      name: string,
      oldValue: string | null,
      newValue: string | null
  ): void;

  connectedCallback?(): void;

  disconnectedCallback?(): void;

}

/**
 * Custom element constructor signature.
 */
export interface CustomElementClass<T extends CustomElement = CustomElement> extends Function {
  prototype: T;
  observedAttributes?: readonly string[];
  new(): T;
}
