import { useState, useEffect } from "react";

const STORAGE_KEY = "medifollow_large_text";

export function useA11yLargeText() {
  const [largeText, setLargeText] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "1"
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, largeText ? "1" : "0");
    if (largeText) {
      document.documentElement.classList.add("a11y-large-text");
    } else {
      document.documentElement.classList.remove("a11y-large-text");
    }
  }, [largeText]);

  const toggle = () => setLargeText((v) => !v);

  return { largeText, toggle };
}
