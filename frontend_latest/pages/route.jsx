import Navbar from "../components/Navbar";
import GraphView from "../components/GraphView";

export default function Route() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <div className="p-10">
        <h1 className="text-2xl mb-4">Routing Network</h1>

        <GraphView />
      </div>
    </div>
  );
}