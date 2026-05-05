/**
 * Nombre de prises attendues par jour selon la fréquence (aligné sur le frontend).
 */
export function getSlotCountForFrequency(frequency: string | undefined): number {
  const f = String(frequency || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!f || f.includes('si besoin') || f.includes('as needed')) {
    return 0;
  }
  if (f.includes('1 fois') || f.includes('once daily')) return 1;
  if (f.includes('2 fois') || f.includes('twice daily')) return 2;
  if (f.includes('3 fois') || f.includes('three times daily')) return 3;
  if (f.includes('8 heures') || f.includes('every 8 hours')) return 3;
  if (f.includes('hebdomadaire') || f.includes('weekly')) return 1;
  return 1;
}
