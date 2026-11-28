# Web platform primitives for working on many elements at once

Source access note: developer.mozilla.org, dom.spec.whatwg.org, html.spec.whatwg.org, caniuse.com and web.dev did not resolve from this session (network allowlist). Only github.com and raw.githubusercontent.com were reachable. MDN claims below are therefore read from the MDN source repository (mdn/content, mdn/browser-compat-data raw files), which is the same text MDN publishes. WHATWG spec text was not read directly. Page content was returned through a summarizing fetch tool, so quotes are as relayed by it. Date of research: 2026-11-28.

## Event delegation: mechanics, limits, and when one container listener wins

### Takeaway
Delegation puts one listener on an ancestor and uses `event.target` (origin) vs `event.currentTarget` (the element holding the listener) to route. It only works for events that bubble; `focus` does not bubble but `focusin` does. One container listener also covers elements added later, which a per-element loop does not.

### Cited Findings
- Event bubbling "enables event delegation": set the listener on a parent instead of every child. — [MDN Event bubbling source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/core/scripting/event_bubbling/index.md)
- `target` is the element on which the event was initially fired; `currentTarget` differs for handlers attached to different elements in the hierarchy. — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/core/scripting/event_bubbling/index.md)
- `stopPropagation()` prevents the event bubbling to any other elements (so a delegated ancestor listener will not see an event stopped below it). — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/learn_web_development/core/scripting/event_bubbling/index.md)
- `Element.closest()` traverses the element and its parents toward the root and returns the first match, which can be the element itself, or `null` if none. Example selectors include `"div div"` and `":not(div)"`. This is the usual way to map `event.target` (possibly a child such as an icon inside a button) back to the intended element. — [MDN closest source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/element/closest/index.md)
- `focusin` bubbles while `focus` does not; MDN's example attaches one `focusin` listener to a form and reads `event.target` to find the focused input. — [MDN focusin source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/element/focusin_event/index.md)
- Inside a handler, `this` is a reference to the element the listener is attached to (for a delegated listener that is the container, not the clicked child). — [MDN addEventListener source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/eventtarget/addeventlistener/index.md)
- Capture-phase listeners run before target and bubbling-phase listeners; the `capture` option is the other route to observe non-bubbling events at an ancestor. — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/eventtarget/addeventlistener/index.md)

### Inferences
- Known-from-general-knowledge but NOT verified in a fetched source here: `blur`, `mouseenter`, `mouseleave`, `load`, `scroll` (on elements) do not bubble; delegation for them needs `capture: true` or the bubbling counterparts (`focusin`/`focusout`, `mouseover`/`mouseout`). Only the `focus`/`focusin` pair was confirmed above.
- Delegation wins when the element set is dynamic (added/removed later), large, or homogeneous; per-element listeners win when the event does not bubble, when handlers need per-element closure state, when `stopPropagation` is used by inner code, or when elements live in different shadow roots (events are retargeted; this was not sourced).
- A batch helper that loops `el.addEventListener(...)` creates N listeners and does not cover future elements; delegation does both. This is where a helper adds value only for a one-off, known set of existing elements.

### Gaps
- The MDN bubbling article does not discuss non-bubbling events or `closest()`; no fetched source lists which events do not bubble (WHATWG UI Events / HTML specs unreachable).
- No source on shadow DOM event retargeting or `composedPath()` effects on delegation.
- No performance measurements comparing N listeners vs one.

## AbortController / `signal` option, and shared `handleEvent` listener objects

### Takeaway
Passing one `AbortSignal` as the `signal` option to many `addEventListener` calls lets a single `abort()` remove them all. Support is universal in current browsers (Chrome 90, Firefox 86, Safari 15). A single `handleEvent` object can be registered on many elements.

### Cited Findings
- `signal` option: "The listener will be removed when the abort() method of the AbortController which owns the AbortSignal is called." — [MDN addEventListener source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/eventtarget/addeventlistener/index.md)
- Browser-compat-data for `addEventListener` `options.signal`: Chrome 90, Firefox 86, Safari 15, Edge mirrors Chrome (90); standard track, not experimental, not deprecated; no baseline field in that entry (tagged `web-features:events`). — [mdn/browser-compat-data EventTarget.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/EventTarget.json)
- Chromium's intent-to-ship describes the same behavior: create the signal from an AbortController, pass it in options, `abort()` removes the listener. — [search result summary of blink-dev thread](https://groups.google.com/a/chromium.org/g/blink-dev/c/8_86NDuVdRk) (thread itself not fetched)
- The `listener` must be null, a function, or an object with a `handleEvent()` method. — [MDN addEventListener source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/eventtarget/addeventlistener/index.md)
- If the same function or object is already in the target's listener list (with same type/capture), it is not added a second time (dedupe is per target, so one object across many elements is fine). — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/eventtarget/addeventlistener/index.md)
- `once`: listener invoked at most once after being added; `passive`: listener cannot cancel the event. — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/eventtarget/addeventlistener/index.md)

### Inferences
- Because all support versions are 2021 or earlier, `signal` is safe to rely on in 2026 without a polyfill; this is an inference from the version numbers, not a Baseline label (none was in the entry).
- `const ac = new AbortController(); els.forEach(el => el.addEventListener('click', h, {signal: ac.signal}))` gives batch teardown natively, so a helper returning an array of elements only adds value if it also owns/returns the controller or accepts a `signal`.
- A shared `{handleEvent(e){...}}` object makes one handler identity across elements, so per-element `this` is the object, and `e.currentTarget` identifies the element.

### Gaps
- Whether `abort()` also removes listeners when an already-aborted signal is passed (listener never added) was not verified in a fetched source.
- caniuse/Baseline label for the signal option was unreachable.

## NodeList and HTMLCollection: iteration, live vs static

### Takeaway
`NodeList` is iterable and has `forEach`; `querySelectorAll` returns a static list, while things like `childNodes` are live. Use `Array.from` / spread for array methods.

### Cited Findings
- "In most cases, the NodeList is live... In other cases, the NodeList is static." `Node.childNodes` is live; "The ubiquitous document.querySelectorAll() method is the only API that returns a static NodeList." — [MDN NodeList source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/nodelist/index.md)
- NodeList is not an Array but can be iterated with `forEach()`; browsers also support `entries()`, `values()`, `keys()`; it can be converted with `Array.from()`. — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/nodelist/index.md)

### Inferences
- A batch helper taking "a list of elements" must accept NodeList, HTMLCollection and arrays. `Array.from(x)` handles all iterables/array-likes; spread (`[...x]`) requires `Symbol.iterator` (NodeList has it per the iterator methods above; HTMLCollection iterability was not sourced).
- Snapshotting a live collection before looping (via `Array.from`) avoids skipped/extra items if the callback moves elements out of the collection.

### Gaps
- HTMLCollection (`getElementsByClassName`, `children`) live behavior, lack of `forEach`, and `Symbol.iterator` support were not confirmed from a fetched source (page not retrieved).

## Moving vs cloning; `append`; templates

### Takeaway
Appending an already-attached node moves it; to place the "same" content in several places you must clone, and clones lose `addEventListener` listeners. `Element.append` accepts strings (as Text nodes, not HTML) and many args.

### Cited Findings
- `appendChild`: no need to remove the node from its old parent first; a node cannot be in two places at once. `cloneNode()` can be used to copy before appending. Appending a DocumentFragment moves all its contents into the parent and returns the emptied fragment. — [MDN appendChild source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/node/appendchild/index.md)
- `append()` differs from `appendChild()`: accepts strings as well as nodes, returns nothing (appendChild returns the node), and takes several nodes/strings. "Strings are inserted as equivalent Text nodes." — [MDN Element.append source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/element/append/index.md)
- `cloneNode` copies all attributes and values (including inline `on*` attributes); with `deep` copies the subtree. It does not copy listeners added via `addEventListener()` or `onevent` properties such as `node.onclick = fn`. Canvas pixels are not copied. — [MDN cloneNode source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/node/clonenode/index.md)
- `cloneNode()` may produce duplicate IDs; change the clone's id. — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/node/clonenode/index.md)
- Custom elements: the document context determines the registry; for template content use `document.importNode()` rather than `cloneNode()` so custom elements upgrade with the current document's definitions. — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/node/clonenode/index.md)

### Inferences
- A helper that applies listeners to clones must re-apply them after cloning, which is a natural use of a batch `enhance` (clone N, then enhance the clones); delegation on the container avoids this entirely since clones inserted in the container are covered.
- `append(...children)` handles the `...children` part of a helper natively, including string children, so the helper does not need to reimplement it. `append` with an element already in the DOM moves it, so passing the same child node to several parents leaves it only in the last; each parent needs its own clone.

### Gaps
- The `<template>` element page (content is an inert DocumentFragment, `template.content.cloneNode(true)`) was not fetched. Not sourced here.
- JS expando properties on cloned nodes: MDN page does not address them explicitly (general knowledge: not copied, unverified).
- MDN append page does not state moving behavior itself; that is on the appendChild page above.

## Custom elements and customized built-ins

### Takeaway
`customElements.define` attaches behavior (via `connectedCallback`) to every matching tag, including ones already in the document and ones added later. Autonomous elements are universal; customized built-ins (`is=`) are unsupported in Safari, and Safari says it does not plan to support them.

### Cited Findings
- Autonomous custom elements inherit from `HTMLElement` and must implement behavior from scratch; customized built-ins inherit from standard elements (e.g. via `is=`) and extend select instances' behavior. — [MDN using custom elements source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/web_components/using_custom_elements/index.md)
- "Safari does not plan to support customized built-in elements." — [same](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/web_components/using_custom_elements/index.md)
- BCD: `CustomElementRegistry` Chrome 54, Firefox 63, Safari 10.1; `builtin_element_support`: Chrome 67, Firefox 63, Safari not supported (WebKit bug 182671); `upgrade`: Chrome 68, Firefox 63, Safari 12.1; `whenDefined`: Chrome 54, Firefox 63, Safari 10.1. — [mdn/browser-compat-data CustomElementRegistry.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/CustomElementRegistry.json)
- `connectedCallback` is "Called each time the element is added to the document"; MDN advises doing setup there rather than in the constructor. — [MDN using custom elements source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/web_components/using_custom_elements/index.md)
- `connectedMoveCallback`: Chrome 133, Firefox 144, Safari not supported. — [BCD](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/CustomElementRegistry.json)

### Inferences
- Tags must contain a hyphen (general knowledge, not sourced here), so custom elements cannot enhance existing `<button>`/`<li>` etc. in Safari; they require changing markup to a custom tag. A batch helper works on any existing element, no markup change, which is its distinct niche versus `is=`.
- `connectedCallback` runs on every (re)insertion, so moving elements re-fires it; a helper applied once does not.

### Gaps
- The Safari status was current as of the MDN `main` branch fetched in Nov 2026 and BCD shows "not supported"; no WebKit statement dated 2026 was fetched.
- Hyphen naming rule and upgrade-of-existing-elements semantics: not sourced.

## Finding elements added later: MutationObserver, `:is()` / `:has()`

### Takeaway
`MutationObserver` with `childList` + `subtree` is the native way to notice new nodes, delivered asynchronously in batches. `:is()`/`:has()` are selector features for matching, not observers.

### Cited Findings
- "The MutationObserver interface provides the ability to watch for changes being made to the DOM tree." Example config uses `attributes`, `childList`, `subtree` with `observer.observe(target, config)`; callback receives a `mutationList` (multiple records per call); `takeRecords()` empties the pending queue, implying asynchronous queued delivery. — [MDN MutationObserver source](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/mutationobserver/index.md)

### Inferences
- The observer pattern: on each added node, test `node.matches(sel)` and `node.querySelectorAll(sel)` and call the same batch enhance function. This is a place where a batch `enhance(elements, ...)` is directly reusable.
- Custom elements or delegation avoid the observer for most cases.

### Gaps
- `:has()` and `:is()` pages: the `:has` source URL returned 404 and `:is` was not tried; browser support (Baseline status) not verified. Note `:has()` is a CSS styling/query tool and cannot itself trigger code on new elements.
- No source on MutationObserver cost at scale.

## Current proposals (status as of Nov 2026)

### Takeaway
Scoped custom element registries have shipped in all three engines (Chrome 146, Firefox 159, Safari 26 per BCD). DOM Parts is still a proposal page with no stated status. Custom attributes (a closer native analogue to batch behavior attachment) is an open WICG discussion with a minimal MVP being drafted.

### Cited Findings
- Scoped registries: `CustomElementRegistry()` constructor and `initialize()` are Chrome 146, Firefox 159, Safari 26, standard track. — [BCD CustomElementRegistry.json](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/CustomElementRegistry.json)
- Proposal text: new registries attached via `attachShadow({registry})`; `ShadowRoot` gains `createElement`, `createElementNS`, `importNode`; falls back to global registry; open questions on adoption and Declarative Shadow DOM. — [WICG Scoped-Custom-Element-Registries.md](https://raw.githubusercontent.com/WICG/webcomponents/gh-pages/proposals/Scoped-Custom-Element-Registries.md)
- DOM Parts: joint Apple/Google proposal for "a unit of mutable state in a DOM tree" (attribute, child nodes, or JS property), imperative plus declarative `<template>` APIs; page states no maturity or browser support. — [WICG DOM-Parts.md](https://raw.githubusercontent.com/WICG/webcomponents/gh-pages/proposals/DOM-Parts.md)
- Custom attributes (WICG/webcomponents#1029): opened by Lea Verou Sept 2023; Dec 2025 to Jan 2026 direction is a minimal MVP with a global `customAttributes` registry modeled on `customElements`, scoped registries and behavior composition later; thread still open; explainer at webplatformco/project-custom-attributes. Participants call it a possible alternative to customized built-ins. — [WICG issue 1029](https://github.com/WICG/webcomponents/issues/1029); [explainer repo](https://github.com/webplatformco/project-custom-attributes/)

### Inferences
- If custom attributes ship, they would be a native "attach behavior to every element matching a pattern" mechanism that works on built-in elements (including Safari), which overlaps with what a batch helper plus MutationObserver does today. Nothing has shipped per the sources found.

### Gaps
- Declarative custom elements: no source found/fetched; status unknown.
- DOM Parts implementation status in browsers: unknown (the proposal page gives none).
- The WHATWG/HTML spec status of scoped registries and any shipping notes beyond BCD version numbers were not verified.
