/**
 * Checks whether the given DOM node is an [element](https://developer.mozilla.org/en-US/docs/Web/API/Element).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `Element`, or `false` everything else.
 */
export function isElementNode(node: Node): node is Element {
  return node.nodeType === 1/* Node.ELEMENT_NODE */;
}

/**
 * Checks whether the given DOM node is an [attribute](https://developer.mozilla.org/en-US/docs/Web/API/Attr).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `Attr`, or `false` everything else.
 */
export function isAttributeNode(node: Node): node is Attr {
  return node.nodeType === 2/* Node.ATTRIBUTE_NODE */;
}

/**
 * Checks whether the given DOM node is a [text](https://developer.mozilla.org/en-US/docs/Web/API/Text).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `Text`, or `false` everything else.
 */
export function isTextNode(node: Node): node is Text {
  return node.nodeType === 3/* Node.TEXT_NODE */;
}

/**
 * Checks whether the given DOM node is a [CDATA section](https://developer.mozilla.org/en-US/docs/Web/API/CDATASection).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `CDATASection`, or `false` everything else.
 */
export function isCDATASectionNode(node: Node): node is CDATASection {
  return node.nodeType === 4/* Node.CDATA_SECTION_NODE */;
}

/**
 * Checks whether the given DOM node is a [processing instruction](https://developer.mozilla.org/en-US/docs/Web/API/ProcessingInstruction).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `ProcessingInstruction`, or `false` everything else.
 */
export function isProcessingInstructionNode(node: Node): node is ProcessingInstruction {
  return node.nodeType === 7/* Node.PROCESSING_INSTRUCTION_NODE */;
}

/**
 * Checks whether the given DOM node is a [comment](https://developer.mozilla.org/en-US/docs/Web/API/Comment).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `Comment`, or `false` everything else.
 */
export function isCommentNode(node: Node): node is Comment {
  return node.nodeType === 8/* Node.COMMENT_NODE */;
}

/**
 * Checks whether the given DOM node is a [document](https://developer.mozilla.org/en-US/docs/Web/API/Document).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `Document`, or `false` everything else.
 */
export function isDocumentNode(node: Node): node is Document {
  return node.nodeType === 9/* Node.DOCUMENT_NODE */;
}

/**
 * Checks whether the given DOM node is a [document type](https://developer.mozilla.org/en-US/docs/Web/API/DocumentType).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `DocumentType`, or `false` everything else.
 */
export function isDocumentTypeNode(node: Node): node is DocumentType {
  return node.nodeType === 10/* Node.DOCUMENT_TYPE_NODE */;
}

/**
 * Checks whether the given DOM node is a [document fragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment).
 *
 * @param node - A node to check.
 *
 * @returns `true` for `DocumentFragment`, or `false` everything else.
 */
export function isDocumentFragmentNode(node: Node): node is DocumentFragment {
  return node.nodeType === 11/* Node.DOCUMENT_FRAGMENT_NODE */;
}

/**
 * Checks whether the given DOM node is a [shadow root](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).
 *
 * Note that shadow root is a kind of {@link isDocumentFragmentNode document fragment}.
 *
 * @param node - A node to check.
 *
 * @returns `true` for `ShadowRoot`, or `false` everything else.
 */
export function isShadowRootNode(node: Node): node is ShadowRoot {
  return isDocumentFragmentNode(node) && !!(node as Partial<ShadowRoot>).host;
}
