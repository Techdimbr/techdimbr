## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.

## 2026-10-10 - Using fetchpriority for LCP Optimization
**Learning:** Hero images or cover images above the fold (like the blog cover images in this project) are critical for the Largest Contentful Paint (LCP) metric. Relying on default loading or `loading="lazy"` on these images can significantly delay LCP.
**Action:** Always add the `fetchpriority="high"` attribute to primary above-the-fold images to instruct the browser's resource fetcher to prioritize them, thereby improving the LCP metric without breaking HTML semantics.
