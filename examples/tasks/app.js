import {
  button,
  div,
  effect,
  form,
  h1,
  header,
  input,
  label,
  li,
  main,
  p,
  render,
  section,
  span,
  ul,
} from "../../dom/main.js";
import { store, untracked } from "../../state/main.js";

const storageKey = "vanillapod-example-tasks";
const filters = ["all", "active", "completed"];
const state = store({ tasks: loadTasks(), filter: "all" });

const app = document.querySelector("#app");
const taskInput = input({
  id: "task-input",
  name: "task",
  type: "text",
  maxLength: 120,
  placeholder: "e.g. Water the plants",
  autocomplete: "off",
});
taskInput.setAttribute("required", "");
taskInput.setAttribute("aria-describedby", "task-hint");

const list = ul({ className: "task-list" });
const emptyState = p({ className: "empty-state" });
const taskList = div({ className: "task-list-region" }, list, emptyState);
const taskCount = span({ className: "task-count" }, "0 tasks");
const feedback = p({ className: "feedback", role: "status" });
const filterButtons = new Map();

const filterNav = div({ className: "filters" });
filterNav.setAttribute("role", "group");
filterNav.setAttribute("aria-label", "Filter tasks");

for (const filter of filters) {
  const filterButton = button(
    { className: "filter-button", type: "button" },
    filter[0].toUpperCase() + filter.slice(1),
  );
  filterButton.dataset.filter = filter;
  filterButton.addEventListener("click", () => {
    state.filter = filter;
  });
  filterButtons.set(filter, filterButton);
  filterNav.append(filterButton);
}

const clearCompletedButton = button(
  { className: "clear-button", type: "button" },
  "Clear completed",
);
clearCompletedButton.addEventListener("click", () => {
  state.tasks = state.tasks.filter(({ completed }) => !completed);
  persist();
});

const taskForm = form(
  { className: "task-form" },
  label({ htmlFor: "task-input" }, "What needs doing?"),
  div(
    { className: "form-row" },
    taskInput,
    button({ className: "add-button", type: "submit" }, "Add task"),
  ),
  p(
    { className: "hint", id: "task-hint" },
    "Keep it small. You can always add another.",
  ),
);

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }

  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });
  taskInput.value = "";
  feedback.textContent = "";
  persist();
  taskInput.focus();
});

const taskCard = section({ className: "task-card" });
taskCard.setAttribute("aria-label", "Your tasks");
taskCard.append(
  taskForm,
  feedback,
  div(
    { className: "list-toolbar" },
    filterNav,
    clearCompletedButton,
  ),
  taskList,
  div(
    { className: "list-footer" },
    taskCount,
    p({ className: "local-note" }, "Saved on this device"),
  ),
);

const appContent = main(
  { className: "app-shell" },
  header(
    { className: "app-header" },
    p({ className: "eyebrow" }, "A little space for your day"),
    h1({}, "Little Things"),
    p(
      { className: "intro" },
      "A simple list for the next thing on your mind.",
    ),
  ),
  taskCard,
  p(
    { className: "made-with" },
    "A browser-native UI experiment from ",
    span({ className: "brand-name" }, "Vanillapod"),
  ),
);

render([appContent], app);

effect(() => {
  const current = state.filter;
  for (const [filter, filterButton] of filterButtons) {
    filterButton.setAttribute("aria-pressed", String(filter === current));
  }
});

effect(refreshSummary);

// Re-renders the items only when tasks are added, removed or replaced: toggling
// a task changes one item's own effect, so the other items are left alone.
effect(() => {
  const tasks = state.tasks;
  void tasks.length;
  /** @type {(() => void)[]} */
  const cleanups = [];
  const items = untracked(() =>
    tasks.map((task) =>
      createTaskItem(task, (cleanup) => cleanups.push(cleanup))
    )
  );
  list.replaceChildren(...items);
  return () => cleanups.forEach((cleanup) => cleanup());
});

function loadTasks() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new TypeError("Saved task data must be an array.");
    }

    const seenIds = new Set();
    const validTasks = parsed.filter((task) => {
      const valid = task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean" &&
        !seenIds.has(task.id);
      if (valid) seenIds.add(task.id);
      return valid;
    });
    if (validTasks.length !== parsed.length) {
      console.warn("Some saved tasks were invalid and have been skipped.");
    }
    return validTasks;
  } catch (error) {
    console.error("Could not load saved tasks.", error);
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state.tasks));
    feedback.textContent = "";
  } catch (error) {
    console.error("Could not save tasks on this device.", error);
    feedback.textContent = "Your changes could not be saved on this device.";
  }
}

function matchesFilter(task, filter) {
  if (filter === "active") return !task.completed;
  if (filter === "completed") return task.completed;
  return true;
}

function refreshSummary() {
  const { tasks, filter } = state;
  const visible = tasks.filter((task) => matchesFilter(task, filter)).length;
  const remaining = tasks.filter(({ completed }) => !completed).length;

  list.hidden = visible === 0;
  emptyState.hidden = visible !== 0;
  if (visible === 0) {
    emptyState.textContent = filter === "completed"
      ? "Completed tasks will show up here."
      : filter === "active"
      ? "You’re all caught up."
      : "Nothing on your list yet. Add one small thing to begin.";
  }

  taskCount.textContent = `${remaining} ${
    remaining === 1 ? "task" : "tasks"
  } left`;
  clearCompletedButton.disabled = !tasks.some(({ completed }) => completed);
}

function createTaskItem(task, onCleanup) {
  const item = li({ className: "task-item" });
  item.dataset.taskId = task.id;

  const toggle = input({
    className: "task-toggle",
    type: "checkbox",
  });
  toggle.setAttribute("aria-label", `Toggle completion for "${task.title}"`);

  const title = span({ className: "task-title" }, task.title);
  const remove = button(
    { className: "delete-button", type: "button" },
    "Delete",
  );
  remove.setAttribute("aria-label", `Delete "${task.title}"`);

  item.append(toggle, title, remove);

  onCleanup(effect(() => {
    const completed = task.completed;
    item.classList.toggle("is-complete", completed);
    toggle.checked = completed;
    item.hidden = !matchesFilter(task, state.filter);
  }));

  toggle.addEventListener("change", () => {
    task.completed = toggle.checked;
    persist();
  });
  remove.addEventListener("click", () => {
    const index = state.tasks.indexOf(task);
    if (index !== -1) state.tasks.splice(index, 1);
    persist();
  });

  return item;
}
