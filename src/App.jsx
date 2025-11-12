 // src/App.jsx
import React, { useEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import TaskForm from "./Components/TaskForm";
import Toolbar from "./Components/Toolbar";
import SkeletonProgress from "./Components/SkeletonProgress";
import SkeletonList from "./Components/SkeletonList";
import AnimatedNumber from "./Components/AnimatedNumber";
import ThemeToggle from "./Components/ThemeToggle";
import Toast from "./Components/Toast";
import StatsPanel from "./Components/StatsPanel";
import "./Style.css";

// Lazy components
const TaskList = lazy(() => import("./Components/TaskList"));
const ProgressTracker = lazy(() => import("./Components/ProgressTracker"));

// Helpers
function parseDate(d) {
  if (!d) return null;
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}
const priorityScore = { high: 3, medium: 2, low: 1 };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [controls, setControls] = useState(() => {
    try {
      const s = localStorage.getItem("controls");
      return s
        ? JSON.parse(s)
        : { query: "", status: "all", category: "all", sort: "createdDesc" };
    } catch {
      return { query: "", status: "all", category: "all", sort: "createdDesc" };
    }
  });

  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef(new Map());
  const newItemTimers = useRef(new Map());

  // Load tasks once and normalize
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tasks");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      let normalized = Array.isArray(parsed)
        ? parsed.map((t) => ({
            id: t.id ?? crypto.randomUUID(),
            text: t.text ?? "",
            priority: t.priority ?? "medium",
            category: t.category ?? "general",
            dueDate: t.dueDate ?? "",
            completed: !!t.completed,
            createdAt: t.createdAt ?? Date.now(),
            ...t,
          }))
        : [];
      setTasks(normalized);
      localStorage.setItem("tasks", JSON.stringify(normalized));
      console.log("Loaded tasks (normalized):", normalized);
    } catch (e) {
      console.error("Failed to parse saved tasks:", e);
      setTasks([]);
      localStorage.removeItem("tasks");
    }
  }, []);

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("controls", JSON.stringify(controls));
    } catch {}
  }, [controls]);

  // Toasts cleanup
  useEffect(() => {
    return () => {
      for (const t of toastTimers.current.values()) clearTimeout(t);
      toastTimers.current.clear();
      for (const t of newItemTimers.current.values()) clearTimeout(t);
      newItemTimers.current.clear();
    };
  }, []);

  // Toast helper
  const pushToast = (text) => {
    const id = crypto.randomUUID();
    setToasts((s) => [...s, { id, text }]);
    const t = setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
      toastTimers.current.delete(id);
    }, 2200);
    toastTimers.current.set(id, t);
  };

  // CRUD
  const addTask = (task) => {
    const id = task.id ?? crypto.randomUUID();
    const newTask = {
      id,
      text: task.text ?? "",
      priority: task.priority ?? "medium",
      category: task.category ?? "general",
      dueDate: task.dueDate ?? "",
      completed: !!task.completed,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    pushToast("Task added!");
  };
 // updateTaskById: update fields for task with matching id
const updateTaskById = (id, patch) => {
  setTasks((prev) => {
    const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
    console.log("updateTaskById -> id:", id, "patch:", patch, "prevLen:", prev.length, "-> nextLen:", next.length);
    return next;
  });
};

  const deleteTaskById = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    pushToast("Task deleted!");
  };

  const clearAll = () => {
    setTasks([]);
    pushToast("All tasks cleared!");
  };

  // 🔧 Fixed reorder logic
  // handleReorder receives array of ids (strings)
const handleReorder = (newOrderIds) => {
  console.log("onReorder called. newOrder ids:", newOrderIds);
  setTasks((prev) => {
    // if prev is empty or shapes mismatch, reconstruct
    const prevIds = prev.map((t) => t.id);
    // quick check: if arrays equal, do nothing
    if (prevIds.length === newOrderIds.length && prevIds.every((id, i) => id === newOrderIds[i])) {
      // nothing changed
      return prev;
    }

    const prevById = new Map(prev.map((t) => [t.id, t]));
    const movedIds = new Set(newOrderIds);

    // Reconstruct moved items from prev if possible
    const moved = newOrderIds.map((id) => prevById.get(id) ?? { id, text: "", priority: "medium", category: "general", dueDate: "", completed: false, createdAt: Date.now() });
    const remaining = prev.filter((t) => !movedIds.has(t.id));
    const merged = [...moved, ...remaining];
    console.log("handleReorder merged ids:", merged.map(m => m.id));
    return merged;
  });
};

  // Filtered visible list
  const visibleTasks = useMemo(() => {
    const q = (controls.query || "").trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statusCheck = (t) => {
      if (controls.status === "all") return true;
      if (controls.status === "active") return !t.completed;
      if (controls.status === "done") return !!t.completed;
      const due = parseDate(t.dueDate);
      if (!due) return false;
      const cmp = due.getTime() - today.getTime();
      if (controls.status === "today") return cmp === 0;
      if (controls.status === "upcoming") return cmp > 0;
      if (controls.status === "overdue") return cmp < 0;
      return true;
    };

    const categoryCheck = (t) =>
      controls.category === "all" ? true : t.category === controls.category;

    const searchCheck = (t) =>
      q === "" ? true : (t.text ?? "").toLowerCase().includes(q);

    let out = tasks.filter(
      (t) => statusCheck(t) && categoryCheck(t) && searchCheck(t)
    );

    switch (controls.sort) {
      case "createdAsc":
        out = out.slice().sort((a, b) => a.createdAt - b.createdAt);
        break;
      case "createdDesc":
        out = out.slice().sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "dueAsc":
        out = out
          .slice()
          .sort(
            (a, b) =>
              (parseDate(a.dueDate)?.getTime() ?? Infinity) -
              (parseDate(b.dueDate)?.getTime() ?? Infinity)
          );
        break;
      case "dueDesc":
        out = out
          .slice()
          .sort(
            (a, b) =>
              (parseDate(b.dueDate)?.getTime() ?? -Infinity) -
              (parseDate(a.dueDate)?.getTime() ?? -Infinity)
          );
        break;
      case "priority":
        out = out
          .slice()
          .sort(
            (a, b) =>
              (priorityScore[b.priority] ?? 0) -
              (priorityScore[a.priority] ?? 0)
          );
        break;
      default:
        break;
    }

    return out;
  }, [tasks, controls]);

  // debug: show what's happening in render
 


  const categories = useMemo(
    () =>
      Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))).sort(),
    [tasks]
  );
 console.log("RENDER DEBUG — tasks (len):", tasks.length, tasks.map(t => t.id));
console.log("RENDER DEBUG — visibleTasks (len):", visibleTasks.length, visibleTasks.map(t => t.id));
console.log("RENDER DEBUG — controls:", controls);
console.log("RENDER DEBUG — tasks (len):", tasks.length, tasks.map(t => ({ id: t.id, completed: t.completed })));
console.log("RENDER DEBUG — visibleTasks (len):", visibleTasks.length, visibleTasks.map(t => t.id));

  // Render
  return (
    <div className="app">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
  <div>
    <h1>Task Manager</h1>
    <p>Track your tasks efficiently</p>
  </div>
  <ThemeToggle />
</div>

{/* Progress tracker - only one place */}
<div className="card section">
  <Suspense fallback={<SkeletonProgress />}>
    <ProgressTracker tasks={tasks} />
  </Suspense>
</div>

{/* Stats row (separate card) */}
<div className="card section">
  <div className="stats-panel">
    <div className="stat-card">
      <div className="stat-label">Total Tasks</div>
      <div className="stat-number">{tasks.length}</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Active</div>
      <div className="stat-number">{tasks.filter(t => !t.completed).length}</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Completed</div>
      <div className="stat-number">{tasks.filter(t => t.completed).length}</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Overdue</div>
      <div className="stat-number">{tasks.filter(t => {
        if (!t.dueDate) return false;
        const [y,m,d] = t.dueDate.split("-").map(Number);
        const due = new Date(y,m-1,d);
        const today = new Date(); today.setHours(0,0,0,0);
        return due.getTime() < today.getTime();
      }).length}</div>
    </div>
  </div>
</div>
      

      {/* Toolbar */}
      <div className="card section">
        <Toolbar
          onChange={setControls}
          categories={categories}
          controls={controls}
        />
      </div>

      {/* Results count */}
      <div className="results-count-container">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
          }}
        >
          <motion.div
            key={visibleTasks.length}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            className="results-count"
          >
            <AnimatedNumber value={visibleTasks.length} className="results-number" />{" "}
            result{visibleTasks.length === 1 ? "" : "s"}
          </motion.div>
        </div>
      </div>

      {/* Task form */}
      <div className="card section">
        <TaskForm addTask={addTask} />
      </div>

      {/* Task list */}
      <div className="card section">
        <Suspense fallback={<SkeletonList rows={5} />}>
          <TaskList
  tasks={visibleTasks} 
  onToggleComplete={(id, current) => updateTaskById(id, { completed: !current })}
  onEdit={(id, fields) => updateTaskById(id, fields)}
  onDelete={(id) => deleteTaskById(id)}
/>
        </Suspense>
      </div>

      <div className="center section">
        <button className="btn btn-danger" onClick={clearAll}>
          Clear All Tasks
        </button>
      </div>

      <Toast items={toasts} />
    </div>
  );
}