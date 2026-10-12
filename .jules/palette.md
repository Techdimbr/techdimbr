## 2024-10-24 - Explicitly Identify Required Form Fields
**Learning:** While the `required` attribute enforces validation, users with cognitive disabilities or those not using screen readers may not realize a field is required until they submit the form. Missing visual indications can cause frustration.
**Action:** Always provide a visual indicator (like an asterisk) for required fields and hide it from screen readers (`aria-hidden="true"`) while explicitly using `aria-required="true"` on the input element for robust screen reader support.
