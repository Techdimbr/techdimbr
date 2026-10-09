## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-03-31 - Replace window resize listeners with matchMedia
**Learning:** Attaching continuous event listeners to `window.resize` often causes main-thread CPU spikes and layout thrashing (especially if checking `window.innerWidth`).
**Action:** When evaluating breakpoints programmatically in JS, use `window.matchMedia('(min-width: <breakpoint>)').addEventListener('change', ...)` instead. It fires only exactly when the breakpoint is crossed, eliminating unnecessary evaluations.
