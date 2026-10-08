## 2026-10-07 - Form Accessibility Required Markers
**Learning:** In Vanilla HTML/CSS, adding a visual asterisk to required labels significantly improves form usability, and applying aria-hidden="true" prevents screen readers from redundantly announcing 'star' when the input itself already has the 'required' attribute.
**Action:** Always pair visual indicators for required fields with native 'required' or 'aria-required' attributes on the inputs, and hide purely visual text indicators from screen readers.
