/**
 * A rendered content status.
 */
export interface DrekContentStatus {

  /**
   * Whether the content connected to the document.
   *
   * This is always `true` for document content, but may be `false` e.g. until a fragment is {@link DrekFragment.render
   * rendered}.
   */
  readonly connected: boolean;

}
