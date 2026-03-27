import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">AtlasPay Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-xl">
            <h2 className="text-lg">Transactions</h2>
            <p className="text-2xl font-bold">124</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl">
            <h2 className="text-lg">Avg Cost</h2>
            <p className="text-2xl font-bold">$8.2</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl">
            <h2 className="text-lg">Risk Alerts</h2>
            <p className="text-2xl font-bold text-red-400">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
