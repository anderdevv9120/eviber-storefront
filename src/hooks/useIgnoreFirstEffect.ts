import { useEffect, useRef } from "react";

const useIgnoreFirstEffect = (
  effect: () => void | (() => void),
  deps: readonly unknown[]
) => {
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
    // Forward cleanup để caller hủy được việc đang bay (abort fetch) khi
    // deps đổi hoặc unmount — effect không return gì thì như cũ
    return effectRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useIgnoreFirstEffect;
