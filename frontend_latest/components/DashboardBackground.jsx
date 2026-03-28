import { memo, useEffect, useRef } from "react";

function DashboardBackground() {
  const gridRef = useRef(null);
  const blobRefs = useRef([]);

  useEffect(() => {
    let animationFrame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const updateScene = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;

      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(${currentX * 0.02}px, ${currentY * 0.02}px, 0)`;
      }

      blobRefs.current.forEach((blob, index) => {
        if (!blob) {
          return;
        }

        const depth = 0.05 + index * 0.02;
        blob.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`;
      });

      animationFrame = window.requestAnimationFrame(updateScene);
    };

    const handleMouseMove = (event) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = event.clientX - centerX;
      targetY = event.clientY - centerY;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    animationFrame = window.requestAnimationFrame(updateScene);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  return (
    <div className="page-background dashboard-background" aria-hidden="true">
      <div ref={gridRef} className="background-grid-layer" />
      <div
        ref={(element) => {
          blobRefs.current[0] = element;
        }}
        className="background-blob blob-cyan"
      />
      <div
        ref={(element) => {
          blobRefs.current[1] = element;
        }}
        className="background-blob blob-violet"
      />
      <div
        ref={(element) => {
          blobRefs.current[2] = element;
        }}
        className="background-blob blob-blue"
      />
    </div>
  );
}

export default memo(DashboardBackground);
