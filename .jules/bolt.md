## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-10-09 - LCP optimization on above the fold images
**Learning:** Applying `loading="lazy"` to an LCP element (the main cover image) is a performance anti-pattern because it delays the browser from fetching the image.
**Action:** Use `fetchpriority="high"` on above-the-fold images to optimize LCP.
