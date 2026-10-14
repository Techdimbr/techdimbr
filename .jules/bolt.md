## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2026-10-15 - requestAnimationFrame timing precision
**Learning:** When replacing `setInterval` with `requestAnimationFrame`, a naive check like `if (elapsed >= 20)` discards leftover time and makes execution framerate-dependent.
**Action:** When strict timing preservation is required, calculate elapsed time and carry over the remainder using modulo (e.g., `lastTime = timestamp - (elapsed % interval)`) to prevent time drift.
