/**
 * Créneaux horaires de rappel (heure locale) selon la fréquence prescrite.
 * Français (ordonnance) + anglais (ancien formulaire).
 */
export function getReminderSlotsForFrequency(frequency) {
  const f = String(frequency || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!f || f.includes("si besoin") || f.includes("as needed")) {
    return [];
  }

  if (f.includes("1 fois") || f.includes("once daily") || f === "once daily") {
    return [{ h: 9, m: 0, label: "Quotidien" }];
  }
  if (f.includes("2 fois") || f.includes("twice daily")) {
    return [
      { h: 8, m: 0, label: "Matin" },
      { h: 20, m: 0, label: "Soir" },
    ];
  }
  if (f.includes("3 fois") || f.includes("three times daily")) {
    return [
      { h: 8, m: 0, label: "Matin" },
      { h: 14, m: 0, label: "Midi" },
      { h: 21, m: 0, label: "Soir" },
    ];
  }
  if (f.includes("8 heures") || f.includes("every 8 hours")) {
    return [
      { h: 6, m: 0, label: "" },
      { h: 14, m: 0, label: "" },
      { h: 22, m: 0, label: "" },
    ];
  }
  if (f.includes("hebdomadaire") || f.includes("weekly")) {
    return [{ h: 9, m: 0, label: "Hebdomadaire" }];
  }

  return [{ h: 9, m: 0, label: "" }];
}

export function localDateStringYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Comparaison chaînes YYYY-MM-DD */
export function compareYMD(a, b) {
  if (!a || !b) return 0;
  return a.localeCompare(b);
}

/** Le patient peut marquer « pris » ce jour (date locale) ? */
export function canMarkMedicationForDate(med, dateStr) {
  if (!dateStr) return false;
  if (med.startDate && compareYMD(dateStr, med.startDate) < 0) return false;
  if (med.endDate && compareYMD(dateStr, med.endDate) > 0) return false;
  return true;
}

export function isMedicationActiveOnDate(med, dateStr) {
  if (med.startDate && compareYMD(dateStr, med.startDate) < 0) return false;
  if (med.endDate && compareYMD(dateStr, med.endDate) > 0) return false;
  return true;
}

/** Clés fusionnées : takenSlotKeys + legacy takenDates (journée entière seulement si pas de clés # pour ce jour). */
export function getMergedSlotKeys(med) {
  const keys = new Set(med.takenSlotKeys || []);
  const slots = getReminderSlotsForFrequency(med.frequency);
  const n = slots.length;
  if (n > 0) {
    (med.takenDates || []).forEach((d) => {
      const base = String(d).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) return;
      const hasSlotKeyForDate = [...keys].some((k) => String(k).startsWith(`${base}#`));
      if (hasSlotKeyForDate) return;
      for (let i = 0; i < n; i++) {
        keys.add(`${base}#${i}`);
      }
    });
  }
  return [...keys];
}

export function isSlotTaken(med, dateStr, slotIndex) {
  return getMergedSlotKeys(med).includes(`${dateStr}#${slotIndex}`);
}

/** Nombre de créneaux non cochés pour ce jour */
export function remainingSlotsToday(med, dateStr) {
  const slots = getReminderSlotsForFrequency(med.frequency);
  if (!slots.length || !canMarkMedicationForDate(med, dateStr)) return 0;
  let rem = 0;
  slots.forEach((_, i) => {
    if (!isSlotTaken(med, dateStr, i)) rem += 1;
  });
  return rem;
}

/** Minutes depuis minuit (heure locale). */
export function minutesSinceMidnightLocal(d = new Date()) {
  return d.getHours() * 60 + d.getMinutes();
}

export function formatSlotClock(slot) {
  if (!slot || typeof slot.h !== "number") return "";
  return `${String(slot.h).padStart(2, "0")}:${String(slot.m ?? 0).padStart(2, "0")}`;
}

/**
 * Créneaux du jour dont l'heure prévue est dépassée et la prise n'est pas cochée (rappel in-app).
 * @param graceMinutes délai après l'heure théorique (évite les faux positifs à l'heure pile)
 */
export function getMissedMedicationSlotsToday(
  medications,
  now = new Date(),
  dateStr = localDateStringYMD(),
  graceMinutes = 1
) {
  const curMin = minutesSinceMidnightLocal(now);
  const out = [];

  for (const med of medications || []) {
    if (!med?._id || !isMedicationActiveOnDate(med, dateStr)) continue;
    if (!canMarkMedicationForDate(med, dateStr)) continue;

    const freq = String(med.frequency || "").toLowerCase();
    if (freq.includes("hebdomadaire") || freq.includes("weekly")) {
      if (now.getDay() !== 1) continue;
    }

    const slots = getReminderSlotsForFrequency(med.frequency);
    slots.forEach((slot, idx) => {
      if (isSlotTaken(med, dateStr, idx)) return;
      const slotMin = slot.h * 60 + slot.m;
      if (curMin >= slotMin + graceMinutes) {
        out.push({
          med,
          slotIndex: idx,
          slot,
          minutesPast: curMin - slotMin,
        });
      }
    });
  }
  out.sort((a, b) => b.minutesPast - a.minutesPast);
  return out;
}

/** Traitement encore affiché sur la carte : pas de date de fin, ou fin ≥ jour courant (YYYY-MM-DD). */
export function isMedicationCurrentTreatment(med, todayYmd) {
  const end = med?.endDate ? String(med.endDate).slice(0, 10) : "";
  if (!end) return true;
  return compareYMD(end, todayYmd) >= 0;
}

/** Traitement terminé : date de fin strictement passée. */
export function isMedicationPastEndDate(med, todayYmd) {
  const end = med?.endDate ? String(med.endDate).slice(0, 10) : "";
  if (!end) return false;
  return compareYMD(end, todayYmd) < 0;
}

/** Horodatages ISO enregistrés au clic (clé = YYYY-MM-DD#index). */
export function getMergedSlotTimes(med) {
  const t = med?.takenSlotTimes;
  if (!t || typeof t !== "object") return {};
  return { ...t };
}

export function getSlotRecordedAtIso(med, dateStr, slotIndex) {
  return getMergedSlotTimes(med)[`${dateStr}#${slotIndex}`] || null;
}

/** Affichage heure locale (ex. pour l’UI et l’historique). */
export function formatSlotTimeLocal(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Historique des prises groupé par jour (clés fusionnées), du plus récent au plus ancien.
 * Chaque entrée : { date, slots: [{ index, label, recordedAt? }] }
 */
export function getIntakeHistoryByDate(med) {
  const keys = getMergedSlotKeys(med);
  const times = getMergedSlotTimes(med);
  const slotDefs = getReminderSlotsForFrequency(med.frequency);
  const byDate = new Map();
  for (const k of keys) {
    const m = /^(\d{4}-\d{2}-\d{2})#(\d+)$/.exec(String(k));
    if (!m) continue;
    const date = m[1];
    const idx = Number(m[2]);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(idx);
  }
  const sortedDates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));
  return sortedDates.map((date) => ({
    date,
    slots: [...new Set(byDate.get(date))]
      .sort((a, b) => a - b)
      .map((idx) => ({
        index: idx,
        label: slotDefs[idx]?.label || `Prise ${idx + 1}`,
        recordedAt: times[`${date}#${idx}`] || null,
      })),
  }));
}
