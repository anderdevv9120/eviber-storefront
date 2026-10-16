import { useEffect, useState } from "react";

const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
};

const useMediaQuery = (width?: number, query?: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query || `(max-width: ${width}px)`);
    const handleChange = () => setMatches(mediaQuery.matches);
    handleChange();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query, width]);

  return matches;
};

// max-width = breakpoint - 0.02 để khớp min-width của Tailwind (md/lg) kể cả viewport lẻ
// do zoom (767.2px): -1 nguyên để hở khe mà cả JS lẫn CSS đều không ở nhánh mobile
const BELOW = 0.02;

const useIsMobile = () => {
  return useMediaQuery(BREAKPOINTS.MD - BELOW);
};

const useIsTablet = () => {
  return useMediaQuery(BREAKPOINTS.LG - BELOW);
};

const useIsPc = () => {
  return useMediaQuery(undefined, `(min-width: ${BREAKPOINTS.LG}px)`);
};

export { useMediaQuery, useIsMobile, useIsTablet, useIsPc };
