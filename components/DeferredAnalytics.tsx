"use client";

import { useEffect } from "react";

const GA_MEASUREMENT_ID = "G-5B824FT2C6";
const META_PIXEL_ID = "1732638231438322";

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: Fbq;
  queue: unknown[][];
  version?: string;
};

type AnalyticsWindow = Window &
  typeof globalThis & {
    __astroshotAnalyticsLoaded?: boolean;
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
    astroshotTrack?: (
      eventName: string,
      params?: Record<string, string | number | boolean | undefined>
    ) => void;
  };

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

function loadAnalytics() {
  const analyticsWindow = window as AnalyticsWindow;

  if (analyticsWindow.__astroshotAnalyticsLoaded) return;
  analyticsWindow.__astroshotAnalyticsLoaded = true;

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.gtag = (...args: unknown[]) => {
    analyticsWindow.dataLayer?.push(args);
  };
  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", GA_MEASUREMENT_ID);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);

  const existingFbq = analyticsWindow.fbq;
  if (!existingFbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }
      fbq.queue.push(args);
    }) as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    analyticsWindow.fbq = fbq;
    analyticsWindow._fbq = fbq;
  }

  loadScript("https://connect.facebook.net/en_US/fbevents.js");
  analyticsWindow.fbq?.("init", META_PIXEL_ID);
  analyticsWindow.fbq?.("track", "PageView");
}

function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean | undefined> = {}
) {
  loadAnalytics();

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.gtag?.("event", eventName, params);

  if (eventName === "project_enquiry_submit") {
    analyticsWindow.fbq?.("track", "Lead", params);
    return;
  }

  analyticsWindow.fbq?.("trackCustom", eventName, params);
}

export default function DeferredAnalytics() {
  useEffect(() => {
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const analyticsWindow = window as AnalyticsWindow;
    analyticsWindow.astroshotTrack = trackEvent;

    const onTrackedClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trackedElement = target.closest<HTMLElement>("[data-astro-event]");
      const eventName = trackedElement?.dataset.astroEvent;
      if (!eventName) return;

      trackEvent(eventName, {
        label: trackedElement.dataset.astroLabel,
        location: trackedElement.dataset.astroLocation,
        href:
          trackedElement instanceof HTMLAnchorElement
            ? trackedElement.href
            : undefined,
      });
    };

    const cleanup = () => {
      events.forEach((eventName) => window.removeEventListener(eventName, onIntent));
      window.clearTimeout(timeoutId);
    };

    const run = () => {
      cleanup();
      loadAnalytics();
    };

    const onIntent = () => run();

    events.forEach((eventName) =>
      window.addEventListener(eventName, onIntent, { once: true, passive: true })
    );
    document.addEventListener("click", onTrackedClick, true);
    const timeoutId = window.setTimeout(run, 9000);

    return () => {
      document.removeEventListener("click", onTrackedClick, true);
      cleanup();
    };
  }, []);

  return null;
}
