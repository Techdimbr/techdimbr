## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-10-10 - Prioritize LCP on above-the-fold images
**Learning:** Blog post cover images loaded without prioritization delay the Largest Contentful Paint (LCP), impacting frontend performance.
**Action:** Add `fetchpriority="high"` to `img` tags for above-the-fold images instead of `loading="lazy"` to speed up LCP.
