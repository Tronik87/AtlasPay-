"use client";

import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position
} from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "../components/Navbar";

/* ---------------- CUSTOM NODE ---------------- */

const CustomNode = ({ data }) => {
  return (
    <div className="pipeline-node-card">
      <div className="node-title">{data.title}</div>

      <div className="node-body">
        {data.items.map((item, i) => (
          <div key={i} className="node-item">
            • {item}
          </div>
        ))}
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

/* ---------------- NODES ---------------- */

const nodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 0, y: 100 },
    data: {
      title: "Data Sources",
      items: [
        "Bank Metadata",
        "Payment Channels",
        "FX Rates",
        "Liquidity Streams",
        "User Input"
      ]
    }
  },
  {
    id: "2",
    type: "custom",
    position: { x: 300, y: 100 },
    data: {
      title: "Ingestion Engine",
      items: [
        "create_large_sample()",
        "generate_channels()",
        "FX Profiles",
        "Liquidity Generator"
      ]
    }
  },
  {
    id: "3",
    type: "custom",
    position: { x: 600, y: 100 },
    data: {
      title: "Normalization",
      items: [
        "Country → Currency",
        "Region Mapping",
        "Bank Structuring",
        "Channel Standardization"
      ]
    }
  },
  {
    id: "4",
    type: "custom",
    position: { x: 900, y: 100 },
    data: {
      title: "Validation & Enrichment",
      items: [
        "Rail Constraints",
        "Liquidity Filtering",
        "FX Spread Applied",
        "Fee Assignment"
      ]
    }
  },

  /* NEW ML PIPELINE */

  {
    id: "7",
    type: "custom",
    position: { x: 300, y: 320 },
    data: {
      title: "Feature Layer",
      items: [
        "Transaction Features",
        "Graph Features",
        "Edge Attributes",
        "Node Embeddings"
      ]
    }
  },
  {
    id: "8",
    type: "custom",
    position: { x: 550, y: 520 },
    data: {
      title: "Autoencoder",
      items: [
        "Dimensionality Reduction",
        "Anomaly Detection",
        "Reconstruction Loss",
        "Latent Embeddings"
      ]
    }
  },
  {
    id: "9",
    type: "custom",
    position: { x: 850, y: 520 },
    data: {
      title: "Graph Neural Network",
      items: [
        "Node Embeddings",
        "Edge Scoring",
        "Message Passing",
        "Route Prediction"
      ]
    }
  },

  {
    id: "5",
    type: "custom",
    position: { x: 600, y: 320 },
    data: {
      title: "Graph Builder",
      items: [
        "Nodes (Bank, Currency)",
        "Transfer Edges",
        "FX Edges",
        "MultiDiGraph"
      ]
    }
  },
  {
    id: "6",
    type: "custom",
    position: { x: 1100, y: 320 },
    data: {
      title: "Hybrid Routing Engine",
      items: [
        "Cost Function",
        "Constraints",
        "GNN Score Fusion",
        "Top K Routes"
      ]
    }
  }
];

/* ---------------- EDGES ---------------- */

const edges = [
  { id: "e1", source: "1", target: "2", animated: true },
  { id: "e2", source: "2", target: "3", animated: true },
  { id: "e3", source: "3", target: "4", animated: true },

  /* branching into ML */
  { id: "e4", source: "4", target: "7", animated: true },

  { id: "e7-5", source: "7", target: "5", animated: true },
  { id: "e7-8", source: "7", target: "8", animated: true },

  { id: "e8-9", source: "8", target: "9", animated: true },

  { id: "e5-6", source: "5", target: "6", animated: true },
  { id: "e9-6", source: "9", target: "6", animated: true }
];

/* ---------------- MAIN ---------------- */

export default function Pipeline() {
  return (
    <div className="app-shell">
      <Navbar />

      <main style={{ height: "90vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </main>
    </div>
  );
}