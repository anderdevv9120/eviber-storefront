import { useRef, useEffect } from "react";

export function usePrevious(value: any) {
  const ref = useRef<any>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
