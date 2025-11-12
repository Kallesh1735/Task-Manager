 // src/Components/TaskForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";

export default function TaskForm({ addTask }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      console.log("TaskForm: no text, ignoring submit");
      return;
    }

    // NOTE: don't supply id here — let App/createTask handle that
    const payload = {
      text: trimmed,
      priority,
      category,
      dueDate,
      completed: false,
    };

    console.log("TaskForm.handleSubmit -> calling addTask with:", payload);
    addTask(payload);

    setText("");
    setPriority("medium");
    setCategory("general");
    setDueDate("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="task-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <motion.input
        type="text"
        name="taskText"
        aria-label="Task text"
        placeholder="Add a new task"
        value={text}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        whileFocus={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      <div className="task-form-controls">
        <motion.select
          name="priority"
          aria-label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          whileTap={{ scale: 0.97 }}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </motion.select>

        <motion.select
          name="category"
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          whileTap={{ scale: 0.97 }}
        >
          <option value="general">General</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
        </motion.select>

        <motion.input
          type="date"
          name="dueDate"
          aria-label="Due date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        />

        <motion.button
          type="submit"
          className="btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Add Task
        </motion.button>
      </div>
    </motion.form>
  );
}