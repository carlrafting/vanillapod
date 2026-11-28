# Declarative behavior attachment (Stimulus, Alpine, htmx, Unpoly, data-* pattern) vs. `enhance(elements, props, ...children)`

Research limits (read first): the doc sites stimulus.hotwired.dev, alpinejs.dev, htmx.org and unpoly.com were not reachable from this session (DNS blocked), and `gh` access to the repos was denied. Claims below come from raw GitHub source on the default branch (fetched 2026-11-28) via a summarizing fetch tool, not from the official docs. Versions are the `package.json` version on the default branch at fetch time, not necessarily a tagged release. Unpoly is covered only by a search-result summary of its docs. Quotes inside findings come from the fetch tool's extraction of the source, so treat them as near-verbatim, not guaranteed exact.

Versions read: Stimulus 3.2.2 ([package.json](https://raw.githubusercontent.com/hotwired/stimulus/main/package.json)); Alpine.js 3.17.5 ([package.json](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/package.json)); htmx 2.0.11 on `master` ([package.json](https://raw.githubusercontent.com/bigskysoftware/htmx/master/package.json)); Unpoly version not determined.

## How does each library find the elements, and does the API take a selector, a list, or neither?

### Takeaway
All four are "neither": you do not pass elements or a selector at the call site. Matching is declared once (an attribute convention or a registered selector) and the library finds elements itself. Stimulus keys on `data-controller`, Alpine on `x-data` plus other registered root/init selectors, htmx on a built-in selector of `hx-*` verb attributes, and Unpoly on a selector you register with `up.compiler`. `enhance(list, props)` is the inverse: the caller already holds the elements.

### Cited Findings
- Stimulus: the Router does not scan the DOM; it delegates to a `ScopeObserver` that reports matches, and a `Scope` is created per (element, identifier) pair. Version 3.2.2. — [router.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/router.ts)
- Stimulus: one controller class is registered per identifier with `loadDefinition`; `connectModule` then connects every existing scope for that identifier (`scopes.forEach((scope) => module.connectContextForScope(scope))`). Registration is by name, not by selector or element list. — [router.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/router.ts)
- Alpine: `start()` collects elements matching root or init selectors with `querySelectorAll`, filters out those nested inside another root (`let outNestedComponents = el => ! closestRoot(el.parentElement, true)`), and calls `initTree` on each outermost root. Version 3.17.5. — [lifecycle.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/lifecycle.js)
- Alpine: `initTree(el, walker, intercept)` is also public as `Alpine.initTree`, so a caller can hand it one element (the closest analogue to passing elements explicitly), but it takes a single root and walks its subtree, not a list. — [lifecycle.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/lifecycle.js)
- htmx: `findElementsToProcess` runs one `querySelectorAll` over a composite selector (verb attributes, boosted links, forms, submit inputs, `hx-ext`, `hx-trigger`, extension selectors); it searches descendants only, and `processNode` handles the root separately. `htmx.process = processNode` is the public entry point for content added outside the normal request cycle and accepts a target (resolved by `resolveTarget`). Version 2.0.11. — [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js)
- htmx: `hx-on` elements are found separately via an XPath query (`HX_ON_QUERY`) and handled by `processHxOnWildcard`. — [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js)
- Unpoly: a compiler is registered with `up.compiler(selector, fn)`; it can return a destructor. Only the destructor/cleanup behavior was confirmed (see below); selector semantics were not read from the docs. — search summary of [unpoly.com/up.destructor](https://unpoly.com/up.destructor) and [unpoly.com/enhancing-elements](https://unpoly.com/enhancing-elements)

### Inferences
- A list-taking `enhance()` sits at a different point on the spectrum: it is imperative and caller-scoped, with no registry, no naming convention and no global observer. Its only "find" step is whatever produced the list (`querySelectorAll`, an array, event delegation).
- Alpine's `initTree(el)` and htmx's `htmx.process(el)` are the only analogues that take explicit elements, and both take one root, so they are comparable to `enhance(element, ...)` rather than the list form.
- The vanillapod `initX(root, selector)` functions are effectively a hand-rolled, one-shot version of Unpoly's `up.compiler(selector, fn)` / htmx's `process(root)`: selector is a parameter with a default, root scopes the search, and nothing is registered globally. (Vanillapod code: `/home/user/vanillapod/components/copy-button/copy-button.js`, `/home/user/vanillapod/docs/enhancing-markup.md`.)

### Gaps
- Official docs for all four libraries were unreachable, so documented (as opposed to implemented) behavior is unverified, including Stimulus `data-controller` parsing details and Alpine's exact root selector list.
- Unpoly `up.compiler` selector/registration details and version were not read.

## How are elements added to the page later handled?

### Takeaway
Stimulus and Alpine use a document-level `MutationObserver`; htmx re-processes only content it swaps in itself (plus an explicit `htmx.process`); Unpoly (per its docs summary) compiles fragments it inserts. `enhance()` and vanillapod's `initX` have no hook for later content: the caller must call them again on the new subtree.

### Cited Findings
- Stimulus: `Router.start()`/`stop()` simply start and stop the scope observer, which is mutation-driven. `ElementObserver.processAddedNodes` checks `elementIsActive(element)` (connected to the same document and contained in the root) and processes the added subtree. Version 3.2.2. — [router.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/router.ts); behavior of `ElementObserver` summarized from the source file (path `src/mutation-observers/element_observer.ts` on `main`; the first attempt with a hyphenated path returned 404, so only the underscored path succeeded) — [element_observer.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/mutation-observers/element_observer.ts)
- Alpine: `start()` calls `startObservingMutations` and registers hooks so added elements go to `initTree`, removed elements go to `destroyTree`, and new attributes go to `directives`. Version 3.17.5. — [lifecycle.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/lifecycle.js)
- Alpine: `startObservingMutations` creates a `MutationObserver` over `document` (subtree, childList, attributes, old attribute values); records are batched via `takeRecords()` and a microtask; `onMutate` classifies added/removed nodes and attributes. — [mutation.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/mutation.js)
- Alpine: `mutateDom(callback)` pauses the observer while Alpine itself changes the DOM, so its own mutations do not re-trigger initialization (`if (! currentlyObserving) return callback()`; otherwise stop, run, resume in `finally`). — [mutation.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/mutation.js)
- htmx: after a swap, `makeAjaxLoadTask` calls `processNode` on the new content and fires `htmx:load` on the new child; `htmx.onLoad(cb)` is `htmx.on('htmx:load', evt => cb(evt.detail.elt))`. On first page load `processNode(body)` runs inside `ready(...)`. No `MutationObserver` was seen in the portions read (first 100k of ~171k characters, plus a later slice) — absence not confirmed for the unread tail. Version 2.0.11. — [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js)
- Unpoly: compilers run when fragments are inserted/updated (and destroyed via `up.destroy()`). Only the destroy half was confirmed by the search summary. — [unpoly.com/up.destroy](https://unpoly.com/up.destroy)

### Inferences
- Observer-based (Stimulus, Alpine) makes enhancement automatic for any insertion path, including third-party scripts, at the cost of a global observer and the need for idempotence/move handling. Event-based (htmx, Unpoly) only covers insertions the library performs, so other insertions need a manual `htmx.process` / `up.hello`-style call.
- `enhance(list)` and `initX(root)` are in the event-based camp in its most manual form: re-run on the inserted subtree (`initX(newFragment)`), which works because `root` scopes the search. A list-taking `enhance` can be fed `fragment.querySelectorAll(...)` the same way.

### Gaps
- No source or docs read for Unpoly's insertion hook (`up.hello`, compile timing).
- htmx tail of `htmx.js` (last ~71k chars at first read) not fully inspected for any observer use.

## How are per-element state and teardown handled, and how are listeners removed?

### Takeaway
Each library keeps per-element state somewhere the library owns (controller instance, Alpine scope plus `_x_*` expandos, htmx internal data, Unpoly compiler closure) and tears it down on removal. `enhance()` and vanillapod `initX` keep state in closures and have no teardown path.

### Cited Findings
- Stimulus: each `Context` creates one controller (`new module.controllerConstructor(this)`) over a single `scope`; `connect()` starts binding/value/target/outlet observers then calls `controller.connect()`; `disconnect()` calls the controller's disconnect hook first, then stops observers in reverse order. `initialize()` runs once in the constructor, before any connect. Version 3.2.2. — [context.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/context.ts) (the "one controller per element" reading is inferred by the fetch summary from the scope relationship, not stated).
- Stimulus: when an action is removed, `bindingDisconnected(binding, !action.element.isConnected)` clears the cached listener only for disconnected elements, because "caching listeners for removed elements would retain the element"; connected elements keep the cache to preserve `{ once: true }` history. `stop()` clears all. — [binding_observer.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/binding_observer.ts)
- Alpine: `destroyTree(root)` walks the removed subtree calling `cleanupElement` and `cleanupAttributes` and `delete el._x_marker`, which allows a re-added element to initialize again. Version 3.17.5. — [lifecycle.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/lifecycle.js)
- Alpine: only removed nodes that have `_x_marker` are tracked for teardown; a node present in both added and removed lists is treated as a move and left alone; a removed node inside an added node is skipped, so it is not torn down and rebuilt. — [mutation.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/mutation.js)
- htmx: `addEventListener` records `{trigger, listener, on}` in `nodeData.listenerInfos`; `deInitNode` clears the timeout, removes each tracked listener (`removeEventListenerImpl(info.on, info.trigger, info.listener)`), calls `deInitOnHandlers`, and deletes stored keys except `firstInitCompleted` (so `load` triggers fire once). `cleanUpElement` fires `htmx:beforeCleanupElement`, calls `deInitNode`, recurses into children; `swapDelete`/`swapInnerHTML` call it before removal. Fallback: a listener removes itself on next fire if `!bodyContains(elt)`. Version 2.0.11. — [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js)
- htmx: `htmx.remove` calls `parentElt(elt).removeChild(elt)` without `cleanUpElement` (the fetch tool's reading of the code, not documented behavior). — [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js)
- Unpoly: a compiler may return a destructor, or call `up.destructor(element, fn)` to register one; all registered destructors run when `up.destroy()` removes the element; if the destructor is registered on a detached element it runs immediately; if a destructor throws, `up.destroy()` still removes the element. Async compilers cannot return a destructor and should use `up.destructor()` after checking the element is still attached (community note). — [up.destructor / up.destroy summary](https://unpoly.com/up.destructor), [makandra card](https://makandracards.com/makandra/525263-destructors-async-unpoly-compilers)
- Vanillapod: `initCopyButtons` adds an anonymous `click` listener per button inside a loop and keeps state in the closure; there is no returned cleanup. — `/home/user/vanillapod/components/copy-button/copy-button.js`

### Inferences
- The pattern of "teardown fires before removal and is symmetrical with setup" is common to all four. None rely on garbage collection alone; htmx's self-removing listener and Stimulus's cache-clearing comment both show leaks via retained element references were a real concern.
- If vanillapod wants teardown for `initX`/`enhance`, a lightweight option consistent with these libraries is returning a cleanup function (Unpoly style) or an `AbortController`/`{ signal }` passed to listeners, rather than tracking listeners in a registry (htmx style). This is a design suggestion, not a cited fact.

### Gaps
- Alpine's `x-data` `destroy()` method and `Alpine.data` reuse semantics were not read (docs unreachable).
- Stimulus handbook text on `disconnect()` expectations was not read.

## How are shared handlers handled, and how does a handler learn which element an event is for?

### Takeaway
Stimulus shares one native listener across bindings but gives each binding a controller instance, so the handler's `this` identifies the element's controller (`event.currentTarget` is whatever the DOM sets). `enhance(list, {onclick})` attaches the same function to every element, so `event.currentTarget` is the only identifier, which matches vanillapod's own documentation.

### Cited Findings
- Stimulus: `EventListener` registers one native listener per (target, eventName, options) and fans out to a `Set` of bindings, sorted by `index`, honoring a `stopImmediatePropagation` flag it adds. Version 3.2.2. — [event_listener.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/event_listener.ts)
- Stimulus: `Binding.invokeWithEvent` calls `this.method.call(this.controller, event)`; `willBeInvokedByEvent` gates on whether the event target is the scope element or inside the scope; `event.params` is assigned from the action's params; `currentTarget` is not set by Binding. — [binding.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/binding.ts)
- htmx: each element's triggers/handlers are registered per node and stored on that node's internal data; `hx-on` handlers are stored in `nodeData.onHandlers` and rebuilt on every `processNode`. — [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js)
- Vanillapod `enhance()` docs: "Every element gets the same listener, so use `event.currentTarget` inside it"; children must be strings/numbers because DOM nodes cannot be shared across elements, and non-element entries throw before any element is changed. — `/home/user/vanillapod/docs/enhancing-markup.md`

### Inferences
- Stimulus resolves identity through the controller (state) object; `enhance(list)` resolves it through the event. The two answer "which element?" differently: closure/instance versus event-derived. The list form therefore suits stateless or dataset-driven handlers (the `data-copy` example), and the loop form suits closure state.
- Stimulus's single-native-listener-per-target design is an optimization a plain `enhance()` does not need; attaching N listeners to N elements is simpler, and delegation (one listener on a parent plus `event.target.closest(selector)`) is the alternative if later insertions must work without re-running.

### Gaps
- Unpoly's `up.on` delegation semantics and how compilers receive the element (documented as first argument) were not verified.
- Alpine's per-element handler binding (`x-on`) code was not read.

## What happens with zero matches, or an element that matches twice?

### Takeaway
Zero matches is a silent no-op everywhere (loops over empty sets). Double matching is handled idempotently by a per-element marker or a Set in Stimulus, Alpine and htmx. A bare `for ... querySelectorAll` loop plus `addEventListener` (vanillapod today) is not idempotent: calling `initX` twice attaches duplicate anonymous listeners.

### Cited Findings
- Stimulus: `ElementObserver` holds `private elements: Set<Element>`; `addElement` only notifies `if (!this.elements.has(element))` and `removeElement` only `if (this.elements.has(element))`, so overlapping records cannot cause duplicate matched/unmatched callbacks. `refresh()` computes `new Set(this.matchElementsInTree())` and reconciles. Version 3.2.2. — [element_observer.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/mutation-observers/element_observer.ts)
- Alpine: the walk begins with `if (el._x_marker) return`, and the marker `el._x_marker = markerDispenser++` is set after directives run unless the element is `_x_ignore`; `destroyTree` deletes it. Alpine warns, but does not block, if `start()` is called twice. Version 3.17.5. — [lifecycle.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/lifecycle.js)
- Alpine: elements that already have `_x_marker` are skipped in `onMutate`'s added-node handling. — [mutation.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/mutation.js)
- htmx: idempotence uses `initHash`, a hash of the element's non-empty attributes; if `nodeData.initHash !== hash` the node is de-initialized and re-initialized, otherwise it is skipped. Re-running `processNode` on unchanged markup does nothing; changed attributes trigger full re-init. `hx-on` handlers are not gated by `initHash` and are rebuilt every time (after `deInitOnHandlers`). Version 2.0.11. — [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js)
- Unpoly: whether a compiler is guaranteed to run once per element per insertion was not verified. Not cited.
- Vanillapod `initX` loops `root.querySelectorAll(selector)` and calls `addEventListener` with a fresh closure each time; no marker or dedupe was seen. — `/home/user/vanillapod/components/copy-button/copy-button.js`
- Vanillapod `enhance(NodeList)`: each element is treated independently; a duplicate in an array would be enhanced twice (not tested here; follows from the documented "applies the same props to each").

### Inferences
- Idempotence has three styles: identity set (Stimulus), expando marker (Alpine), content hash (htmx). For vanillapod the cheapest equivalents are a module-level `WeakSet` of enhanced elements or `{ signal }`-scoped listeners that can be aborted and re-added; a `WeakSet` avoids expandos on the DOM node and does not leak.
- An `enhance(list)` helper should decide explicitly whether duplicate entries or a second call re-applies props (it must, if it is also used to update props) — unlike the libraries above, which treat initialization as once-per-element.
- Empty list returning `[]` is consistent with the libraries' silent zero-match behavior and keeps `enhance(document.querySelectorAll(...))` safe.

### Gaps
- The Unpoly once-per-element guarantee and `{ batch: true }`/priority options were not verified.

## What lesson does this give for vanillapod's `initX(root, selector)` pattern?

### Takeaway
`initX(root, selector)` already sits in the same family as `htmx.process(root)` and Unpoly compilers: an explicit, re-runnable, root-scoped selector scan with per-element state. Passing a list through `enhance()` is the right tool for stateless/shared behavior; per-element state still needs a loop (as the docs already say). The gaps relative to the libraries are idempotence, teardown, and later-inserted content.

### Cited Findings
- Vanillapod already documents the split: lists share one listener and use `event.currentTarget`; when each element needs state, loop instead and call `enhance(element, ...)` inside, citing the components' `init*()` functions. — `/home/user/vanillapod/docs/enhancing-markup.md`
- Libraries that attach per-element state all pair it with a per-element guard (Set/marker/hash) and a teardown path: Stimulus [context.ts](https://raw.githubusercontent.com/hotwired/stimulus/main/src/core/context.ts), Alpine [lifecycle.js](https://raw.githubusercontent.com/alpinejs/alpine/main/packages/alpinejs/src/lifecycle.js), htmx [htmx.js](https://raw.githubusercontent.com/bigskysoftware/htmx/master/src/htmx.js), Unpoly [destructor docs summary](https://unpoly.com/up.destructor).

### Inferences
- Differences that matter: selector-based attachment (htmx, Unpoly compilers, vanillapod init) discovers elements and can be re-run on a fragment; observer-based (Stimulus, Alpine) discovers and initializes automatically and needs idempotence plus move/teardown logic (Alpine's move/wrap handling shows how subtle this is); controller-based (Stimulus) gives each element an instance so shared handlers know their element via `this`; list-based (`enhance`) has no discovery, so it is the lowest layer the others could call after finding elements.
- Suggested layering: keep `enhance(elements, props)` as the pure "apply to these" primitive; keep `initX(root, selector)` as the discovery layer; optionally add an opt-in guard (WeakSet) and a returned cleanup/`AbortSignal` to `initX` so repeated calls on re-rendered fragments do not duplicate listeners. No MutationObserver is needed unless auto-enhancement of arbitrary inserts is a goal. These are design suggestions derived from the sources above, not claims of any source.
- Naming/ergonomics: Stimulus and Unpoly make the handler's element explicit (`this.element`, first compiler argument per Unpoly docs, not verified); the list form relies on `event.currentTarget`, which is fine for events on the element itself but wrong if props include delegated or captured handlers (not tested).

### Gaps
- No empirical test of `enhance()` against these patterns was run; repo test `/home/user/vanillapod/tests/browser/elements.test.ts` exercises NodeList input but was not read in detail.
- Release notes for the four libraries were not read (docs/GitHub releases unreachable), so no claim is made about behavior changes across versions. Alpine 3.x, Stimulus 3.x and htmx 2.x behavior is as of the default-branch source read on 2026-11-28; htmx on `master` reporting 2.0.11 may lag a newer major version on another branch (not checked).
