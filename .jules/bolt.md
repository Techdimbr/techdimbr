## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-10-11 - requestAnimationFrame for score animation
**Learning:** Using setInterval for UI animation forces the CPU to wake up and process updates even when the tab is inactive, draining battery and causing jank.
**Action:** Use requestAnimationFrame for all continuous UI animations, syncing them with the display refresh rate and pausing them in background tabs.
