// src/Components/StatsPanel.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

export default function StatsPanel({ tasks = [] }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const overdue = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate + "T00:00:00");
      return due < new Date() && !t.completed;
    }).length;

    const byCategory = {};
    tasks.forEach((t) => {
      if (!t.category) return;
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    return { total, completed, active, overdue, byCategory };
  }, [tasks]);

  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.25, ease: "easeOut" },
    }),
  };

  const StatCard = ({ label, value, color, index }) => (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="stat-card"
      style={{
        background: "var(--card)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderLeft: `5px solid ${color}`,
        borderRadius: "14px",
        padding: "14px 16px",
        flex: "1 1 180px",
        boxShadow: "var(--shadow)",
      }}
    >
      <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--muted)" }}>
        {label}
      </p>
      <AnimatedNumber
        value={value}
        duration={0.6}
        className="stat-number"
      />
    </motion.div>
  );

  return (
    <div className="stats-panel" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <StatCard label="Total Tasks" value={stats.total} color="var(--accent)" index={0} />
      <StatCard label="Active" value={stats.active} color="#ffd166" index={1} />
      <StatCard label="Completed" value={stats.completed} color="var(--ok)" index={2} />
      <StatCard label="Overdue" value={stats.overdue} color="var(--danger)" index={3} />
    </div>
  );
}
