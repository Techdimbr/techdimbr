## 2026-03-30 - Reuse Intl.NumberFormat Instances in Hot Event Handlers
**Learning:** Instantiating `new Intl.NumberFormat(...)` inside continuous input event handlers (e.g. range slider input listeners) creates significant overhead (~6.8s vs ~0.08s per 100k calls in V8) and triggers frequent garbage collection.
**Action:** Always instantiate and cache `Intl.NumberFormat` instances at component/module level outside event listeners when formatting numbers repeatedly.
## 2024-05-24 - Main Thread Wakes from UI Animations
**Learning:** `setInterval` in UI sequence animations (like `animateScore`) forces main thread wakes every N milliseconds (e.g., 20ms) even if the tab is inactive or frame rendering is paused.
**Action:** Always prefer `requestAnimationFrame` over `setInterval` for UI animations, utilizing a delta time check (`timestamp - lastTime`) to maintain strict mathematical step logic without sacrificing background efficiency.
