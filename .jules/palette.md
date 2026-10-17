## 2025-05-18 - Required Form Field Accessibility
**Learning:** Required form fields lacked visual indication for sighted users and `aria-required` for screen readers, potentially confusing users during form submission. Additionally, strict HTML linting (`htmlhint`) fails if simple brackets like `>` in text are not properly escaped (`&gt;`).
**Action:** Always add visual indicators (`<span aria-hidden="true">*</span>`) and `aria-required="true"` to required form elements. Ensure proper HTML escaping in all textual elements to pass pipeline checks.
