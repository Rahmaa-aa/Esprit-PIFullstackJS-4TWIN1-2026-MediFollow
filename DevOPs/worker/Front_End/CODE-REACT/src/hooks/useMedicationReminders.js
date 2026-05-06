import { useEffect, useRef } from "react";
import {
  getReminderSlotsForFrequency,
  localDateStringYMD,
  isMedicationActiveOnDate,
} from "../utils/medicationReminders";

const WINDOW_MINUTES = 3;
const TICK_MS = 45000;

function minutesSinceMidnight(d) {
  return d.getHours() * 60 + d.getMinutes();
}

function slotMatchesNow(slot, now) {
  const target = slot.h * 60 + slot.m;
  const cur = minutesSinceMidnight(now);
  return Math.abs(cur - target) <= WINDOW_MINUTES;
}

function storageKey(medId, dateStr, slotIndex) {
  return `medifollow-reminder-${medId}-${dateStr}-${slotIndex}`;
}

/**
 * Rappels navigateur (Notification API) selon la fréquence du médicament.
 * Ne fonctionne que si l'onglet peut tourner et les notifications sont autorisées.
 */
export function useMedicationReminders(medications) {
  const medsRef = useRef(medications);
  medsRef.current = medications;

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return undefined;

    const tick = () => {
      const meds = medsRef.current || [];
      if (!meds.length) return;

      if (Notification.permission !== "granted") return;

      const now = new Date();
      const dateStr = localDateStringYMD();

      for (const med of meds) {
        if (!med?._id || !isMedicationActiveOnDate(med, dateStr)) continue;

        const freq = String(med.frequency || "").toLowerCase();
        if (freq.includes("hebdomadaire") || freq.includes("weekly")) {
          if (now.getDay() !== 1) continue;
        }

        const slots = getReminderSlotsForFrequency(med.frequency);
        slots.forEach((slot, idx) => {
          if (!slotMatchesNow(slot, now)) return;
          const key = storageKey(med._id, dateStr, idx);
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key, "1");

          const title = "Rappel MediFollow — médicament";
          const body = `${med.name || "Médicament"}${med.dosage ? ` — ${med.dosage}` : ""}${
            slot.label ? ` (${slot.label})` : ""
          }`;
          try {
            new Notification(title, { body, icon: "/favicon.ico", tag: key });
          } catch {
            /* ignore */
          }
        });
      }
    };

    const id = window.setInterval(tick, TICK_MS);
    tick();
    return () => window.clearInterval(id);
  }, []);
}
