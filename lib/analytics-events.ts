"use client";

type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

type AnalyticsWindow = Window &
  typeof globalThis & {
    astroshotTrack?: (eventName: string, params?: AnalyticsEventParams) => void;
  };

export function trackAstroshotEvent(
  eventName: string,
  params: AnalyticsEventParams = {}
) {
  if (typeof window === "undefined") return;

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.astroshotTrack?.(eventName, params);
}
