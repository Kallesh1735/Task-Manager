 // src/Components/Toolbar.jsx
import { useEffect, useState, useMemo } from "react";
import { motion as Motion } from "framer-motion";

export default function Toolbar({
  onChange = () => {},
  categories = [],
  controls = null, // optional: initial/synced controls from parent
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("createdDesc");

  // when parent provides controls (e.g. from localStorage) keep local inputs in sync
  useEffect(() => {
    if (!controls) return;
    // Only update if values actually differ to avoid unnecessary re-renders
    if (controls.query !== undefined && controls.query !== query) setQuery(controls.query);
    if (controls.status !== undefined && controls.status !== status) setStatus(controls.status);
    if (controls.category !== undefined && controls.category !== category) setCategory(controls.category);
    if (controls.sort !== undefined && controls.sort !== sort) setSort(controls.sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  // lift changes up (debounce not included here — easy to add later)
  useEffect(() => {
    try {
      onChange({ query, status, category, sort });
    } catch (e) {
      // defensive: ensure toolbar can't crash parent if onChange is weird
      // (silently ignore — parent should pass a stable setter)
      // console.warn("Toolbar.onChange failed", e);
    }
  }, [query, status, category, sort, onChange]);

  // dedupe categories and keep stable order
  const uniqCategories = useMemo(() => Array.from(new Set(categories || [])), [categories]);

  const control = { whileHover: { y: -3 }, whileTap: { scale: 0.99 } };

  return (
    <div className="toolbar">
      <Motion.input
        {...control}
        className="toolbar-input"
        type="text"
        placeholder="Search tasks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Motion.select
        {...control}
        className="toolbar-select"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="done">Completed</option>
        <option value="today">Due Today</option>
        <option value="upcoming">Upcoming</option>
        <option value="overdue">Overdue</option>
      </Motion.select>

      <Motion.select
        {...control}
        className="toolbar-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        {uniqCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Motion.select>

      <Motion.select
        {...control}
        className="toolbar-select"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="createdDesc">Newest first</option>
        <option value="createdAsc">Oldest first</option>
        <option value="dueAsc">Due date ↑</option>
        <option value="dueDesc">Due date ↓</option>
        <option value="priority">Priority (High→Low)</option>
      </Motion.select>
    </div>
  );
}