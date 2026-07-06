"use client";

import TaskCard, { Task } from "./TaskCard";

interface TodayTasksProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onStart: (task: Task) => void;
  onAdd: () => void;
  onClearCompleted: () => void;
}

export default function TodayTasks({
  tasks,
  onToggle,
  onDelete,
  onStart,
  onAdd,
  onClearCompleted,
}: TodayTasksProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "820px",
        marginTop: "2rem",
        background: "#101010",
        border: "1px solid #252525",
        borderRadius: "18px",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 700,
          }}
        >
          ✨ Today's Tasks
        </h2>

        <button onClick={onClearCompleted}>
         Clear Completed
        </button>

        <button
          onClick={onAdd}
          style={{
            background: "#ec4899",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#666",
            padding: "2rem",
            border: "1px dashed #333",
            borderRadius: "12px",
          }}
        >
          No tasks yet.
          <br />
          Click <b>+ Add Task</b> to get started.
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onStart={onStart}
          />
        ))
      )}
    </div>
  );
}