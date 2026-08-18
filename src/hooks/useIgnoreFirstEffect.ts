import { useEffect, useRef } from "react";

const useIgnoreFirstEffect = (effect: () => void, deps: readonly unknown[]) => {
  const isFirstRender = useRef(true);
  // Giữ effect trong ref để deps của caller quyết định thời điểm chạy,
  // caller không cần bọc effect trong useCallback
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    effectRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useIgnoreFirstEffect;
