import React from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

export default function RouteVisualizer({ bestRoute, routes }) {
  if (!routes || routes.length === 0) return <p>No route</p>;

  let nodes = [];
  let edges = [];

  routes.forEach((route, rIndex) => {
    route.path.forEach((step, index) => {
      const id = step[0] + "-" + step[1];

      if (!nodes.find(n => n.id === id)) {
        nodes.push({
          id,
          data: { label: `${step[0]} (${step[1]})` },
          position: { x: index * 220, y: rIndex * 120 },
          style: {
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(230,183,169,0.3)",
            color: "#e6b7a9",
            backdropFilter: "blur(10px)"
          }
        });
      }
    });

    route.path.slice(0, -1).forEach((_, index) => {
      const source = route.path[index][0] + "-" + route.path[index][1];
      const target = route.path[index + 1][0] + "-" + route.path[index + 1][1];

      edges.push({
  id: `r${rIndex}-e${index}`,
  source,
  target,
  animated: route.is_best,
  style: {
    stroke: route.is_best ? "url(#gradient)" : "rgba(255,255,255,0.2)",
    strokeWidth: route.is_best ? 4 : 1.5,
    opacity: route.is_best ? 1 : 0.4
  }
});
    });
  });

  return (
  <div className="route-container" style={{ width: "100%", height: "400px", position: "relative" }}>
    <svg width="0" height="0">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e6b7a9" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>

    <ReactFlow nodes={nodes} edges={edges} fitView />
  </div>
);
}