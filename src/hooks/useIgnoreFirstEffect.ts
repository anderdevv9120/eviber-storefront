import { useEffect, useEffectEvent, useRef } from "react";

const useIgnoreFirstEffect = (
  effect: () => void | (() => void),
  deps: readonly unknown[]
) => {
  const isFirstRender = useRef(true);
  // Giữ effect mới nhất để deps của caller quyết định thời điểm chạy,
  // caller không cần bọc effect trong useCallback
  const runEffect = useEffectEvent(effect);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Forward cleanup để caller hủy được việc đang bay (abort fetch) khi
    // deps đổi hoặc unmount — effect không return gì thì như cũ
    return runEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useIgnoreFirstEffect;
