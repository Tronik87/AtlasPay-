import GlobalBackground from "../components/GlobalBackground";
import Navbar from "../components/Navbar";
import GraphView from "../components/GraphView";

export default function Route() {
  return (
    <div className="app-shell">
      <GlobalBackground />
      <Navbar />

      <main className="app-main page-content-layer">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Routing Network</span>
            <h1>Observe payment corridors through a polished treasury topology view.</h1>
            <p>
              The routing surface now frames the same route experience inside a more
              executive-grade network lens with clearer corridor posture.
            </p>
          </div>

          <div className="hero-aside glass-panel">
            <div className="panel-content">
              <div className="metric-label">Connected Hubs</div>
              <div className="metric-value" style={{ fontSize: "2.1rem" }}>
                6
              </div>
              <p className="metric-foot">
                Core treasury nodes visible across the network monitoring surface.
              </p>
            </div>
          </div>
        </section>

        <GraphView />
      </main>
    </div>
  );
}
