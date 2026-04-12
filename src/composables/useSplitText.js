import SplitType from "split-type";
import { watch, onUnmounted } from "vue";

export function useSplitText(element) {
  let instance = null;
  let observer = null;

  const split = () => {
    if (!element.value) return;

    if (instance) instance.revert();

    instance = new SplitType(element.value, {
      types: "lines, words",
      tagName: "span",
    });

    if (instance.lines) {
      instance.lines.forEach((line, index) => {
        line.style.setProperty("--line-index", index);
      });
    }
  };

  const stopWatch = watch(
    element,
    (el) => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (el) {
        split();

        let lastWidth = 0;
        observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const width = Math.round(entry.contentRect.width);
            if (width !== lastWidth) {
              lastWidth = width;
              split();
            }
          }
        });
        observer.observe(el);
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    stopWatch();
    if (observer) observer.disconnect();
    if (instance) instance.revert();
  });

  return {
    split,
  };
}
