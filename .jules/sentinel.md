## 2025-02-18 - [Fix reverse tabnabbing vulnerability]
**Vulnerability:** External links (`window.open` and `<a>` tags) with `target="_blank"` lacked the `noreferrer` attribute, making them susceptible to reverse tabnabbing and exposing referrer information.
**Learning:** `noopener` alone is not enough to prevent referrer information leakage.
**Prevention:** Always append `noreferrer` along with `noopener` on external links and programmatic redirects using `target="_blank"`.
