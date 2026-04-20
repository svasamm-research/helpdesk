# Svasamm Helpdesk — Playwright snapshot tests

Coverage for the Sprint 4 Phase 2 branding layer: document title, About
modal (AGPL source-offer link + attribution), HelpModal (Help-centre
link removed), and two page-level screenshots (dashboard + tickets list).

## How baselines are captured

The initial snapshot baselines for `desk/e2e/snapshots/` are captured
by CI (see `.github/workflows/e2e.yml` — wired in Task 2.9), not
locally. CI builds a fresh bench site with the Svasamm Helpdesk fork
installed, runs the test suite with `--update-snapshots`, and
commits the resulting `snapshots/` directory back to the branch.

Running locally against the dev server is possible but requires
installing the Svasamm Helpdesk fork onto a running bench site first
(the fork is not the same installation as upstream `apps/helpdesk/`).

## Running locally (after the fork is installed on a bench site)

```bash
cd /Users/mithunkumarsingh/Projects/local-frappe-bench/apps/svasamm_helpdesk_fork
BENCH_URL=http://<your-site>:8000 \
  TEST_USER=<svasamm-user> \
  TEST_USER_PWD=<password> \
  npx --prefix desk playwright test
```

To refresh baselines intentionally (after a brand change):

```bash
npx --prefix desk playwright test --update-snapshots
```

Snapshot drift threshold: 5% pixel-diff tolerance for page-level
captures, strict text assertions for title/About-modal/HelpModal.

## Adding new tests

Snapshots land in `desk/e2e/snapshots/`. Keep them small — each test
ideally asserts one brand element so a diff surfaces the specific
regression.
