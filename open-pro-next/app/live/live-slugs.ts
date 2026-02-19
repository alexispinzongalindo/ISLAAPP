export const livePages = [
  "bookflow",
  "medtrack",
  "fitcoach",
  "restaurant",
  "spa",
  "clinic",
  "dental",
  "law",
  "real-estate",
  "habits",
  "priorityos",
  "flexspace",
  "service-crm",
  "invoice-pilot",
  "memberdock",
  "chairlock",
  "meetflow",
  "replypilot",
  "learnflow",
  "auto-dealer",
] as const;

export type LivePageSlug = (typeof livePages)[number];

export function isLivePageSlug(slug: string): slug is LivePageSlug {
  return livePages.includes(slug as LivePageSlug);
}
