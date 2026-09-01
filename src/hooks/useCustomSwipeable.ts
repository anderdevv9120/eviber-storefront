import { useSwipeable, SwipeableProps } from "react-swipeable";

interface SwipeHandlers {
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
}

const useCustomSwipeable = ({ onSwipedLeft, onSwipedRight }: SwipeHandlers) => {
  const config: Partial<SwipeableProps> = {
    onSwipedLeft,
    onSwipedRight,
    // Mặc định thư viện chỉ track touch — thiếu trackMouse là kéo chuột (desktop/responsive mode) không swipe được
    trackMouse: true,
  };

  return useSwipeable(config);
};

export default useCustomSwipeable;
