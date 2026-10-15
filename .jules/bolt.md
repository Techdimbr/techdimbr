## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.

## 2023-10-25 - Replace setInterval with requestAnimationFrame
**Learning:** `setInterval` can block the main thread and lead to choppy animations, especially when other scripts are running. `requestAnimationFrame` provides smoother execution bound to the screen's refresh rate. However, to preserve exact logical timing (like increments every 20ms) you must manually calculate elapsed time and carry over remainders using modulo (`lastTime = timestamp - (elapsed % interval)`) to avoid time drift and framerate dependency.
**Action:** Use `requestAnimationFrame` with precise elapsed time and modulo tracking for any UI animation or polling logic instead of `setInterval` when performance and accuracy are critical.
