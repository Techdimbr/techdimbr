## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.

## 2026-03-31 - Use requestAnimationFrame safely
**Learning:** Replacing setInterval with requestAnimationFrame must maintain the exact mathematical behavior of the original loop.
**Action:** When migrating animation logic, map the timestamp delta carefully to the original fixed interval duration to prevent logic alterations.
