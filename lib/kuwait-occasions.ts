export type KuwaitOccasion = {
  date: string;
  title: string;
  type: "public_holiday" | "seasonal" | "content";
};

export const clientMonthOptions = [
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026",
  "January 2027",
  "February 2027",
];

export const kuwaitOccasions: KuwaitOccasion[] = [
  { date: "2026-08-01", title: "Back-to-school prep season", type: "seasonal" },
  { date: "2026-08-27", title: "Prophet's Birthday", type: "public_holiday" },
  { date: "2026-09-01", title: "Back-to-school season", type: "seasonal" },
  { date: "2026-09-23", title: "September equinox", type: "seasonal" },
  { date: "2026-10-15", title: "Winter collection planning", type: "content" },
  { date: "2026-11-11", title: "Singles' Day retail moment", type: "content" },
  { date: "2026-11-27", title: "Black Friday retail moment", type: "content" },
  { date: "2026-12-01", title: "Winter shopping season", type: "seasonal" },
  { date: "2026-12-31", title: "New Year content", type: "content" },
  { date: "2027-01-01", title: "New Year's Day", type: "public_holiday" },
  { date: "2027-02-25", title: "Kuwait National Day", type: "public_holiday" },
  { date: "2027-02-26", title: "Kuwait Liberation Day", type: "public_holiday" },
];

const monthIndex: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export function monthOptionToDate(month: string) {
  const [monthName, yearRaw] = month.split(" ");
  const year = Number(yearRaw);
  const index = monthIndex[monthName] ?? 0;
  return new Date(Date.UTC(year, index, 1));
}

export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function occasionsForMonth(month: string) {
  const firstDay = monthOptionToDate(month);
  const year = firstDay.getUTCFullYear();
  const monthNumber = firstDay.getUTCMonth();
  return kuwaitOccasions.filter((occasion) => {
    const date = new Date(`${occasion.date}T00:00:00Z`);
    return date.getUTCFullYear() === year && date.getUTCMonth() === monthNumber;
  });
}

export function calendarDaysForMonth(month: string) {
  const firstDay = monthOptionToDate(month);
  const year = firstDay.getUTCFullYear();
  const monthNumber = firstDay.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, monthNumber + 1, 0)).getUTCDate();
  const leadingBlankDays = firstDay.getUTCDay();

  return [
    ...Array.from({ length: leadingBlankDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(Date.UTC(year, monthNumber, index + 1))),
  ];
}
