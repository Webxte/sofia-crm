
import { useEffect } from "react";
import { Location } from "react-router-dom";

export const useSmoothScroll = (location: Location) => {
  // Add smooth scrolling to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
};
