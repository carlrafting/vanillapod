import {
  button,
  div,
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

const storageKey = "vanillapod-example-tasks";
const filters = ["all", "active", "completed"];
let selectedFilter = "all";
let tasks = loadTasks();

const app = document.querySelector("#app");
const taskInput = input({
  id: "task-input",
  name: "task",
  type: "text",
  maxlength: 120,
  placeholder: "e.g. Water the plants",
  autocomplete: "off",
}).firstElementChild;
taskInput.setAttribute("required", "");
taskInput.setAttribute("aria-describedby", "task-hint");

const taskList = div({ className: "task-list-region" }).firstElementChild;
const taskCount =
  span({ className: "task-count" }, "0 tasks").firstElementChild;
const feedback = p({ className: "feedback", role: "status" }).firstElementChild;
const filterButtons = new Map();

const filterNav = div({ className: "filters" }).firstElementChild;
filterNav.setAttribute("role", "group");
filterNav.setAttribute("aria-label", "Filter tasks");

for (const filter of filters) {
  const filterFragment = button(
    { className: "filter-button", type: "button" },
    filter[0].toUpperCase() + filter.slice(1),
  );
  const filterButton = filterFragment.firstElementChild;
  filterButton.dataset.filter = filter;
  filterButton.setAttribute("aria-pressed", String(filter === selectedFilter));
  filterButtons.set(filter, filterButton);
  filterNav.append(filterButton);
}

const clearCompletedFragment = button(
  { className: "clear-button", type: "button" },
  "Clear completed",
);
const clearCompletedButton = clearCompletedFragment.firstElementChild;

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
).firstElementChild;

const taskCard = section({ className: "task-card" }).firstElementChild;
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

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });
  taskInput.value = "";
  feedback.textContent = "";
  persistAndRender();
  taskInput.focus();
});

app.addEventListener("change", (event) => {
  if (!event.target.matches(".task-toggle")) return;
  const taskItem = event.target.closest("[data-task-id]");
  const task = tasks.find(({ id }) => id === taskItem.dataset.taskId);
  if (!task) return;

  task.completed = event.target.checked;
  persistAndRender();
});

app.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button");
  if (!actionButton) return;

  if (actionButton.matches(".filter-button")) {
    selectedFilter = actionButton.dataset.filter;
    renderTasks();
    return;
  }

  if (actionButton.matches(".delete-button")) {
    const taskItem = actionButton.closest("[data-task-id]");
    tasks = tasks.filter(({ id }) => id !== taskItem.dataset.taskId);
    persistAndRender();
    return;
  }

  if (actionButton.matches(".clear-button")) {
    tasks = tasks.filter(({ completed }) => !completed);
    persistAndRender();
  }
});

renderTasks();

function loadTasks() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new TypeError("Saved task data must be an array.");
    }

    const validTasks = parsed.filter((task) =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      typeof task.completed === "boolean"
    );
    if (validTasks.length !== parsed.length) {
      console.warn("Some saved tasks were invalid and have been skipped.");
    }
    return validTasks;
  } catch (error) {
    console.error("Could not load saved tasks.", error);
    return [];
  }
}

function persistAndRender() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    feedback.textContent = "";
  } catch (error) {
    console.error("Could not save tasks on this device.", error);
    feedback.textContent = "Your changes could not be saved on this device.";
  }
  renderTasks();
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (selectedFilter === "active") return !task.completed;
    if (selectedFilter === "completed") return task.completed;
    return true;
  });

  for (const [filter, filterButton] of filterButtons) {
    filterButton.setAttribute(
      "aria-pressed",
      String(filter === selectedFilter),
    );
  }

  if (visibleTasks.length === 0) {
    const message = selectedFilter === "completed"
      ? "Completed tasks will show up here."
      : selectedFilter === "active"
      ? "You’re all caught up."
      : "Nothing on your list yet. Add one small thing to begin.";
    taskList.replaceChildren(p({ className: "empty-state" }, message));
  } else {
    const list = ul({ className: "task-list" }).firstElementChild;
    for (const task of visibleTasks) {
      list.append(createTaskItem(task));
    }
    taskList.replaceChildren(list);
  }

  const remaining = tasks.filter(({ completed }) => !completed).length;
  taskCount.textContent = `${remaining} ${
    remaining === 1 ? "task" : "tasks"
  } left`;
  clearCompletedButton.disabled = !tasks.some(({ completed }) => completed);
}

function createTaskItem(task) {
  const item = li({
    className: task.completed ? "task-item is-complete" : "task-item",
  }).firstElementChild;
  item.dataset.taskId = task.id;

  const toggle = input({
    className: "task-toggle",
    type: "checkbox",
    checked: task.completed,
  }).firstElementChild;
  toggle.setAttribute("aria-label", `Toggle completion for "${task.title}"`);

  const title = span({ className: "task-title" }, task.title).firstElementChild;
  const remove = button(
    { className: "delete-button", type: "button" },
    "Delete",
  ).firstElementChild;
  remove.setAttribute("aria-label", `Delete "${task.title}"`);

  item.append(toggle, title, remove);
  return item;
}
