import {
  isAttributeNode,
  isCDATASectionNode,
  isCommentNode,
  isDocumentFragmentNode,
  isDocumentNode,
  isDocumentTypeNode,
  isElementNode,
  isProcessingInstructionNode,
  isShadowRootNode,
  isTextNode,
} from './node-types';

describe('isElementNode', () => {
  it('returns `true` for `Element`', () => {
    expect(isElementNode(document.createElement('div'))).toBe(true);
    expect(isElementNode(document.createElement('custom-element'))).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isElementNode(document.createTextNode('div'))).toBe(false);
  });
});

describe('isAttributeNode', () => {
  it('returns `true` for `Attribute`', () => {
    expect(isAttributeNode(document.createAttribute('test'))).toBe(true);
    expect(isAttributeNode(document.createAttributeNS('uri:testns', 'test'))).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isAttributeNode(document.createElement('div'))).toBe(false);
  });
});

describe('isTextNode', () => {
  it('returns `true` for `Text`', () => {
    expect(isTextNode(document.createTextNode('test'))).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isTextNode(document.createElement('div'))).toBe(false);

    const xmlDocument = document.implementation.createDocument(null, null);

    expect(isTextNode(xmlDocument.createCDATASection('section'))).toBe(false);
  });
});

describe('isCDATASectionNode', () => {
  it('returns `true` for `CDATASection`', () => {

    const xmlDocument = document.implementation.createDocument(null, null);

    expect(isCDATASectionNode(xmlDocument.createCDATASection('test'))).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isCDATASectionNode(document.createElement('div'))).toBe(false);
    expect(isCDATASectionNode(document.createTextNode('text'))).toBe(false);
  });
});

describe('isProcessingInstructionNode', () => {
  it('returns `true` for `ProcessingInstruction`', () => {
    expect(isProcessingInstructionNode(document.createProcessingInstruction('test', 'data'))).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isProcessingInstructionNode(document.createElement('div'))).toBe(false);
  });
});

describe('isCommentNode', () => {
  it('returns `true` for `ProcessingInstruction`', () => {
    expect(isCommentNode(document.createComment('test'))).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isCommentNode(document.createElement('div'))).toBe(false);
    expect(isCommentNode(document.createTextNode('test'))).toBe(false);
  });
});

describe('isDocumentNode', () => {
  it('returns `true` for `Document`', () => {
    expect(isDocumentNode(document)).toBe(true);

    const xmlDocument = document.implementation.createDocument(null, null);

    expect(isDocumentNode(xmlDocument)).toBe(true);

    const htmlDocument = document.implementation.createHTMLDocument();

    expect(isDocumentNode(htmlDocument)).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isDocumentNode(document.documentElement)).toBe(false);
    expect(isDocumentNode(document.createElement('div'))).toBe(false);
    expect(isDocumentNode(document.createTextNode('test'))).toBe(false);
  });
});

describe('isDocumentTypeNode', () => {
  it('returns `true` for `ProcessingInstruction`', () => {

    const docType = document.implementation.createDocumentType('test', 'test', 'uri:test');

    expect(isDocumentTypeNode(docType)).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isDocumentTypeNode(document.createElement('div'))).toBe(false);
    expect(isDocumentTypeNode(document)).toBe(false);
  });
});

describe('isDocumentFragmentNode', () => {
  it('returns `true` for `ProcessingInstruction`', () => {
    expect(isDocumentFragmentNode(document.createDocumentFragment())).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isDocumentFragmentNode(document.createElement('div'))).toBe(false);
    expect(isDocumentFragmentNode(document.createTextNode('test'))).toBe(false);
  });
});

describe('isShadowRootNode', () => {
  it('returns `true` for `ProcessingInstruction`', () => {

    const element1 = document.createElement('test-element');
    const element2 = document.createElement('test-element');

    expect(isShadowRootNode(element1.attachShadow({ mode: 'open' }))).toBe(true);
    expect(isShadowRootNode(element2.attachShadow({ mode: 'closed' }))).toBe(true);
  });
  it('returns `false` for everything else', () => {
    expect(isShadowRootNode(document.createElement('div'))).toBe(false);
    expect(isShadowRootNode(document.createDocumentFragment())).toBe(false);
  });
});
