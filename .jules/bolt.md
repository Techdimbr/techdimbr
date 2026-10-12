## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.

## 2024-05-19 - Replace setInterval with requestAnimationFrame
**Learning:** `setInterval` in UI animations can block the main thread, cause off-screen layout thrashing, and drain CPU/battery when the tab is backgrounded.
**Action:** Replace `setInterval` with `requestAnimationFrame` for continuous UI updates. Keep track of `elapsed` time to guarantee mathematical correctness (e.g. constant speed updates regardless of screen refresh rate).
