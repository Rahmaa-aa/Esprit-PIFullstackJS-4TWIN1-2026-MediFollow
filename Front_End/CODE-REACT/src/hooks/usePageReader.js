import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

const synth = window.speechSynthesis;
export const isTtsSupported = !!synth;

export function usePageReader(contentRef) {
  const { i18n } = useTranslation();
  const [isReading, setIsReading] = useState(false);
  const utteranceRef = useRef(null);

  const stop = useCallback(() => {
    if (synth) synth.cancel();
    utteranceRef.current = null;
    setIsReading(false);
  }, []);

  const read = useCallback(() => {
    if (!isTtsSupported) return;
    stop();

    // Lit le contenu texte de l'élément référencé, ou du main sinon
    const target =
      (contentRef && contentRef.current) ||
      document.querySelector("main") ||
      document.querySelector(".container") ||
      document.body;

    // Récupère le texte visible en excluant les boutons a11y eux-mêmes
    const clone = target.cloneNode(true);
    clone.querySelectorAll(".a11y-coordinator-toolbar, script, style, [aria-hidden='true']")
      .forEach((el) => el.remove());

    const text = (clone.innerText || clone.textContent || "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 3000); // limite pour éviter lectures trop longues

    if (!text) return;

    const lang = i18n.language?.startsWith("fr")
      ? "fr-FR"
      : i18n.language?.startsWith("ar")
        ? "ar-SA"
        : "en-US";

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => { utteranceRef.current = null; setIsReading(false); };
    utterance.onerror = () => { utteranceRef.current = null; setIsReading(false); };

    utteranceRef.current = utterance;
    setIsReading(true);
    synth.speak(utterance);
  }, [stop, contentRef, i18n.language]);

  // Arrêter la lecture quand on quitte la page
  useEffect(() => () => stop(), [stop]);

  return { isReading, read, stop, isTtsSupported };
}
