## 2026-10-18 - Explicit ARIA Controls for Accordions
**Learning:** Dynamic accordion components (like FAQs) must explicitly link toggle buttons to their content panels using `aria-controls` to ensure screen readers can successfully associate the button with the hidden content it manages.
**Action:** Always add `aria-controls` referencing the unique ID of the target panel and explicitly track state with `aria-expanded` when implementing custom disclosure widgets or accordions.
