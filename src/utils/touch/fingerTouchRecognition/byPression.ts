import { IsFingerTouchStrategy } from "../touch";

const MIN_TOUCH_FORCE = 0.4;

const minTouchForce = () =>
  // Getting value from localstorage permit edition after bundling
  Number.parseFloat(
    localStorage.getItem("MIN_TOUCH_FORCE") ?? MIN_TOUCH_FORCE.toString()
  );

export const isFingerTouchByPression: IsFingerTouchStrategy = (
  touch: Touch
): boolean => touch.force >= minTouchForce();
