## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-10-17 - Replace setInterval with requestAnimationFrame
**Learning:** `setInterval` for animations can cause layout thrashing and is not tied to screen refresh rate.
**Action:** Replace `setInterval` with `requestAnimationFrame` for animations. To preserve the original mathematical behavior (e.g., maintaining a precise interval like 20ms over time), calculate elapsed time and carry over the remainder using modulo (e.g., `lastTime = timestamp - (elapsed % interval)`) to prevent framerate dependency and time drift.
