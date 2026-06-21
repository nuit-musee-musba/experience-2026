import SplitType from "split-type";
import { watch, onUnmounted } from "vue";

export function useSplitText(element) {
  let instance = null;
  let observer = null;

  const getStyledRanges = (el) => {
    const ranges = [];
    const fullText = el.innerText;

    const selectors = [
      { selector: "strong, b", style: { fontWeight: "bold" } },
      { selector: "em, i", style: { fontStyle: "italic" } },
    ];

    selectors.forEach(({ selector, style }) => {
      el.querySelectorAll(selector).forEach((styledEl) => {
        const styledText = styledEl.innerText;
        let searchStart = 0;
        let idx = fullText.indexOf(styledText, searchStart);
        while (idx !== -1) {
          ranges.push({ start: idx, end: idx + styledText.length, style });
          searchStart = idx + 1;
          idx = fullText.indexOf(styledText, searchStart);
        }
      });
    });

    return ranges;
  };

  const applyStylesToSpans = (el, ranges) => {
    if (!ranges.length) return;

    const fullText = el.innerText;
    const words = el.querySelectorAll(".word");

    let cursor = 0;

    words.forEach((wordEl) => {
      const wordText = wordEl.innerText;
      const wordStart = fullText.indexOf(wordText, cursor);
      const wordEnd = wordStart + wordText.length;

      ranges.forEach(({ start, end, style }) => {
        if (wordStart >= start && wordEnd <= end) {
          Object.assign(wordEl.style, style);
        }
      });

      cursor = wordEnd;
    });
  };

  const split = () => {
    if (!element.value) return;

    const styledRanges = getStyledRanges(element.value);

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

    applyStylesToSpans(element.value, styledRanges);
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
