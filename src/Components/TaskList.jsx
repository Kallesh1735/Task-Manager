 // src/Components/TaskList.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

/* Helpers (same as App) */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function dueStatus(dateStr) {
  const due = parseDate(dateStr);
  if (!due) return "none";
  const today = startOfToday();
  if (due.getTime() < today.getTime()) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "upcoming";
}
function friendly(dateStr) {
  if (!dateStr) return "No due date";
  return new Date(dateStr + "T00:00:00").toLocaleDateString();
}

/* Single row component */
function TaskItem({
  task,
  isEditing,
  draft,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDraftChange,
  onToggleComplete,
  onDelete,
}) {
  const itemVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
  };

  const status = dueStatus(task?.dueDate);
  const badgeText =
    status === "overdue"
      ? "Overdue"
      : status === "today"
      ? "Due Today"
      : status === "upcoming"
      ? "Upcoming"
      : "No date";

  if (isEditing && draft) {
    return (
      <motion.li initial="initial" animate="animate" exit="exit" variants={itemVariants} className="editing" style={{ listStyle: "none" }}>
        <div>
          <input type="text" value={draft.text} onChange={(e) => onDraftChange("text", e.target.value)} />
          <div className="task-form-controls" style={{ marginTop: 8 }}>
            <select value={draft.priority} onChange={(e) => onDraftChange("priority", e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select value={draft.category} onChange={(e) => onDraftChange("category", e.target.value)}>
              <option value="general">General</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>

            <input type="date" value={draft.dueDate || ""} onChange={(e) => onDraftChange("dueDate", e.target.value)} />
          </div>
        </div>

        <div className="actions">
          <motion.button whileTap={{ scale: 0.97 }} className="btn" onClick={onSaveEdit}>Save</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} className="btn btn-danger" onClick={onCancelEdit}>Cancel</motion.button>
        </div>
      </motion.li>
    );
  }

  return (
    <motion.li initial="initial" animate="animate" exit="exit" variants={itemVariants} className={`${task?.completed ? "done" : ""} ${status !== "none" ? `status-${status}` : ""}`} style={{ listStyle: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <strong>{task?.text}</strong>
          <span className="meta"> ({task?.priority}, {task?.category}) · Due: {friendly(task?.dueDate)}</span>{" "}
          <span className={`due-badge ${status}`}>{badgeText}</span>
        </div>

        <div className="actions">
          <motion.button whileTap={{ scale: 0.97 }} className="btn" onClick={() => onToggleComplete(task.id, task.completed)}>
            {task?.completed ? "Undo" : "Complete"}
          </motion.button>

          <motion.button whileTap={{ scale: 0.97 }} className="btn" onClick={() => onStartEdit(task)}>Edit</motion.button>

          <motion.button whileTap={{ scale: 0.97 }} className="btn btn-danger" onClick={() => onDelete(task.id)}>Delete</motion.button>
        </div>
      </div>
    </motion.li>
  );
}

/* Parent list (plain ul) */
export default function TaskList({
  tasks = [],
  onToggleComplete = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const startEdit = (task) => {
    if (!task) return;
    setEditingId(task.id);
    setDraft({ ...task });
  };

  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const saveEdit = () => {
    if (!draft) return;
    if (typeof onEdit === "function") onEdit(draft.id, { ...draft });
    cancelEdit();
  };

  const onDraftChange = (field, value) => setDraft((p) => ({ ...p, [field]: value }));

  if (!Array.isArray(tasks)) return null;

  return (
    <ul className="task-list" style={{ padding: 4, margin: 0 }}>
      {tasks.length === 0 ? null : tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={task.id === editingId}
          draft={draft}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onDraftChange={onDraftChange}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}