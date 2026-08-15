import type { Kajian, KajianDayOfWeek } from "@/types";

const DAY_ID_BY_JS_INDEX: KajianDayOfWeek[] = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

const DAY_LABEL: Record<KajianDayOfWeek, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

const MONTH_LABEL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Returns the KajianDayOfWeek id for a given Date, in local time. */
export function dayOfWeekFromDate(date: Date): KajianDayOfWeek {
  return DAY_ID_BY_JS_INDEX[date.getDay()];
}

/** Formats a Date as an ISO "YYYY-MM-DD" string in local time (no UTC shift). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTanggalPanjang(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${d} ${MONTH_LABEL[m - 1]} ${y}`;
}

export function formatJam(hhmm: string): string {
  return hhmm.replace(":", ".");
}

/** True if this kajian occurs on the given calendar date (rutin = matches
 *  weekday, insidental = matches exact date). Inactive kajian never match. */
export function occursOnDate(kajian: Kajian, isoDate: string): boolean {
  if (!kajian.isActive) return false;
  if (kajian.frequency === "insidental") {
    return kajian.date === isoDate;
  }
  const [y, m, d] = isoDate.split("-").map(Number);
  const weekday = dayOfWeekFromDate(new Date(y, m - 1, d));
  return kajian.dayOfWeek === weekday;
}

export function occursToday(kajian: Kajian, today: Date = new Date()): boolean {
  return occursOnDate(kajian, toISODate(today));
}

/** Human label describing when a kajian happens, e.g. "Setiap Kamis" or
 *  "21 Agustus 2026". */
export function scheduleLabel(kajian: Kajian): string {
  if (kajian.frequency === "rutin" && kajian.dayOfWeek) {
    return `Setiap ${DAY_LABEL[kajian.dayOfWeek]}`;
  }
  if (kajian.date) {
    return formatTanggalPanjang(kajian.date);
  }
  return "Jadwal belum ditentukan";
}

export function scheduleWithTimeLabel(kajian: Kajian): string {
  return `${scheduleLabel(kajian)} · ${formatJam(kajian.startTime)}–${formatJam(
    kajian.endTime
  )} WIB`;
}

/** For sorting: returns how many days from `today` until the next
 *  occurrence of this kajian (0 = today). Returns Infinity if it can
 *  never occur (bad data) so it sorts last. */
export function daysUntilNextOccurrence(kajian: Kajian, today: Date = new Date()): number {
  if (!kajian.isActive) return Infinity;
  if (kajian.frequency === "insidental") {
    if (!kajian.date) return Infinity;
    const target = new Date(kajian.date + "T00:00:00");
    const base = new Date(toISODate(today) + "T00:00:00");
    const diff = Math.round((target.getTime() - base.getTime()) / 86_400_000);
    return diff < 0 ? Infinity : diff;
  }
  if (!kajian.dayOfWeek) return Infinity;
  const targetIndex = DAY_ID_BY_JS_INDEX.indexOf(kajian.dayOfWeek);
  const todayIndex = today.getDay();
  return (targetIndex - todayIndex + 7) % 7;
}
