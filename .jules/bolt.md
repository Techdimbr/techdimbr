## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.

## 2026-10-15 - Strict Timing Preservation with requestAnimationFrame
**Learning:** Replacing `setInterval` with `requestAnimationFrame` for animations tied to specific calculation intervals (like exactly every 20ms) can drift if the framerate drops or fluctuates.
**Action:** Always calculate `elapsed` time and carry over the remainder using modulo (`lastTime = timestamp - (elapsed % interval)`) to prevent framerate dependency and time drift, ensuring exact mathematical equivalency while gaining the performance benefits of synchronized repaints.
