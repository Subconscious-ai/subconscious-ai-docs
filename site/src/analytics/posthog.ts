/**
 * PostHog product analytics.
 *
 * Loaded as a Docusaurus client module so it runs once per page load and
 * tracks client-side route changes, which a plain <script> tag would miss in a
 * single-page app.
 *
 * The key is a PostHog *project* key (`phc_...`): write-only ingestion,
 * designed to ship in client bundles. It is supplied at build time from the
 * Vercel environment rather than committed, so it can be rotated without a
 * code change. With no key set (local dev), analytics is simply off.
 */
import posthog from "posthog-js";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import siteConfig from "@generated/docusaurus.config";

// process.env is not available in client bundles; siteConfig.customFields is.
const KEY = siteConfig.customFields?.posthogKey as string | undefined;

if (ExecutionEnvironment.canUseDOM && KEY) {
  posthog.init(KEY, {
    api_host: "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false, // we send these ourselves on route change
  });
  posthog.capture("$pageview");
}

export function onRouteDidUpdate({ location, previousLocation }) {
  if (!KEY || !ExecutionEnvironment.canUseDOM) return;
  if (previousLocation && location.pathname !== previousLocation.pathname) {
    posthog.capture("$pageview");
  }
}
