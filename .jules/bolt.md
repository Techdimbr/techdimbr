## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-10-16 - [Replacing setInterval with requestAnimationFrame]
**Learning:** requestAnimationFrame is better for performance than setInterval, but it's important to properly calculate elapsed time using timestamp and modulo the remainder to prevent framerate dependency and time drift.
**Action:** Use requestAnimationFrame with precise timing logic instead of setInterval for smooth, non-blocking UI animations.
