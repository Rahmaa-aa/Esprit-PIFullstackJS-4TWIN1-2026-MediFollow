import React, { useState, useEffect, useRef, useCallback } from "react";
import { useHandGesture } from "../context/HandGestureContext";

const ROWS_LOWER = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"],
];

const ROWS_UPPER = [
  ["!","@","#","$","%","^","&","*","(",")"],
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];

const setNativeValue = (el, value) => {
  const proto = el.tagName === "TEXTAREA"
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  if (descriptor?.set) {
    descriptor.set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
};

const VirtualKeyboard = () => {
  const { isActive } = useHandGesture();
  const [isOpen, setIsOpen] = useState(false);
  const [shifted, setShifted] = useState(false);
  const activeInputRef = useRef(null);

  useEffect(() => {
    if (!isActive) { setIsOpen(false); return; }
    const handleFocusIn = (e) => {
      const tag = e.target.tagName?.toUpperCase();
      const type = e.target.type;
      const excluded = ["hidden","checkbox","radio","file","submit","button","range","color"];
      if ((tag === "INPUT" && !excluded.includes(type)) || tag === "TEXTAREA") {
        activeInputRef.current = e.target;
        setIsOpen(true);
        setShifted(false);
      }
    };
    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [isActive]);

  const typeChar = useCallback((char) => {
    const el = activeInputRef.current;
    if (!el) return;
    el.focus();
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newValue = el.value.slice(0, start) + char + el.value.slice(end);
    setNativeValue(el, newValue);
    requestAnimationFrame(() => {
      try { el.selectionStart = el.selectionEnd = start + char.length; } catch { /* */ }
    });
  }, []);

  const doBackspace = useCallback(() => {
    const el = activeInputRef.current;
    if (!el) return;
    el.focus();
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    let newValue, newCursor;
    if (start !== end) {
      newValue = el.value.slice(0, start) + el.value.slice(end);
      newCursor = start;
    } else if (start > 0) {
      newValue = el.value.slice(0, start - 1) + el.value.slice(start);
      newCursor = start - 1;
    } else return;
    setNativeValue(el, newValue);
    requestAnimationFrame(() => {
      try { el.selectionStart = el.selectionEnd = newCursor; } catch { /* */ }
    });
  }, []);

  const handleKey = useCallback((char) => {
    typeChar(char);
    if (shifted) setShifted(false);
  }, [typeChar, shifted]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    activeInputRef.current = null;
  }, []);

  if (!isOpen || !isActive) return null;

  const rows = shifted ? ROWS_UPPER : ROWS_LOWER;

  return (
    <div
      data-vk-container
      className="card mb-0 border-0 rounded-0 rounded-top-4"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 199999,
        userSelect: "none",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
        borderTop: "1px solid var(--bs-border-color) !important",
      }}
    >
      <div className="card-body px-3 py-2">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted small fw-semibold" style={{ letterSpacing: "0.08em", fontSize: "0.7rem" }}>
            <i className="ri-keyboard-line me-1"></i>CLAVIER VIRTUEL
          </span>
          <button
            data-vk-key="true"
            data-eye-clickable
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleClose}
            className="btn btn-danger btn-sm px-3"
            style={{ minWidth: 70, height: 38 }}
          >
            <i className="ri-close-line me-1"></i>Fermer
          </button>
        </div>

        {/* Ligne chiffres + Backspace */}
        <div className="d-flex justify-content-center gap-1 mb-1">
          {rows[0].map((k) => (
            <VKey key={k} label={k} onClick={() => handleKey(k)} className="btn-light" />
          ))}
          <VKey
            label={<><i className="ri-delete-back-2-line"></i></>}
            onClick={doBackspace}
            className="btn-danger"
            style={{ minWidth: 54 }}
          />
        </div>

        {/* q-p */}
        <div className="d-flex justify-content-center gap-1 mb-1">
          {rows[1].map((k) => (
            <VKey key={k} label={k} onClick={() => handleKey(k)} className="btn-light" />
          ))}
        </div>

        {/* a-l */}
        <div className="d-flex justify-content-center gap-1 mb-1">
          {rows[2].map((k) => (
            <VKey key={k} label={k} onClick={() => handleKey(k)} className="btn-light" />
          ))}
        </div>

        {/* Shift + z-m + Shift */}
        <div className="d-flex justify-content-center gap-1 mb-1">
          <VKey
            label={<><i className="ri-arrow-up-line me-1"></i>Maj</>}
            onClick={() => setShifted((s) => !s)}
            className={shifted ? "btn-primary" : "btn-secondary"}
            style={{ minWidth: 68 }}
          />
          {rows[3].map((k) => (
            <VKey key={k} label={k} onClick={() => handleKey(k)} className="btn-light" />
          ))}
          <VKey
            label={<><i className="ri-arrow-up-line me-1"></i>Maj</>}
            onClick={() => setShifted((s) => !s)}
            className={shifted ? "btn-primary" : "btn-secondary"}
            style={{ minWidth: 68 }}
          />
        </div>

        {/* Ligne du bas */}
        <div className="d-flex justify-content-center gap-1">
          {["@", ".", "-", "_"].map((k) => (
            <VKey key={k} label={k} onClick={() => handleKey(k)} className="btn-outline-secondary" />
          ))}
          <VKey
            label="Espace"
            onClick={() => handleKey(" ")}
            className="btn-light"
            style={{ minWidth: 180 }}
          />
          {[",", "?", "!"].map((k) => (
            <VKey key={k} label={k} onClick={() => handleKey(k)} className="btn-outline-secondary" />
          ))}
          <VKey
            label={<><i className="ri-corner-down-left-line me-1"></i>Entrée</>}
            onClick={() => { activeInputRef.current?.form?.requestSubmit?.(); }}
            className="btn-success"
            style={{ minWidth: 90 }}
          />
        </div>

      </div>
    </div>
  );
};

const VKey = ({ label, onClick, className = "btn-light", style = {} }) => (
  <button
    data-vk-key="true"
    data-eye-clickable
    onPointerDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`btn ${className} fw-medium`}
    style={{
      minWidth: 42,
      height: 48,
      fontSize: 15,
      padding: "0 6px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {label}
  </button>
);

export default VirtualKeyboard;
