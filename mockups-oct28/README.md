# Design-refresh mockups, 28 Oct 2026

Throwaway branch `mockup/design-refresh`. Nothing here is wired into the live site.

Open the HTML files directly (they load ../styles.css, ../site.js and ../images), or look at `shots/` for full-page captures at 1280 and 390.

| Page | Before | After |
|---|---|---|
| /services/ | services-before.html | services-after.html |
| /care/ | care-before.html | care-after.html |

What the "after" versions change, all static CSS/HTML on the existing stylesheet, no new JS:

- /services/: proof strip of chips under the stats bar; the two prose sections "Shipped work" and "Selected client work" become one 2-column case-study grid with a big result number per card and real product screenshots for GhostChat and Gmailytics; testimonials get an initial avatar.
- /care/: a tech strip above "What's included"; a richer monthly report card (security scan, unknown admin users, 30-day uptime bar); a new "Before and after the first month" section with two browser-style panels.
