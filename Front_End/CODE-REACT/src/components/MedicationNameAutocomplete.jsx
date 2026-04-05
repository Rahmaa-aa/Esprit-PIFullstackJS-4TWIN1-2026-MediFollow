import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { getAllMedicationsFlat } from "../data/medications-fr";

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function groupByFamily(items) {
  const map = new Map();
  for (const { family, name } of items) {
    if (!map.has(family)) map.set(family, []);
    map.get(family).push(name);
  }
  return [...map.entries()].map(([family, names]) => ({ family, names }));
}

function filterMedications(query) {
  const flat = getAllMedicationsFlat();
  const q = normalize(query).trim();
  if (!q) {
    return groupByFamily(flat);
  }
  const matched = [];
  for (const item of flat) {
    const n = normalize(item.name);
    if (n.startsWith(q)) {
      matched.push({ ...item, rank: 0 });
    } else if (n.includes(q)) {
      matched.push({ ...item, rank: 1 });
    }
  }
  matched.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name, "fr");
  });
  const cleaned = matched.map(({ family, name }) => ({ family, name }));
  return groupByFamily(cleaned);
}

const MedicationNameAutocomplete = ({ value, onChange, useCustom, id }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const grouped = useMemo(() => filterMedications(value), [value]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (useCustom) {
    return (
      <div>
        <Form.Control
          ref={inputRef}
          id={id}
          size="sm"
          placeholder="Saisissez le nom du médicament (hors liste)"
          value={value}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <button
          type="button"
          className="btn btn-link btn-sm p-0 mt-1"
          onClick={() => onChange({ name: "", useCustomMedication: false })}
        >
          ← Revenir à la liste des médicaments
        </button>
      </div>
    );
  }

  return (
    <div className="position-relative" ref={wrapRef}>
      <Form.Control
        ref={inputRef}
        id={id}
        size="sm"
        placeholder="Rechercher par nom (ou ouvrir la liste)…"
        value={value}
        autoComplete="off"
        onChange={(e) => {
          onChange({ name: e.target.value, useCustomMedication: false });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div
          className="position-absolute border rounded shadow-sm bg-white w-100 mt-1 text-start"
          style={{ maxHeight: 320, overflowY: "auto", zIndex: 1050 }}
        >
          {grouped.length === 0 ? (
            <div className="px-3 py-2 small text-muted">Aucun médicament ne correspond à la recherche.</div>
          ) : (
            grouped.map(({ family, names }) => (
              <div key={family}>
                <div
                  className="px-2 py-1 small fw-bold text-primary bg-light border-bottom sticky-top"
                  style={{ top: 0 }}
                >
                  {family}
                </div>
                {names.map((name) => (
                  <button
                    key={`${family}-${name}`}
                    type="button"
                    className="dropdown-item py-1 px-3 small text-start w-100 border-0 bg-transparent"
                    style={{ cursor: "pointer" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange({ name, useCustomMedication: false });
                      close();
                      inputRef.current?.blur();
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ))
          )}
          <div className="border-top bg-white sticky-bottom">
            <button
              type="button"
              className="dropdown-item py-2 px-3 small fw-semibold text-warning w-100 text-start border-0 bg-transparent"
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange({ name: "", useCustomMedication: true });
                close();
              }}
            >
              <i className="ri-edit-line me-1" />
              Autre — saisie libre (médicament non listé)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationNameAutocomplete;
