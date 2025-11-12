 // src/Components/SkeletonProgress.jsx
import React from "react";

export default function SkeletonProgress() {
  return (
    <div className="skeleton-card skeleton-progress" aria-hidden="true" role="status" aria-label="Loading progress">
      <div className="skeleton-line short" />
      <div className="skeleton-bar" aria-hidden="true">
        <div className="skeleton-bar-fill" />
      </div>
    </div>
  );
}
