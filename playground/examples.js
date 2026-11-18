export const examples = {
  "Hello, world": `import { render, h1, p } from "vanillapod";

render(
  [
    h1("Hello, vanillapod!"),
    p("Edit the code on the left and watch this change."),
  ],
  document.querySelector("#app"),
);
`,
  "Counter (createStore + bind)": `import { bind, button, createStore, p, render } from "vanillapod";

const state = createStore({ count: 0 });

const output = p();
// bind runs now, and again only when state.count is written
bind(state, "count", (count) => {
  output.textContent = \`Count: \${count}\`;
});

render(
  [
    output,
    button({ onClick: () => state.count++ }, "Increment"),
    button({ onClick: () => state.count-- }, "Decrement"),
    button({ onClick: () => (state.count = 0) }, "Reset"),
  ],
  document.querySelector("#app"),
);
`,
  "List (bindList)": `import {
  bind,
  bindList,
  button,
  createStore,
  form,
  input,
  li,
  p,
  render,
  ul,
} from "vanillapod";

const state = createStore({ items: [{ id: 1, text: "Try vanillapod" }] });
let nextId = 2;

const list = ul();
bindList(state, "items", {
  parent: list,
  key: (item) => item.id,
  render: (item) =>
    li(
      item.text + " ",
      button({
        onClick: () => {
          state.items = state.items.filter((i) => i.id !== item.id);
        },
      }, "Remove"),
    ),
});

const count = p();
bind(state, "items", (items) => {
  count.textContent = \`\${items.length} item(s)\`;
});

const field = input({ placeholder: "New item", required: true });
const add = form(
  {
    onSubmit(event) {
      event.preventDefault();
      // assign a new array: bind() re-runs when the "items" key is written
      state.items = [...state.items, { id: nextId++, text: field.value }];
      field.value = "";
    },
  },
  field,
  button({ type: "submit" }, "Add"),
);

render([add, count, list], document.querySelector("#app"));
`,
  "Console output": `import { render, button } from "vanillapod";

render(
  [
    button({
      onClick: (event) => console.log("clicked", event.type, Date.now()),
    }, "Log a click"),
  ],
  document.querySelector("#app"),
);

console.warn("console.warn and errors show up below the preview");
`,
};

export const defaultExample = "Counter (createStore + bind)";
