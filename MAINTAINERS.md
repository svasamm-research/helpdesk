# svasamm-research/helpdesk — Fork Maintenance Notes

This is a Svasamm-owned fork of the upstream helpdesk project, kept in sync with upstream tags. Svasamm-flavored releases live on branches named `svasamm/<upstream-tag>` with tags `<upstream-tag>-svasamm.<N>`.

## Why we fork

The upstream helpdesk app declares `required_apps = ["telephony"]` in `helpdesk/hooks.py`. Telephony has historically caused install and runtime issues in our deployments, and none of our products (DMS, `svasamm_helpdesk_defaults`, `svasamm_helpdesk`) actually consume telephony APIs or data. Auditing helpdesk's source at `v1.22.1` confirmed:

- **Zero data-model coupling:** no doctype JSON has a Link or fetch field referencing any telephony doctype.
- **One trivial Python reference** in `helpdesk/auth.py`:
  ```python
  if path.startswith("/telephony") or path.startswith("/api/method/telephony."):
  ```
  This is a URL allowlist pattern — harmless when telephony is not installed, because the URL prefix never matches.
- **SPA (Vue) coupling** to `CallUI`, `TwilioCallUI`, `ExotelCallUI` components and a `useTelephonyStore` composable that calls `telephony.api.is_call_integration_enabled`. When the RPC returns 404 (because telephony is not installed), the store catches it and the call-related UI stays hidden. No hard failure.

The only hard blocker is the `required_apps` entry, which gates `bench install-app helpdesk` with a `ModuleNotFoundError: No module named 'telephony'` even before any code runs.

## The one-line patch

We replace line 9 of `helpdesk/hooks.py`:

```diff
-required_apps = ["telephony"]
+required_apps = []  # svasamm: telephony dependency removed — see MAINTAINERS.md
```

This is the only difference from upstream. Every other file is untouched.

## Bumping to a new upstream release

1. Fetch upstream:
   ```bash
   git remote add upstream https://github.com/frappe/helpdesk.git
   git fetch upstream --tags
   ```

2. Check out the new upstream tag and create a new Svasamm branch:
   ```bash
   git checkout v1.23.0   # or whatever the new tag is
   git checkout -b svasamm/v1.23.0
   ```

3. Re-apply the one-line patch in `helpdesk/hooks.py` (the change is trivial enough that a manual edit is cleaner than cherry-picking or rebasing).

4. Commit, tag, push:
   ```bash
   git add helpdesk/hooks.py
   git commit -m "svasamm: remove telephony dependency"
   git tag -a v1.23.0-svasamm.1 -m "Svasamm fork of helpdesk v1.23.0 — telephony dependency removed"
   git push origin svasamm/v1.23.0
   git push origin v1.23.0-svasamm.1
   ```

5. Update the helpdesk ref in consuming repos' CI workflows:
   - `svasamm-research/svasamm-helpdesk-defaults/.github/workflows/server-tests.yml`
   - `svasamm-research/svasamm-helpdesk/.github/workflows/server-tests.yml` (when it exists)
   - `svasamm-research/dms-deployment/apps/dms.json` (when it exists)

## Consuming the fork

```bash
bench get-app --branch v1.22.1-svasamm.1 git@github.com:svasamm-research/helpdesk.git
bench --site <site> install-app helpdesk
```

The `app_name` inside the fork is still `helpdesk`, so `required_apps = ["helpdesk"]` in downstream apps (like `svasamm_helpdesk_defaults`) resolves correctly without any rename.

## When to re-introduce telephony

If a future Svasamm product requires phone-call integration (agent dialer, click-to-call, call recording), we can either:

- **Option A:** Install upstream `frappe/telephony` alongside this fork on those specific tenants, pinned by commit SHA. The fork's empty `required_apps` does not prohibit telephony from being installed manually — it only removes the install-time requirement.
- **Option B:** Merge upstream's telephony dependency back into a Svasamm branch explicitly targeting those telephony-using tenants.

Until then, every Svasamm tenant running helpdesk uses this fork and stays free of telephony's install and runtime footprint.

## Licensing

Upstream helpdesk is AGPLv3. This fork inherits that license. When any Svasamm product built on this fork is deployed for a client, the fork's source (including Svasamm's patch and any future changes) must be made available to users on request — standard AGPL obligation. Document this in the client's deployment README when shipping.
