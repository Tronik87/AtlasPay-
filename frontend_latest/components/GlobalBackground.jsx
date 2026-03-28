import { memo } from "react";

function GlobalBackground() {
  return (
    <div className="page-background global-background" aria-hidden="true">
      <div className="background-grid-layer static-grid" />
      <div className="background-wash-layer" />
      <div className="background-blob blob-cyan blob-static" />
      <div className="background-blob blob-violet blob-static" />
      <div className="background-blob blob-blue blob-static" />
    </div>
  );
}

export default memo(GlobalBackground);
