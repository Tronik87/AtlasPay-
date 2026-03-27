import Navbar from "../components/Navbar";

export default function Logs() {
  const logs = [
    { id: 1, route: "A → C → D", cost: 12, risk: "Low" },
    { id: 2, route: "A → B → D", cost: 15, risk: "High" }
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <div className="p-10">
        <h1 className="text-2xl mb-4">Transaction Logs</h1>

        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Route</th>
              <th>Cost</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.route}</td>
                <td>{log.cost}</td>
                <td>{log.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}