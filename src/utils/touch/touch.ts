import { isFingerTouchByRadius } from "./fingerTouchRecognition/byRadius";

export type IsFingerTouchStrategy = (event: Touch) => boolean;

export const isFingerTouch: IsFingerTouchStrategy = (touch: Touch) => {
  if (!touch || !(touch instanceof Touch)) {
    return false;
  }

  return isFingerTouchByRadius(touch);
};

export const eventFingers = (event: TouchEvent) => {
  if (!(event.touches instanceof TouchList)) {
    return [];
  }

  const fingers: Array<Touch> = [];

  for (let i = 0, iMax = event.touches.length; i < iMax; i++) {
    if (isFingerTouch(event.touches[i])) {
      fingers.push(event.touches[i]);
    }
  }

  return fingers;
};

export const firstFingerOfEvent = (event: TouchEvent): Touch | undefined => {
  console.log(eventFingers(event));
  return eventFingers(event)[0];
};


