import Navbar from "../components/Navbar";
import RiskMeter from "../components/RiskMeter";

export default function Risk() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />

      <div className="p-10">
        <h1 className="text-2xl mb-4">Risk Analysis</h1>

        <RiskMeter score={0.65} />
      </div>
    </div>
  );
}