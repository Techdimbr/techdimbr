## 2026-10-07 - Dynamic ARIA & Keyboard Focus Management in Vanilla JS Modals
**Learning:** Static `aria-hidden="true"` attributes in HTML modals prevent screen readers from announcing content when opened unless dynamically toggled to `false`. Additionally, keyboard navigation requires setting focus to the modal's primary action/close button on open and returning focus to the triggering element (`lastActiveElement`) on close.
**Action:** Always pair modal toggling with `aria-hidden` attribute updates, focus trapping/restoration, and `Escape` key listeners in Vanilla JS modal implementations.
