# Collection-wrapper DOM libraries: batch props, listeners and children (jQuery, Cash, Umbrella JS, Zepto)

Versions read (all from GitHub default-branch source via raw.githubusercontent.com, read 2026-11-28): jQuery `main` package.json = 4.1.0 (a main-branch/pre-release number; I did not confirm it is a published release); Cash `master` = 8.1.5; Umbrella JS `master` = 3.3.4; Zepto `master` = 1.2.0. Source reads were summarized by a fetch tool, so short snippets are quoted but full functions were paraphrased.
Access limits: api.jquery.com, umbrellajs.com and zeptojs.com did not resolve in this session (network allowlist), so NO official doc pages were read. Everything below is from source code, not from documented guarantees. Where a claim is "documented behavior", it is a gap.

## 1. What does a batch operation return?

### Takeaway
All four libraries return the wrapper itself (a chainable array-like collection) from setters and listener methods, never a plain array. Getters read the first element only. jQuery's `appendTo`-style methods return a new collection containing the inserted nodes (originals plus clones).

### Cited Findings
- jQuery: `fn.on`, `fn.one` return the same jQuery set (`return on( this, types, selector, data, fn )`, using `elem.each(...)`); `off` also returns the set — [jQuery src/event.js (main, 4.1.0)](https://raw.githubusercontent.com/jquery/jquery/main/src/event.js)
- jQuery: `fn.each` is `return jQuery.each( this, callback )`; `pushStack` builds a new set via `jQuery.merge( this.constructor(), elems )` and sets `prevObject` — [jQuery src/core.js](https://raw.githubusercontent.com/jquery/jquery/main/src/core.js)
- jQuery: the `appendTo`/`prependTo`/`insertBefore`-family builds `ret` and returns `this.pushStack( ret )`, i.e. a new set of every inserted node (clones included), not the targets — [jQuery src/manipulation.js](https://raw.githubusercontent.com/jquery/jquery/main/src/manipulation.js)
- jQuery: `removeAttr` returns the jQuery object; `attr(name, null)` per-element returns undefined, `attr` setter goes through `access(this, jQuery.attr, name, value, arguments.length > 1)` — [jQuery src/attributes/attr.js](https://raw.githubusercontent.com/jquery/jquery/main/src/attributes/attr.js)
- Cash: `each` returns the array-like it was given; `fn.prop`/`css`/`data` setters return `this` (object form loops keys then `return this`); `on` returns `this` — [cash each.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/core/each.ts), [prop.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/attributes/prop.ts), [css.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/css/css.ts), [data.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/data/data.ts), [on.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/events/on.ts) (Cash 8.1.5)
- Cash: `attr(name, undefined)` returns the collection unchanged; `attr(name, null)` removes the attribute; object form returns the collection — [cash attr.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/attributes/attr.ts)
- Cash: `insertSelectors` ends with `return anchors` (the original collection) — [insert_selectors.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/manipulation/helpers/insert_selectors.ts)
- Umbrella: `append` returns `this.adjacent(...)`, which returns `this.each(...)`; `on`/`off` return `this.eacharg(...)` -> `this.each(...)`; `attr`/`data` return `this.pairs(...)`, whose setter path is `return this.each(...)` — [append.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/append/append.js), [adjacent.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/adjacent/adjacent.js), [eacharg.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/eacharg/eacharg.js), [pairs.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/pairs/pairs.js) (Umbrella 3.3.4; assumes `each` returns `this`, which was not read directly)
- Umbrella stores nodes in `this.nodes` (a real array) and exposes `length` via getter — [umbrella.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/umbrella.js)
- Zepto: `fn.each` returns `this`; `on/off/bind/unbind/one/delegate/undelegate/trigger` return the collection; insertion operators and `attr/prop/css/addClass` setters return `this` — [zepto.js](https://raw.githubusercontent.com/madrobby/zepto/master/src/zepto.js), [event.js](https://raw.githubusercontent.com/madrobby/zepto/master/src/event.js) (Zepto master, package.json 1.2.0 — [package.json](https://raw.githubusercontent.com/madrobby/zepto/master/package.json))
- Getters on all four read only the first element: Cash `prop` returns `this[0] && this[0][prop]`; Umbrella `pairs` getter returns `get(this.first(), name)` or `''` for an empty set — sources above.

### Inferences
- None of these libraries returns a plain `Array` of the elements for chaining; `enhance` returning a plain array differs from all four. Cash and Umbrella collections are array-like/iterable (Cash copies `Symbol.iterator` from `Array.prototype` per cash.ts); Umbrella has `.nodes` as a real array.
- jQuery's insertion-return difference (returning the inserted nodes, clones included, for `appendTo`) is the one place a library returns "what was created per element".

### Gaps
- No official API doc pages could be read (hosts blocked), so documented return types are unconfirmed beyond source.

## 2. Shared listeners: `this`, `target`, `currentTarget`, add/remove, namespaces, `once`

### Takeaway
All four attach one handler to every element and dispatch it with `this`/`currentTarget` = the element it was bound to (or the matched descendant when delegating); `target` is the native origin node. jQuery, Cash and Zepto support dotted event namespaces and `one`; Umbrella (per the files read) shows no namespaces, and its `off` needs the same original callback reference.

### Cited Findings
- jQuery dispatch: for each queued handler `event.currentTarget = matched.elem;` handlers run via `.apply( matched.elem, args )`, so `this === event.currentTarget`; `event.delegateTarget = this` is the bound element — [jQuery src/event.js](https://raw.githubusercontent.com/jquery/jquery/main/src/event.js) (main, 4.1.0)
- jQuery namespaces: `namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort()` and "There *must* be a type, no attaching namespace-only handlers" (guard in add) — same file.
- jQuery guid: each handler gets `handler.guid = jQuery.guid++` so `off(type, fn)` can match it — same file.
- jQuery `one`: `on()` with `one === 1` wraps the handler: `fn = function( event ){ jQuery().off( event ); return origFn.apply( this, arguments ); }` and reuses the original guid so `off` by the original function works. With multiple elements the wrapper removes only the firing element's handler (via `off(event)` on the event's currentTarget), as inferred from `jQuery().off( event )` — same file.
- jQuery attaches via `elem.each( function(){ jQuery.event.add( this, types, fn, data, selector ); } )`; `add` skips nodes failing `acceptData` (`if ( !acceptData( elem ) ) { return; }`) — same file.
- Cash `on`: default `thisArg = ele` (bound element); `currentTarget` is defined as a getter returning `thisArg`, `delegateTarget` returns the bound element; callback invoked as `callback.call(thisArg, event, event.___td)`; returning `false` calls `preventDefault()` and `stopPropagation()`; non-Element/Document/Window entries are skipped (`if (!isElement(ele) && !isDocument(ele) && !isWindow(ele)) return`) — [on.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/events/on.ts) (8.1.5)
- Cash namespaces: event name parsed into base + namespaces; on dispatch the event's namespace is checked with `hasNamespaces`; `off("click.myNs")` passes the namespaces to `removeEvent`; `off()` with no args calls `removeEvent(ele)` clearing all; `off(name, fn)` and `off(name, selector, fn)` supported; handler and wrapper both get `guid` — [on.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/events/on.ts), [off.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/events/off.ts)
- Cash `once`: internal `_one` flag makes `removeEvent` run with same element/name/namespaces/selector/wrapper after the callback — on.ts.
- Umbrella `on`: `node.addEventListener(event, callback)` for each node, where `callback = function(e){ return cb.apply(this, [e].concat(e.detail || [])) }`; registry kept on `node._e[event]` as `{callback, orig_callback, selector}` — [on.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/on/on.js) (3.3.4). `this` is the native `this` (bound element) for direct handlers; `event.currentTarget` and `target` are the native ones.
- Umbrella `off`: with no callback removes every registered listener for the event on each node; otherwise needs `ref.orig_callback === cb && ref.selector === sel` — [off.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/off/off.js)
- Umbrella: no namespace handling appears in `on.js` / `off.js`; I found no `once.js` at `src/plugins/once/once.js` (404), so `once` support in 3.3.4 is unconfirmed — [404 attempt](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/once/once.js)
- Umbrella `on` accepts several event names via `eacharg` (args split per node) — [eacharg.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/eacharg/eacharg.js)
- Zepto `on`: direct handlers run with `callback.apply(element, ...)` (`this` = bound element); `one` wraps the callback to `remove(...)` then apply; `off(event, selector, callback)` goes through `remove`, which matches by type, namespace, function and selector; handler returning `false` triggers `preventDefault` + `stopPropagation` — [zepto event.js](https://raw.githubusercontent.com/madrobby/zepto/master/src/event.js) (master/1.2.0)
- Zepto caveats noted from source: `off` does not pass `capture` to `remove`; `autoRemove` is a variable shared across the `each` loop, so `one` combined with delegation over multiple elements can reference the last element's wrapper — same file (reported by the fetch tool's reading; I did not independently re-verify line-by-line).

### Inferences
- The pattern `enhance` plans (one shared handler, discriminate via `event.currentTarget`) matches how all four dispatch for direct (undelegated) listeners: `currentTarget` (and `this` in jQuery/Zepto/Umbrella-direct) is the element the shared function was attached to.
- Umbrella overwrites `currentTarget` with `Object.defineProperty` only in the delegated path, restoring it afterwards (per on.js read), which indicates native `currentTarget` is otherwise untouched.
- jQuery's `one` on a multi-element set fires once per element, not once for the whole set (inference from wrapper calling `jQuery().off(event)`); not tested.

### Gaps
- Official docs wording on `this`/`target`/`currentTarget` (api.jquery.com/on, zeptojs.com, umbrellajs.com) not read.
- Cash `removeEvent` and Umbrella `args()`, `each` not read; Umbrella `once` unconfirmed.
- Zepto namespace parsing details (`parse` function) not read separately.

## 3. Appending a node or HTML to several targets: clone or move?

### Takeaway
Everyone clones for all but one target. jQuery and Cash give the original to one target (jQuery: the LAST; Cash: the FIRST) and deep-clone for the rest; Zepto clones for every target whenever the set has more than one element; Umbrella clones in-page nodes for every target, but moves detached nodes (so only the last target ends up holding it).

### Cited Findings
- jQuery `domManip`: `iNoClone = l - 1` (last index of the collection); for every target other than the last, `node = jQuery.clone( node, true, true )` (deep clone); content is built once into a fragment via `buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored )`; guarded by `if ( l )`, otherwise returns the collection untouched — [jQuery domManip.js](https://raw.githubusercontent.com/jquery/jquery/main/src/manipulation/domManip.js) (main, 4.1.0)
- jQuery `appendTo`-family: `for ( ; i <= last; i++ ) { elems = i === last ? this : this.clone( true ); jQuery( insert[ i ] )[ original ]( elems ); push.apply( ret, elems ); }` — last target gets originals, earlier ones deep clones with `clone(true)` — [jQuery manipulation.js](https://raw.githubusercontent.com/jquery/jquery/main/src/manipulation.js)
- jQuery `clone( true )` copies events (`cloneCopyEvent` -> `jQuery.event.add( dest, type, ... )`) and user data (`dataUser.set(...)`); script eval state preserved via `setGlobalEval` — [jQuery manipulation.js](https://raw.githubusercontent.com/jquery/jquery/main/src/manipulation.js)
- Cash `insertSelectors`: `insertElement( anchorFinal, !indexFinal ? targetFinal : targetFinal.cloneNode( true ), left, inside, !indexFinal )` — index 0 receives the original (moved), every other index gets `cloneNode(true)`; scripts evaluated only for the first (`evaluate = !indexFinal`) — [insert_selectors.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/manipulation/helpers/insert_selectors.ts), [insert_element.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/manipulation/helpers/insert_element.ts) (8.1.5). Reverse-loop flags change which index counts as "first". I read `insertBefore` (calls `insertSelectors(arguments, this, true, true)`) but did not read `append.ts` itself.
- Cash clone uses plain `cloneNode(true)`, so listeners attached with `addEventListener` are not copied (inference from the code, which has no event-copy step in these helpers).
- Umbrella `adjacent`: for each target a fresh fragment is built; strings are regenerated per target (`this.generate(part)`); nodes where `this.isInPage(n)` is true are cloned (`u(n).clone().first()`); otherwise `fragment.appendChild(n)` moves the same node — [adjacent.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/adjacent/adjacent.js) (3.3.4). A detached node passed to several targets therefore moves on each pass and ends in the last target (consequence of the code as read; not tested).
- Umbrella `clone` copies `_e` registered listeners to the clone (`mirror.events`) and `select`/`textarea` values, nothing for arbitrary JS data — [clone.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/clone/clone.js)
- Zepto: insertion operators set `copyByClone = this.length > 1` and use `cloneNode(true)` for each target when true; with one target the original is inserted — [zepto.js](https://raw.githubusercontent.com/madrobby/zepto/master/src/zepto.js) (master/1.2.0). The exact line was paraphrased by the fetch tool; Zepto's clone does not copy listeners (no event-copy step seen; unverified).

### Inferences
- jQuery's "last gets the original" and Cash's "first gets the original" differ, so a user holding a reference to the passed node sees it in different places. Silent cloning (with partial or no listener/data copying) is the shared pattern.
- `enhance` throwing a TypeError for a DOM-node child with a list avoids this ambiguity; none of the four libraries throws in that case.

### Gaps
- Official docs on the clone-vs-move behavior not read (jQuery's api page for `.append()` is known to discuss it but could not be fetched, so it is unconfirmed here).
- Cash `append.ts` and Zepto's insertion code not read in full.

## 4. Empty sets, null/undefined targets, invalid entries

### Takeaway
Falsy input yields an empty collection and methods silently do nothing; no library throws for an empty set or null. Invalid entries are mostly filtered at construction or skipped per method.

### Cited Findings
- jQuery init: `if ( !selector ) { return this; }` (empty object for `""`, null, undefined, false); a node with `nodeType` becomes a one-item set; other non-string objects go to `jQuery.makeArray( selector, this )`; functions run as ready-callbacks — [jQuery init.js](https://raw.githubusercontent.com/jquery/jquery/main/src/core/init.js)
- jQuery `domManip` on an empty set: skips all work, `return collection` — [domManip.js](https://raw.githubusercontent.com/jquery/jquery/main/src/manipulation/domManip.js)
- jQuery per-element guards: `event.add` returns early for nodes failing `acceptData`; `jQuery.attr` returns `undefined` for text/comment/attribute nodes (nodeType 3, 8, 2) — [event.js](https://raw.githubusercontent.com/jquery/jquery/main/src/event.js), [attr.js](https://raw.githubusercontent.com/jquery/jquery/main/src/attributes/attr.js)
- Cash constructor: `if ( !selector ) return;` leaves an empty collection (length 0); existing Cash returned as-is; a single node or window wrapped; strings -> id lookup / `parseHTML` / `find` — [cash.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/core/cash.ts). Cash event methods skip entries that are not Element/Document/Window ([on.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/events/on.ts)). `prop(falsy)` returns undefined ([prop.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/attributes/prop.ts)).
- Umbrella: `slice` returns `[]` for falsy, zero-length, string or function input, `[pseudo]` for a lone object, else `[].slice.call(pseudo.nodes || pseudo)`; a node with `nodeName` is wrapped first — [slice.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/slice/slice.js), [umbrella.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/umbrella.js). The excerpt shows no filtering of non-node entries inside an array.
- Umbrella getters on an empty set return `''` (`pairs`) — [pairs.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/pairs/pairs.js)
- Zepto init: falsy selector returns an empty collection; `compact()` strips `null`/`undefined` from arrays; a single object is wrapped as a one-item collection — [zepto.js](https://raw.githubusercontent.com/madrobby/zepto/master/src/zepto.js). `addClass` ignores empty input and elements without `className`.

### Inferences
- Umbrella and Cash do not validate that array entries are nodes at construction; failures would surface in the method that touches the entry (e.g. `node.addEventListener` on a string in Umbrella). Inference only; not tested.
- Silent no-op on empty/null is universal, so `enhance([], ...)` returning `[]` is consistent with them.

### Gaps
- No library behavior with a non-node array entry was tested at runtime.
- `jQuery.makeArray` filtering not read.

## 5. Applying attributes, dataset, class, properties, css: one object?

### Takeaway
Yes for most. jQuery, Cash, Umbrella and Zepto all accept an object of name/value pairs for `attr`, `css` (and `prop` in jQuery/Cash/Zepto), applied to every element; but each method handles one concern, so props are not a single mixed object like `enhance`'s. `data` differs: Cash/jQuery use internal storage plus `dataset` reads, Umbrella and Zepto write `data-*` attributes.

### Cited Findings
- jQuery `attr`: delegates to `access(...)` for multi-element/object handling (not shown in the excerpt); `null` removes the attribute, `false` removes it except `aria-*` which sets `"false"`; setter returns jQuery set — [attr.js](https://raw.githubusercontent.com/jquery/jquery/main/src/attributes/attr.js) (4.1.0 main)
- Cash `attr(obj)` calls `attr` per key, returns the collection; `prop(obj)` and `css(obj)` loop keys and call `this.prop/css(key, value)`; `data(obj)` loops keys calling `this.data` — [attr.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/attributes/attr.ts), [prop.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/attributes/prop.ts), [css.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/css/css.ts), [data.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/data/data.ts) (8.1.5). `prop` maps names through `propMap` (so aliases like `class` map to a real property); `data(name, undefined)` is a no-op returning `this`; `data()` reads keys from `this[0].dataset`; storage helpers `getData/setData` not read.
- Umbrella `pairs` normalizes `(name, value)` to `{name: value}`, then for every element and key sets `set(node, key, v)`; a value that is a function is called as `fn(node, i)` per element — [pairs.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/pairs/pairs.js). `attr` uses `setAttribute`, or `removeAttribute` when the value is falsy; `data` is `this.attr(name, value, true)`, i.e. `data-` prefixed attributes — [attr.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/attr/attr.js), [data.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/data/data.js) (3.3.4). (The function-value form is from a paraphrased source read, not a verbatim quote.)
- Zepto: `attr` accepts name/object, uses `setAttribute` (removes on `null`); `prop` uses `propMap` (`class` -> `className`); `data` converts camelCase to a `data-` attribute via `attr` and deserializes values; `css` adds `px` to unitless numbers except `cssNumber` properties and removes on null/undefined/empty; `addClass` skips already-present classes and works for SVG via a `className` helper — [zepto.js](https://raw.githubusercontent.com/madrobby/zepto/master/src/zepto.js) (1.2.0)

### Inferences
- Only Umbrella's `pairs` pattern (per-element function values) resembles per-element variation; `enhance` distinguishes elements through `event.currentTarget` instead, a different mechanism.
- No library offers a single "props object" mixing attributes, properties, style, dataset, class and listeners; users chain `attr().prop().css().on()`. `enhance`'s single object is a distinct design.

### Gaps
- jQuery `access()`, `addClass`, `css`, `data` source and doc pages not read; Cash `addClass`, `get_data/set_data` not read; Umbrella `addClass`/`css` not read.

## 6. Event delegation as an alternative

### Takeaway
All four support delegation by passing a selector to `on` (and `off`); handlers run with `this`/`currentTarget` set to the matching descendant, while `target` is the original node.

### Cited Findings
- jQuery: `jQuery.event.handlers` walks from `event.target` up to the bound element (`for ( ; cur !== this; cur = cur.parentNode || this )`), queues matching delegate handlers per element; delegates run first, then directly bound handlers (`handlers.slice( delegateCount )`); `currentTarget` = matched element, `delegateTarget` = bound element — [event.js](https://raw.githubusercontent.com/jquery/jquery/main/src/event.js)
- Cash: with a selector, walks from `event.target` up via `parentNode` to find a match; if the bound element is reached without a match the handler is not called; matched node becomes `thisArg` and `currentTarget`, bound element is `delegateTarget` — [on.ts](https://raw.githubusercontent.com/fabiospampinato/cash/master/src/events/on.ts)
- Umbrella: `on('click', 'a', fn)`: wrapper does `u(e.currentTarget).find(selector).each(...)`, checks `target.contains(e.target)`, temporarily overwrites `currentTarget` with the matched node (`overWriteCurrent`) and restores it, calls `cb2.apply(target, ...)` — [on.js](https://raw.githubusercontent.com/franciscop/umbrella/master/src/plugins/on/on.js)
- Zepto: delegation finds the match with `$(e.target).closest(selector, element)`, ignores a match equal to the container, and builds `evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})` with `callback.apply(match, ...)`; `delegate` / `undelegate` also exist — [event.js](https://raw.githubusercontent.com/madrobby/zepto/master/src/event.js)

### Inferences
- In delegation `currentTarget` is the matched descendant rather than the element carrying the listener, so a `currentTarget`-based design like `enhance` would see different semantics for delegated vs direct listeners. For direct listeners it matches the native meaning.

### Gaps
- Docs for delegation (api.jquery.com/on, etc.) not read; Umbrella delegation restricted to descendants of `currentTarget` per the code read.
