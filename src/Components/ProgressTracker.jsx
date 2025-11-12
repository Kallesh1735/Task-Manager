 // src/Components/ProgressTracker.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

export default function ProgressTracker({ tasks = [] }) {
  useEffect(() => {
    console.log("ProgressTracker mounted — tasks prop:", tasks);
    return () => console.log("ProgressTracker unmounted");
  }, [tasks]);

  const safe = Array.isArray(tasks) ? tasks : [];
  const completed = safe.filter(t => !!t?.completed).length;
  const total = safe.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <motion.div className="progress-tracker" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p>{completed} of {total} tasks completed</p>

      <div className="progress-bar" aria-hidden>
        <motion.div
          className="progress"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <span className="progress-text">
            <AnimatedNumber value={pct} />%
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}