import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import CursorGlow from "../components/CursorGlow";
import "../styles/globals.css";

const routeOrder = ["/", "/simulate", "/route", "/crypto", "/risk", "/logs"];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const previousPath = useRef(router.pathname);
  const [direction, setDirection] = useState("route-static");

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      const nextPath = url.split("?")[0];
      const currentIndex = routeOrder.indexOf(nextPath);
      const previousIndex = routeOrder.indexOf(previousPath.current);

      if (currentIndex !== -1 && previousIndex !== -1 && currentIndex !== previousIndex) {
        setDirection(currentIndex > previousIndex ? "route-forward" : "route-back");
      } else {
        setDirection("route-static");
      }
    };

    const handleRouteChangeComplete = (url) => {
      previousPath.current = url.split("?")[0];
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);

  return (
    <div key={router.asPath} className={`route-stage ${direction}`}>
      <CursorGlow />
      <Component {...pageProps} />
    </div>
  );
}
