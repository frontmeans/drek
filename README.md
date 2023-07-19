# Document Render Kit

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

A kit of conventional tools for coordinated DOM manipulation.

[npm-image]: https://img.shields.io/npm/v/@frontmeans/drek.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@frontmeans/drek
[build-status-img]: https://github.com/frontmeans/drek/workflows/Build/badge.svg
[build-status-link]: https://github.com/frontmeans/drek/actions?query=workflow%3ABuild
[quality-img]: https://app.codacy.com/project/badge/Grade/da61788730574f64a9faec3dcdea612a
[quality-link]: https://www.codacy.com/gh/frontmeans/drek/dashboard?utm_source=github.com&utm_medium=referral&utm_content=frontmeans/drek&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/da61788730574f64a9faec3dcdea612a
[coverage-link]: https://www.codacy.com/gh/frontmeans/drek/dashboard?utm_source=github.com&utm_medium=referral&utm_content=frontmeans/drek&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/frontmeans/drek
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://frontmeans.github.io/drek/index.html

## Rendering Context

[rendering context]: #rendering-context

The kit attaches and maintains a DOM rendering context for document nodes.

The rendering context serves several purposes:

- Provides a [render scheduler] suitable for performant DOM manipulations.
- Provides a [namespace aliaser].
- Provides a [settlement] phase of rendering. A DOM node (e.g. custom element) may utilize this phase for custom actions
  before adding to document.
- Notifies when node added (connected) to document.

The rendering context of particular DOM node may be obtained using [drekContextOf] function.

There are three kinds of rendering contexts:

1. Document rendering context.

   Such context is always available in document and returned by [drekContextOf] function for any DOM node connected
   to the document.

2. Fragment content rendering context.

   It is created for each [rendered fragment] and is available via [DrekFragment.innerContext] property.
   The [drekContextOf] function returns this context for fragment's content, as well as for each DOM node added to it.

3. Unrooted rendering context.

   When a DOM node is neither connected to a document, nor part of a [rendered fragment]'s content, the [drekContextOf]
   function creates an unrooted context for the [root node] of that node.

   Unrooted context tracks a document connection and settlement semi-automatically. A [DrekContext.lift] method can be
   used to forcibly update them.

   Semi-automatic tracking means that each time an unrooted context created, it is registered for automatic lifting.
   The lifting happens either asynchronously, or synchronously right before the [drekBuild] function exit.

   Alternatively, a [drekLift] function can be used to lift a context of the [root node] after adding it to another one.

[render scheduler]: https://www.npmjs.com/package/@frontmeans/render-scheduler
[namespace aliaser]: https://www.npmjs.com/package/@frontmeans/namespace-aliaser
[drekBuild]: https://frontmeans.github.io/drek/modules.html#drekBuild
[drekLift]: https://frontmeans.github.io/drek/modules.html#drekLift
[drekContextOf]: https://frontmeans.github.io/drek/modules.html#drekContextOf
[DrekDragment]: https://frontmeans.github.io/drek/classes/drekFragment.html
[DrekFragment.innerContext]: https://frontmeans.github.io/drek/classes/drekFragment.html#innerContext
[DrekContext.lift]: https://frontmeans.github.io/drek/classes/DrekContext.html#lift
[root node]: https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode

## Rendered Fragment

[rendered fragment]: #rendered-fragment

A [DrekFragment] is a fragment of DOM tree, which content is to be placed to the document once rendered.

The content of rendered fragment is a [DocumentFragment].

The rendered fragment provides a separate [rendering context] for its content nodes. The latter informs content nodes
when they are added to document. It also establishes a [settlement] phase for them.

```typescript
import { drekAppender, drekContextOf, DrekFragment } from '@frontmeans/drek';

// A fragment appended to document body once rendered.
// Another rendering target can be specified. E.g. it may be another fragment.
const fragment = new DrekFragment(drekAppender(document.body));

// Render content.
render(fragment.content);

fragment.whenRendered(() => {
  // This is called when content is fully rendered and added to the target.
});

// Await for content to be rendered, then add it to the target.
fragment.render();

function render(content: Node): void {
  // Render some content.
  // The renderer don't have to be aware of the rendering target.
  // It can either render directly to the document or add to document fragment.
  const context = drekContextOf(content);

  // Schedule DOM manipulations.
  // The scheduler utilizes `requestAnimationFrame` when adding to the document directly,
  // but when adding to the fragment the rendering is immediate.
  context.scheduler()(() => {
    content.append('rendered content');
  });

  context.whenConnected(() => {
    // This is called when content nodes added to the document.
    // If the rendering target is another fragment, this will be called only when the target fragment's content,
    // in turn, added to the document.
  });
}
```

[DocumentFragment]: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment

## Settlement Phase

[settlement]: #settlement-phase

A settlement phase is designed primarily for custom elements.

A custom element rendering consists of two main phases:

1. Element construction (either during upgrade or by [document.createElement] call).
2. Element connection to document with [connectedCallback].

An element constructor can not manipulate DOM tree. So typically, the DOM manipulations happen inside
[connectedCallback]. This, however, is a source of potential performance issues, as [connectedCallback] is called
only after the element is added to document, while custom element rendering may be slow. E.g. when a custom element
renders nested ones.

The better approach would be to render custom elements to [DocumentFragment] and then add the fully rendered fragment
to the document.

This requires an additional _settlement_ callback that is available via rendering context. An event is sent by
[DrekFragment.settle] method. A custom element may receive this event via [DrekContext.whenSettled] method and start
rendering right away, before it is added to the document.

Here is a usage example.

```typescript
import { drekAppender, drekContextOf, DrekFragment } from '@frontmeans/drek';

const fragment = new DrekFragment(drekAppender(document.body));

// Render content.
render(fragment.content);

// Settle content.
fragment.settle();

// Await for content to be rendered, then add it to the target.
// This also settles the content
fragment.render();

function render(content: Node): void {
  // ...render some content.

  const context = drekContextOf(content);

  context.scheduler()(() => {
    const indicator = content.appendChild(document.createElement('div'));

    context.whenSettled(() => {
      // This is called after `fragment.settle()` call.
      // If the `fragment.settle()` is not called, then this is called when the content is added to the document,
      // just like a `context.whenConnected()` callback.
      indicator.innerText = `Settled at ${new Date().toISOString()}`;
    });
  });
}
```

[Document.createElement]: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
[connectedCallback]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
[DrekContext.whenSettled]: https://frontmeans.github.io/drek/classes/DrekContext.html#whenSettled
[DrekFragment.settle]: https://frontmeans.github.io/drek/classes/DrekFragment.html#settle

## Rendering Target

A rendering target ([DrekTarget]) represents a part of the DOM tree to place the rendered content to.

There are several convenient target implementations available:

- [drekAppender] - Creates a rendering target that appends content to parent node.

- [drekCharger] - Creates a rendering target that charges rendered content prior to placing it to another target.

  By default, encloses the rendered content into comments. The ongoing content updates replace the nodes between
  comments thus making the updated content occupy the same place.

- [drekInserter] - Creates a rendering target that inserts content to parent node at particular position.

- [drekReplacer] - Creates a rendering target that replaces content of the given node.

[DrekTarget]: https://frontmeans.github.io/drek/interfaces/DrekTarget.html
[drekAppender]: https://frontmeans.github.io/drek/modules.html#drekAppender
[drekCharger]: https://frontmeans.github.io/drek/modules.html#drekCharger
[drekInserter]: https://frontmeans.github.io/drek/modules.html#drekInserter
[drekReplacer]: https://frontmeans.github.io/drek/modules.html#drekReplacer

## Miscellaneous

A [DrekCssClasses] is an accessor to CSS classes of some element. With it, element's CSS classes can be manipulated
concurrently in a safe manner. E.g. multiple parties may add and remove CSS classes to the same element, even if the
class names are the same.

[DrekCssClasses]: https://frontmeans.github.io/drek/interfaces/DrekCssClasses.html
