## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-03-30 - Replace setInterval with requestAnimationFrame
**Learning:** `setInterval` in UI animations blocks the main thread excessively and causes time drift. `requestAnimationFrame` provides a smoother rendering experience and prevents time drift when tab is inactive.
**Action:** Use `requestAnimationFrame` with elapsed time logic for animations where timing must be preserved.
