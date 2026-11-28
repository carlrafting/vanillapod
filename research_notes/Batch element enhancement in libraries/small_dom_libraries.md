# Small DOM-helper, hyperscript-style and reactive UI libraries: applying props, listeners and children to existing elements and lists

Method and limits: official doc sites (vanjs.org, lit.dev, docs.solidjs.com, preactjs.com, mithril.js.org) were not reachable from this session (DNS failure; they would need to be allowed in network settings). All claims below come from source files on the `main` branch via raw.githubusercontent.com, read through a summarizing fetch tool (so quotes are short and some "absence" claims reflect only the file read). Versions are the `package.json` version of `main` at read time (Nov 2026), not necessarily the latest npm release. Where docs would be the normal source, that is listed under Gaps. For comparison, the brief says vanillapod ignores `innerHTML` in props; I did not inspect vanillapod itself.

Versions read: VanJS 1.6.2; Preact 11.2.0 (main); Preact Signals (preactjs/signals main, packages/preact, package version not read); Solid `solid-js` 2.0.4 (main) with dom-expressions `client.js` (main, version not read); lit-html 3.3.3; Mithril 2.3.8; hyperscript (hyperhype/hyperscript master, version not read); uhtml README describes v5 (v4 still recommended by author for stability).

## 1. Can they apply props or children to an element that already exists?

### Takeaway
Only some do it as a first-class operation. VanJS `van.add(dom, ...children)` appends to any existing element; Lit and Preact `render()` into an existing container; Solid and Lit have per-element hooks (`ref`, `use:`, element expressions) that run on elements the template creates, not arbitrary existing ones. Hyperscript, Mithril and uhtml have no "enhance existing element" API; Mithril explicitly does not adopt existing elements.

### Cited Findings
- VanJS: `let add = (dom, ...children) => {` (line 85) flattens with `children.flat(Infinity)` and appends each with `dom.append(child)`. It works on any existing DOM element. — [van.js 1.6.2](https://raw.githubusercontent.com/vanjs-org/van/main/src/van.js), [package.json](https://raw.githubusercontent.com/vanjs-org/van/main/package.json)
- VanJS `add` does not take props; props are only applied in tag-function creation (`van.tags.div({...}, ...)`): first arg is treated as props iff its prototype is `Object.prototype`. — [van.js](https://raw.githubusercontent.com/vanjs-org/van/main/src/van.js)
- Lit `render(value, container)`: first call creates a ChildPart stored on the container as `_$litPart$`; later calls reuse it and update in place. Content is inserted before `renderBefore` or appended to the container if absent (existing container children are not cleared by this logic as read). — [lit-html.ts, lit-html 3.3.3](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/lit-html.ts), [package.json](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/package.json)
- Lit `ElementPart`: `_$setValue` only resolves directives on the element; it writes nothing itself. So element-position expressions (`<div ${ref(r)}>`) exist but only inside Lit templates, not on arbitrary existing elements. — [lit-html.ts](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/lit-html.ts)
- Preact `render(vnode, parentDom)`: on first render, if `parentDom.firstChild` exists, existing child nodes are passed to `diff` as "excess DOM children", and whether each is reused or removed is decided during diffing; with hydrate flag the existing DOM is hydrated. Later renders diff against `parentDom._children`. (The file read had no `replaceNode` parameter.) — [render.js, Preact 11.2.0](https://raw.githubusercontent.com/preactjs/preact/main/src/render.js), [package.json](https://raw.githubusercontent.com/preactjs/preact/main/package.json)
- Solid (dom-expressions): `ref` functions are called with the node; `use(fn, element, arg)` calls `fn` untracked with the element. `spread(node, props)` applies a props object (including `ref`, children) to a node, so it can in principle target an existing element via the runtime. No `use:` prefix handler exists in `assignProp`; `use:` is a compile-time transform (inferred, not shown in the file read). — [client.js](https://raw.githubusercontent.com/ryansolid/dom-expressions/main/packages/dom-expressions/src/client.js), [solid package.json 2.0.4](https://raw.githubusercontent.com/solidjs/solid/main/packages/solid/package.json)
- Mithril `render(dom, vnodes)` diffs against `dom.vnodes`; existing elements are not adopted; on first render `dom.textContent` is cleared (existing content destroyed). — [render.js](https://raw.githubusercontent.com/MithrilJS/mithril.js/main/render/render.js), [package.json 2.3.8](https://raw.githubusercontent.com/MithrilJS/mithril.js/main/package.json)
- uhtml v5 `render(where, what)` for one-off or repeated rendering; README does not say whether existing container content is replaced or appended. — [uhtml README](https://raw.githubusercontent.com/WebReflection/uhtml/main/README.md)
- Preact Signals: signals passed as DOM props are bound by an effect that sets `dom[prop]` if the property exists (not SVG), else `setAttribute`/`removeAttribute`; applies after normal Preact diff, so only to Preact-rendered elements. — [signals preact/src/index.ts](https://raw.githubusercontent.com/preactjs/signals/main/packages/preact/src/index.ts)
- Lit `spread`: not in core lit. `@open-wc/lit-helpers` `spread`/`spreadProps` directives were reported broken/removed for Lit 2's directive API in release notes, while the 0.7.0 npm README still documents it; conflicting. — [web search summary, open-wc lit-helpers](https://www.npmjs.com/package/@open-wc/lit-helpers), [0.7.0 README](https://cdn.jsdelivr.net/npm/@open-wc/lit-helpers@0.7.0/README.md), [release note](https://newreleases.io/project/github/open-wc/open-wc/release/@open-wc%2Flit-helpers@0.4.0-next.0)

### Inferences
- `van.add` is the closest analogue to `enhance` children handling; none of the libraries offers props+listeners+children on a list of existing elements in one call.
- Mithril/uhtml/hyperscript are creation-only, so `enhance` fills a gap they leave.

### Gaps
- Official docs for Solid `use:`, Lit `ref`/`spread`, VanJS `add` not read (hosts unreachable); the `use:` behavior is from memory-free inference only. Solid 1.x vs 2.0 `use:` status not verified.
- hyperscript and uhtml versions not read.

## 2. Applying a props object: property vs attribute, on*, class/dataset/style, blocking/sanitizing

### Takeaway
Rules differ: VanJS and Preact prefer property when present and fall back to attribute; Mithril and Solid have explicit lists/prefixes; Lit/uhtml use syntax (`.prop`, `?bool`, `@event`) instead of heuristics. Almost none block `innerHTML` in a props object; Lit's security model is template-based (trusted types, optional sanitizer) rather than a prop blocklist. No dataset object handling was found in any.

### Cited Findings
- VanJS: setter found via `getPropDescriptor(protoOf(dom))?.set` (line 103); fallback `dom.setAttribute.bind(dom, k)` (line 111); keys starting with `on` (`k.startsWith("on")`, line 104) are listeners, old handler removed before new added; function or State values become reactive bindings; null/undefined are passed straight to the setter (no special removal). Setter lookup is cached for plain built-in tags. — [van.js](https://raw.githubusercontent.com/vanjs-org/van/main/src/van.js)
- Preact `setProperty`: `style` string -> `style.cssText`; style object diffed, `-` keys via `style.setProperty`; `on*` stored in `dom._listeners[name]` with one shared proxy, `Capture` suffix -> capture, `onClick` lowercased to `click`; non-function handler -> removal; non-SVG names `in dom` are assigned as properties (`dom[name] = value == null ? '' : value`) in try/catch, except `width, height, href, list, form, tabIndex, download, rowSpan, colSpan, role, popover` which use attributes; attribute set only if value != null and not `false` (except names with `-` at index 4, i.e. `data-`/`aria-`), else `removeAttribute`; functions are never serialized as attributes. No `dangerouslySetInnerHTML` handling in this file (it is handled elsewhere in diff, not read). — [props.js](https://raw.githubusercontent.com/preactjs/preact/main/src/diff/props.js)
- Solid `assignProp`: `style`/`classList` diffed helpers; `class`/`className` via `className()` (null removes attribute); `on:`/`oncapture:` native listeners; `on<name>` delegated to `document` via `$$name` for names in `DelegatedEvents`, else plain listener; `attr:` forces `setAttribute`; `bool:` toggles empty attribute; `prop:` forces property; custom elements (name contains `-`) and known property lists get property assignment; `value` on INPUT/TEXTAREA null -> `""`; fallback `setAttribute`/`setAttributeNS` with null removing. `innerHTML()` helper is marked deprecated and skips during hydration. — [client.js](https://raw.githubusercontent.com/ryansolid/dom-expressions/main/packages/dom-expressions/src/client.js)
- Mithril `setAttr`: skips `key`, null/undefined, lifecycle hooks, unchanged values (except form attrs); `on*` -> `updateEvent`; `xlink:` -> `setAttributeNS`; `true` -> empty attribute, `false` -> removed; style string assigned directly, object diffed (keys with `-` use `setProperty`); `className` is a property, `class` not special; no attribute-level `innerHTML` handling; contenteditable throws "Child node of a contenteditable must be trusted." unless a trusted `<` child. — [render.js](https://raw.githubusercontent.com/MithrilJS/mithril.js/main/render/render.js)
- hyperscript: `style` -> `e.style.cssText = value`; `/^on\w+/` keys -> `addEventListener(k.substring(2), fn, false)`; `data-` -> `setAttribute`; `attrs` object -> `setAttribute` each; classes come from the selector (`ClassList(e).add`), no `class` prop; function-valued props treated as observables. — [hyperscript index.js](https://raw.githubusercontent.com/hyperhype/hyperscript/master/index.js)
- Lit: `AttributePart` -> `setAttribute` (null/undefined become `''`, `nothing` removes); `PropertyPart` (`.prop`) assigns `element[name]` (`nothing` -> undefined); `BooleanAttributePart` (`?attr`) uses `toggleAttribute`; `EventPart` (`@event`) registers the part itself via `addEventListener`, re-registers only when capture/once/passive change; `handleEvent` calls listener with `options.host` as `this`. Optional `setSanitizer` (throws if set twice) applies to attribute/property/text writes; `<style>`/`<script>` child bindings rejected when a sanitizer is active; file does not itself block `on*` attributes or `innerHTML`. — [lit-html.ts](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/lit-html.ts)
- uhtml v5: plain attributes via `setAttribute`/`removeAttribute`; `.prop`; `@event` (array allows options); `onclick` direct events; `?bool`; `ref`; `key`. — [uhtml README](https://raw.githubusercontent.com/WebReflection/uhtml/main/README.md)
- Preact Signals: signal-valued props are bound via effects as property else attribute. — [signals index.ts](https://raw.githubusercontent.com/preactjs/signals/main/packages/preact/src/index.ts)

### Inferences
- A props-object helper such as `enhance` faces the same design choices; Preact's "property if `in dom`, with an attribute exceptions list, null/false removes" and Mithril's `true`/`false` attribute rule are the closest precedents. Ignoring `innerHTML` (vanillapod) is stricter than any library read; none explicitly blocked it in the files read.
- None provide `dataset` object handling in the files read; `data-*` attribute names are the idiom (hyperscript, Preact special-case `-` at index 4).

### Gaps
- Preact `dangerouslySetInnerHTML` and `className` normalization (in `diff/index.js` / `create-element.js`) not read.
- Mithril `class`/`className` normalization in vnode hyperscript not read; VanJS style/class docs not read.
- Whether Lit docs describe dev-mode warnings for `on*` attribute bindings: not confirmed.

## 3. Lists: arrays, iterables, null/false skipping, nested arrays

### Takeaway
Nested arrays are flattened by VanJS, hyperscript, Solid, Preact(array children) and Mithril-style normalization. `null`/`undefined` skipped nearly everywhere; `false` handling differs and is the main divergence: VanJS and Lit render `false` as text, Solid skips booleans.

### Cited Findings
- VanJS: `children.flat(Infinity)`; skips null/undefined by `child != _undefined && dom.append(child)`; `false` is not skipped and would be appended as text "false" (the fetch tool's reading of the code, not documented). Iterables other than arrays not flattened (`flat` is array-only; inference). — [van.js](https://raw.githubusercontent.com/vanjs-org/van/main/src/van.js)
- Solid `normalizeIncomingArray` flattens nested arrays and skips `null`, `undefined`, `true`, `false`; strings/numbers become text nodes; function entries become dynamic. Direct `null`/`undefined`/boolean child clears content. — [client.js](https://raw.githubusercontent.com/ryansolid/dom-expressions/main/packages/dom-expressions/src/client.js)
- Lit: child expressions accept iterables via `_commitIterable` (one ChildPart per item; extras removed); `nothing`, `null`, `''` clear content; `false` is not special-cased and renders as text. — [lit-html.ts](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/lit-html.ts)
- hyperscript: `isArray(l)` recurses over items; `l == null` skipped; node appended; function treated as observable. — [hyperscript index.js](https://raw.githubusercontent.com/hyperhype/hyperscript/master/index.js)
- Mithril: null children are skipped in create/update/remove loops; normalization lives in `Vnode.normalizeChildren` (not read). — [render.js](https://raw.githubusercontent.com/MithrilJS/mithril.js/main/render/render.js)
- uhtml: `key` ensures same DOM node within a list; array handling otherwise not documented in README. — [uhtml README](https://raw.githubusercontent.com/WebReflection/uhtml/main/README.md)

### Inferences
- `enhance`'s likely conventions (skip null/undefined, decide on false) can be justified by Solid (skip booleans) vs VanJS/Lit (render "false"); skipping `false` matches Solid, Preact (as vnodes) and common conditional-render idiom.

### Gaps
- Preact child normalization (`toChildArray`, `diffChildren`) not read; Preact skips null/boolean children per widely known behavior but I did not verify it here.
- No library read throws on DOM node child plus list (see Q4); no direct precedent for the TypeError.

## 4. Same DOM node passed in more than one place

### Takeaway
Libraries that append real nodes use native DOM semantics: the node moves, last placement wins. No library read clones, warns or throws; the problem is mostly undocumented.

### Cited Findings
- VanJS: nodes are passed to `dom.append(child)`, which moves a node already in the document (native semantics; inference from line 90). — [van.js](https://raw.githubusercontent.com/vanjs-org/van/main/src/van.js)
- Solid: `appendNodes` uses `insertBefore`, "so an existing node is moved rather than duplicated". — [client.js](https://raw.githubusercontent.com/ryansolid/dom-expressions/main/packages/dom-expressions/src/client.js)
- Lit: `_commitNode` clears old content and `_insert`s the node; passing an existing node moves it. Dev mode warns only when a host is rendered inside itself. — [lit-html.ts](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/lit-html.ts)
- hyperscript: `appendChild` of node (moves). — [hyperscript index.js](https://raw.githubusercontent.com/hyperhype/hyperscript/master/index.js)
- Mithril/Preact: take vnodes, not DOM nodes as children, so the question does not arise in the same form. — [Mithril render.js](https://raw.githubusercontent.com/MithrilJS/mithril.js/main/render/render.js)
- uhtml: README does not address it. — [uhtml README](https://raw.githubusercontent.com/WebReflection/uhtml/main/README.md)

### Inferences
- With N target elements and one DOM node child, native append would silently move the node into only the last target. That is exactly why `enhance` throwing a TypeError for DOM node children with a list is defensible; no surveyed library does this, so it is a novel guard. Strings/numbers (text) can safely be re-created per target.

### Gaps
- Preact: DOM nodes as children are not supported in vnode trees; not verified in source here.

## 5. ref callbacks and directives: one behavior on many elements

### Takeaway
`ref` callbacks (Solid, Lit, Preact) and directives (Solid `use:`, Lit directives) are the standard way to reuse behavior across elements: the same function is invoked once per element.

### Cited Findings
- Solid: `ref` function is called with the node; `use(fn, element, arg)` runs `fn` untracked with element and optional argument; `spread` calls refs via `use`. — [client.js](https://raw.githubusercontent.com/ryansolid/dom-expressions/main/packages/dom-expressions/src/client.js)
- Lit `ref`: callback or `createRef()` object. Same Ref object on several elements: last-set wins; callbacks are tracked per callback and host context, and called with `undefined` before being called with a new element; callback `this` is `options.host`. — [ref.ts via lit-html source summary](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/directives/ref.ts)
- Preact Signals: one prop-updater effect per bound prop per DOM element. — [signals index.ts](https://raw.githubusercontent.com/preactjs/signals/main/packages/preact/src/index.ts)
- uhtml: `ref` attribute "to retrieve the element via effects or by any other mean". — [uhtml README](https://raw.githubusercontent.com/WebReflection/uhtml/main/README.md)
- No ref handling found in hyperscript's index.js. — [hyperscript](https://raw.githubusercontent.com/hyperhype/hyperscript/master/index.js)

### Inferences
- `enhance(elements, props)` is effectively "run the same directive on each element" and returns the array, mirroring `ref`/`use` fan-out; the Lit ref pitfall (single Ref object across many elements keeps only the last) argues for callbacks or per-element invocation.

### Gaps
- Svelte actions not researched (marked "if relevant"; skipped for lack of doc access).
- Lit `directive()`/AsyncDirective API doc and Solid `use:` docs not read.

## 6. Removing listeners and cleanup

### Takeaway
Cleanup is mostly lifecycle-driven (unmount, re-render, directive disconnect), not per-call "undo". Listener removal happens when a handler prop is set to a non-function/null (Preact, Mithril, VanJS replace), or on unmount (Signals). Few offer a returned disposer.

### Cited Findings
- VanJS: the old `on*` handler is removed before the new one is added when the prop is re-applied; binding via State/functions uses `derive` (disposal tied to DOM disconnect is documented in VanJS docs, not read). — [van.js](https://raw.githubusercontent.com/vanjs-org/van/main/src/van.js)
- Preact: a non-function value for an `on*` prop sets handler to null and calls `removeEventListener` with the same proxy; a handler swap just updates `dom._listeners`. — [props.js](https://raw.githubusercontent.com/preactjs/preact/main/src/diff/props.js)
- Preact Signals: on UNMOUNT all prop updaters on the DOM element are disposed and original signals restored to `vnode.props`. — [signals index.ts](https://raw.githubusercontent.com/preactjs/signals/main/packages/preact/src/index.ts)
- Mithril: setting handler to null/undefined calls `removeEventListener`; one `EventDict` per element handles all events and auto-redraws; returning `false` from handler calls preventDefault + stopPropagation. — [render.js](https://raw.githubusercontent.com/MithrilJS/mithril.js/main/render/render.js)
- Lit: `EventPart` re-registers only when options change or listener removed; Ref directive clears ref on `disconnected()` and restores on `reconnected()`. — [lit-html.ts](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/lit-html.ts), [ref.ts](https://raw.githubusercontent.com/lit/lit/main/packages/lit-html/src/directives/ref.ts)
- hyperscript: `h.cleanup()` runs collected cleanup functions (observable subscriptions). — [hyperscript index.js](https://raw.githubusercontent.com/hyperhype/hyperscript/master/index.js)
- Solid: `on:` / `oncapture:` listeners add/remove natively; delegated `on<name>` stores `$$name` on the node (removal by reassigning/null; inferred). — [client.js](https://raw.githubusercontent.com/ryansolid/dom-expressions/main/packages/dom-expressions/src/client.js)

### Inferences
- Preact/Mithril keep one stable proxy/dict per element so a changed handler needs no re-attach and can be removed deterministically; an `enhance` that attaches the same listener to many elements might return or store a handle (for example via a WeakMap) for symmetric removal. None of the surveyed libraries returns an "undo" function for imperative application (hyperscript's `cleanup` is the nearest).

### Gaps
- `AbortController` / `signal` option usage not found in any file read.
- Solid `onCleanup` and Lit directive-specific cleanup docs not read.
