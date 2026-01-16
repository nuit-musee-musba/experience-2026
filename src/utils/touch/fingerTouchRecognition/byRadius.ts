import { IsFingerTouchStrategy } from "../touch";

const MAX_RADIUS = 1000;
const MIN_RADIUS = 0;

const MAX_RADIUS_RATIO = 1.7;
const MIN_RADIUS_RATIO = 0.5;

export const isFingerTouchByRadius: IsFingerTouchStrategy = (
  touch: Touch
): boolean => {
  const { radiusX, radiusY } = touch;

  if (radiusX === 0 && radiusY === 0) {
    console.log('[Touch] Accepté : Rayon (0,0) détecté (souris/simulateur)');
    return true;
  }

  const ratio = radiusX / radiusY;

  const isRatioInBounds =
    MIN_RADIUS_RATIO <= ratio && ratio <= MAX_RADIUS_RATIO;
  const isRadiusXInBounds = MIN_RADIUS <= radiusX && radiusX <= MAX_RADIUS;
  const isRadiusYInBounds = MIN_RADIUS <= radiusY && radiusY <= MAX_RADIUS;

  const accepted = isRatioInBounds && isRadiusXInBounds && isRadiusYInBounds;

  if (!accepted) {
    console.log('[Touch] Rejeté :', {
      radiusX,
      radiusY,
      ratio,
      isRadiusXInBounds,
      isRadiusYInBounds,
      isRatioInBounds,
      constraints: {
        MIN_RADIUS,
        MAX_RADIUS,
        MIN_RADIUS_RATIO,
        MAX_RADIUS_RATIO
      }
    });
  } else {
    console.log('[Touch] Accepté :', { radiusX, radiusY, ratio });
  }

  return accepted;
};
