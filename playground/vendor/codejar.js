// src/codejar.ts
function CodeJar(editor, highlight, opt = {}) {
	const options = {
		tab: "	",
		indentOn: /[({[]$/,
		moveToNewLine: /^[)}\]]/,
		spellcheck: false,
		catchTab: true,
		preserveIdent: true,
		addClosing: true,
		history: true,
		window: globalThis.window,
		autoclose: {
			open: `([{'"`,
			close: `)]}'"`
		},
		...opt
	};
	const window = options.window;
	const document = window.document;
	const listeners = [];
	const timeouts = /* @__PURE__ */ new Set();
	const history = [];
	let at = -1;
	let focus = editor.getRootNode().activeElement === editor;
	let onUpdate = () => void 0;
	let prev;
	let sentinel = false;
	editor.setAttribute("contenteditable", "plaintext-only");
	editor.setAttribute("spellcheck", options.spellcheck ? "true" : "false");
	editor.style.outline = "none";
	editor.style.overflowWrap = "break-word";
	editor.style.overflowY = "auto";
	editor.style.whiteSpace = "pre-wrap";
	const doHighlight = (editor, pos) => {
		highlight(editor, pos);
	};
	const matchFirefoxVersion = window.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
	const firefoxVersion = matchFirefoxVersion ? parseInt(matchFirefoxVersion[1]) : 0;
	let isLegacy = false;
	if (editor.contentEditable !== "plaintext-only" || firefoxVersion >= 136) isLegacy = true;
	if (isLegacy) editor.setAttribute("contenteditable", "true");
	const debounceHighlight = debounce(() => {
		const pos = save();
		doHighlight(editor, pos);
		restore(pos);
	}, 30);
	let recording = false;
	const shouldRecord = (event) => {
		return !isUndo(event) && !isRedo(event) && event.key !== "Meta" && event.key !== "Control" && event.key !== "Alt" && !event.key.startsWith("Arrow");
	};
	const debounceRecordHistory = debounce((event) => {
		if (shouldRecord(event)) {
			recordHistory();
			recording = false;
		}
	}, 300);
	const on = (type, fn) => {
		listeners.push([type, fn]);
		editor.addEventListener(type, fn);
	};
	on("keydown", (event) => {
		if (event.defaultPrevented) return;
		prev = toString();
		if (options.preserveIdent) handleNewLine(event);
		else legacyNewLineFix(event);
		if (options.catchTab) handleTabCharacters(event);
		if (options.addClosing) handleSelfClosingCharacters(event);
		if (options.history) {
			handleUndoRedo(event);
			if (shouldRecord(event) && !recording) {
				recordHistory();
				recording = true;
			}
		}
		if (isLegacy && !isCopy(event)) restore(save());
	});
	on("keyup", (event) => {
		if (event.defaultPrevented) return;
		if (event.isComposing) return;
		if (sentinel) removeSentinel();
		if (prev !== toString()) debounceHighlight();
		debounceRecordHistory(event);
		onUpdate(toString());
	});
	on("focus", (_event) => {
		focus = true;
	});
	on("blur", (_event) => {
		focus = false;
	});
	on("paste", (event) => {
		recordHistory();
		handlePaste(event);
		recordHistory();
		onUpdate(toString());
	});
	on("cut", (event) => {
		recordHistory();
		handleCut(event);
		recordHistory();
		onUpdate(toString());
	});
	function save() {
		const { anchorNode, anchorOffset, focusNode, focusOffset } = getSelection();
		if (!anchorNode || !focusNode) throw "error1";
		const start = textOffset(anchorNode, anchorOffset);
		const end = textOffset(focusNode, focusOffset);
		return {
			start,
			end,
			dir: start <= end ? "->" : "<-"
		};
	}
	function textOffset(node, offset) {
		if (!editor.contains(node)) return editor.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING ? toString().length : 0;
		const range = document.createRange();
		range.selectNodeContents(editor);
		range.setEnd(node, offset);
		return range.toString().length;
	}
	function restore(position) {
		const pos = { ...position };
		const s = getSelection();
		let startNode, startOffset = 0;
		let endNode, endOffset = 0;
		if (!pos.dir) pos.dir = "->";
		if (pos.start < 0) pos.start = 0;
		if (pos.end < 0) pos.end = 0;
		if (pos.dir == "<-") {
			const { start, end } = pos;
			pos.start = end;
			pos.end = start;
		}
		let current = 0;
		visit(editor, (el) => {
			if (el.nodeType !== Node.TEXT_NODE) return;
			const len = (el.nodeValue || "").length;
			if (current + len > pos.start) {
				if (!startNode) {
					startNode = el;
					startOffset = pos.start - current;
				}
				if (current + len > pos.end) {
					endNode = el;
					endOffset = pos.end - current;
					return "stop";
				}
			}
			current += len;
		});
		if (!startNode) {
			startNode = editor;
			startOffset = editor.childNodes.length;
		}
		if (!endNode) {
			endNode = editor;
			endOffset = editor.childNodes.length;
		}
		if (pos.dir == "<-") [startNode, startOffset, endNode, endOffset] = [
			endNode,
			endOffset,
			startNode,
			startOffset
		];
		{
			const startEl = uneditable(startNode);
			if (startEl) {
				const node = document.createTextNode("");
				startEl.parentNode?.insertBefore(node, startEl);
				startNode = node;
				startOffset = 0;
			}
			const endEl = uneditable(endNode);
			if (endEl) {
				const node = document.createTextNode("");
				endEl.parentNode?.insertBefore(node, endEl);
				endNode = node;
				endOffset = 0;
			}
		}
		s.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
		editor.normalize();
	}
	function uneditable(node) {
		while (node && node !== editor) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const el = node;
				if (el.getAttribute("contenteditable") == "false") return el;
			}
			node = node.parentNode;
		}
	}
	function beforeCursor() {
		const r0 = getSelection().getRangeAt(0);
		const r = document.createRange();
		r.selectNodeContents(editor);
		r.setEnd(r0.startContainer, r0.startOffset);
		return r.toString();
	}
	function afterCursor() {
		const r0 = getSelection().getRangeAt(0);
		const r = document.createRange();
		r.selectNodeContents(editor);
		r.setStart(r0.endContainer, r0.endOffset);
		return r.toString();
	}
	function handleNewLine(event) {
		if (event.key === "Enter") {
			const before = beforeCursor();
			const after = afterCursor();
			let [padding] = findPadding(before);
			let newLinePadding = padding;
			if (options.indentOn.test(before)) newLinePadding += options.tab;
			if (newLinePadding.length > 0) {
				preventDefault(event);
				event.stopPropagation();
				insert("\n" + newLinePadding);
			} else legacyNewLineFix(event);
			if (newLinePadding !== padding && options.moveToNewLine.test(after)) {
				const pos = save();
				insert("\n" + padding);
				restore(pos);
			}
		}
	}
	function legacyNewLineFix(event) {
		if (isLegacy && event.key === "Enter") {
			preventDefault(event);
			event.stopPropagation();
			if (afterCursor() == "") {
				insert("\n\n");
				const pos = save();
				pos.start = --pos.end;
				restore(pos);
				sentinel = true;
			} else insert("\n");
		}
	}
	function removeSentinel() {
		const code = toString();
		if (!code.endsWith("\n")) {
			sentinel = false;
			return;
		}
		if (!getSelection().isCollapsed) return;
		const pos = save();
		if (pos.start !== code.length - 1 || code[code.length - 2] === "\n") return;
		restore({
			start: code.length - 1,
			end: code.length
		});
		document.execCommand("delete");
		restore(pos);
		sentinel = false;
	}
	function handleSelfClosingCharacters(event) {
		const open = options.autoclose.open;
		const close = options.autoclose.close;
		if (event.metaKey || event.ctrlKey && !event.altKey) return;
		if (event.key.length === 1 && open.includes(event.key)) {
			preventDefault(event);
			const pos = save();
			const wrapText = pos.start == pos.end ? "" : getSelection().toString();
			insert(event.key + wrapText + (close[open.indexOf(event.key)] ?? ""));
			pos.start++;
			pos.end++;
			restore(pos);
		}
	}
	function handleTabCharacters(event) {
		if (event.key !== "Tab") return;
		preventDefault(event);
		if (event.shiftKey) indentLines(false);
		else if (getSelection().toString().includes("\n")) indentLines(true);
		else insert(options.tab);
	}
	function indentLines(indent) {
		const code = toString();
		const pos = save();
		const from = Math.min(pos.start, pos.end);
		let to = Math.max(pos.start, pos.end);
		if (to > from && code[to - 1] === "\n") to--;
		const blockStart = code.lastIndexOf("\n", from - 1) + 1;
		let blockEnd = code.indexOf("\n", to);
		if (blockEnd < 0) blockEnd = code.length;
		const lines = code.slice(blockStart, blockEnd).split("\n");
		const deltas = lines.map((line) => indent ? options.tab.length : -Math.min(options.tab.length, /^[ \t]*/.exec(line)[0].length));
		if (deltas.every((d) => d === 0)) return;
		const block = lines.map((line, i) => indent ? options.tab + line : line.slice(-deltas[i])).join("\n");
		const move = (p) => {
			let lineStart = blockStart;
			let shift = 0;
			for (let i = 0; i < lines.length; i++) {
				const lineEnd = lineStart + lines[i].length;
				if (p <= lineEnd) {
					const column = p - lineStart;
					if (indent) return p + shift + (column > 0 ? deltas[i] : 0);
					return p + shift - Math.min(column, -deltas[i]);
				}
				shift += deltas[i];
				lineStart = lineEnd + 1;
			}
			return p + shift;
		};
		restore({
			start: blockStart,
			end: blockEnd
		});
		insert(block);
		restore({
			start: move(pos.start),
			end: move(pos.end),
			dir: pos.dir
		});
	}
	function handleUndoRedo(event) {
		if (isUndo(event)) {
			preventDefault(event);
			if (recording) {
				recordHistory();
				recording = false;
			}
			at--;
			const record = history[at];
			if (record) {
				editor.innerHTML = record.html;
				restore(record.pos);
			}
			if (at < 0) at = 0;
		}
		if (isRedo(event)) {
			preventDefault(event);
			at++;
			const record = history[at];
			if (record) {
				editor.innerHTML = record.html;
				restore(record.pos);
			}
			if (at >= history.length) at--;
		}
	}
	function recordHistory() {
		if (!focus) return;
		const html = editor.innerHTML;
		const pos = save();
		const lastRecord = history[at];
		if (lastRecord) {
			if (lastRecord.html === html && lastRecord.pos.start === pos.start && lastRecord.pos.end === pos.end) return;
		}
		at++;
		history[at] = {
			html,
			pos
		};
		history.splice(at + 1);
		const maxHistory = 300;
		if (at > maxHistory) {
			at = maxHistory;
			history.splice(0, 1);
		}
	}
	function handlePaste(event) {
		if (event.defaultPrevented) return;
		preventDefault(event);
		const text = (event.originalEvent ?? event).clipboardData.getData("text/plain").replace(/\r\n?/g, "\n");
		const pos = save();
		insert(text);
		doHighlight(editor);
		restore({
			start: Math.min(pos.start, pos.end) + text.length,
			end: Math.min(pos.start, pos.end) + text.length,
			dir: "<-"
		});
	}
	function handleCut(event) {
		if (event.defaultPrevented) return;
		const selection = getSelection();
		if (selection.isCollapsed) return;
		const pos = save();
		(event.originalEvent ?? event).clipboardData.setData("text/plain", selection.toString());
		document.execCommand("delete");
		doHighlight(editor);
		restore({
			start: Math.min(pos.start, pos.end),
			end: Math.min(pos.start, pos.end),
			dir: "<-"
		});
		preventDefault(event);
	}
	function visit(editor, visitor) {
		const queue = [];
		if (editor.firstChild) queue.push(editor.firstChild);
		let el = queue.pop();
		while (el) {
			if (visitor(el) === "stop") break;
			if (el.nextSibling) queue.push(el.nextSibling);
			if (el.firstChild) queue.push(el.firstChild);
			el = queue.pop();
		}
	}
	function isCtrl(event) {
		return event.metaKey || event.ctrlKey;
	}
	function isUndo(event) {
		return isCtrl(event) && !event.shiftKey && getKeyCode(event) === "Z";
	}
	function isRedo(event) {
		return isCtrl(event) && event.shiftKey && getKeyCode(event) === "Z";
	}
	function isCopy(event) {
		return isCtrl(event) && getKeyCode(event) === "C";
	}
	function getKeyCode(event) {
		let key = event.key || event.keyCode || event.which;
		if (!key) return void 0;
		return (typeof key === "string" ? key : String.fromCharCode(key)).toUpperCase();
	}
	function insert(text) {
		text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
		document.execCommand("insertHTML", false, text);
	}
	function debounce(cb, wait) {
		let timeout = 0;
		return (...args) => {
			window.clearTimeout(timeout);
			timeouts.delete(timeout);
			timeout = window.setTimeout(() => {
				timeouts.delete(timeout);
				cb(...args);
			}, wait);
			timeouts.add(timeout);
		};
	}
	function findPadding(text) {
		let i = text.length - 1;
		while (i >= 0 && text[i] !== "\n") i--;
		i++;
		let j = i;
		while (j < text.length && /[ \t]/.test(text[j])) j++;
		return [
			text.substring(i, j) || "",
			i,
			j
		];
	}
	function toString() {
		return editor.textContent || "";
	}
	function preventDefault(event) {
		event.preventDefault();
	}
	function getSelection() {
		return editor.getRootNode().getSelection();
	}
	return {
		updateOptions(newOptions) {
			Object.assign(options, newOptions);
			editor.setAttribute("spellcheck", options.spellcheck ? "true" : "false");
		},
		updateCode(code, callOnUpdate = true) {
			editor.textContent = code;
			doHighlight(editor);
			if (callOnUpdate) onUpdate(code);
		},
		onUpdate(callback) {
			onUpdate = callback;
		},
		toString,
		save,
		restore,
		recordHistory,
		destroy() {
			for (let [type, fn] of listeners) editor.removeEventListener(type, fn);
			for (const timeout of timeouts) window.clearTimeout(timeout);
			timeouts.clear();
		}
	};
}
export { CodeJar };

//# sourceMappingURL=codejar.js.map