import frappe

# Svasamm fork: brand constants for the get_config() override below.
# These drive configStore.brandName / brandLogo / favicon in the SPA
# (desk/src/stores/config.ts fetches from this endpoint on every load).
# Changing these values here is the SINGLE source of truth for runtime
# brand chrome; build-time chrome lives in desk/index.html +
# desk/vite.config.js (VitePWA manifest).
#
# NOTE on paths: assets live in helpdesk/public/images/ — NOT under
# helpdesk/public/desk/, which is gitignored (that directory is Vite's
# build output, wiped on every `yarn build`). Keeping branded assets
# outside the build outDir ensures they survive `git clone` and CI.
_SVASAMM_BRAND_NAME = "Svasamm Helpdesk"
_SVASAMM_BRAND_LOGO = "/assets/helpdesk/images/svasamm_logo.svg"
_SVASAMM_FAVICON = "/assets/helpdesk/images/svasamm_logo.svg"


def _upstream_get_config():
    """Upstream frappe/helpdesk v1.22.1 get_config body, preserved verbatim.

    Kept as a private helper so upstream bumps land as a clean diff to this
    function only; the Svasamm override in get_config() stays out of the way.
    """
    fields = [
        "brand_name",
        "brand_logo",
        "favicon",
        "prefer_knowledge_base",
        "setup_complete",
        "skip_email_workflow",
        "is_feedback_mandatory",
        "restrict_tickets_by_agent_group",
        "assign_within_team",
        "disable_saved_replies_global_scope",
        "enable_comment_reactions",
    ]
    res = frappe.get_value(doctype="HD Settings", fieldname=fields, as_dict=True)

    res.favicon = (
        res.favicon
        or frappe.db.get_single_value("Website Settings", "favicon")
        or "/assets/helpdesk/desk/favicon.svg"
    )
    return res


# allow_guest justification — this endpoint must remain accessible to
# unauthenticated users because it returns brand chrome (brand_name,
# brand_logo, favicon) that the /helpdesk SPA needs to render BEFORE the
# login page; without allow_guest the login page itself would fail to
# load the Svasamm brand. Mirrors upstream frappe/helpdesk v1.22.1's
# get_config, which carries allow_guest=True for the same reason. The
# response body is intentionally non-sensitive: no PII, no session data,
# no internal IDs.
# nosemgrep: frappe-semgrep-rules.rules.security.guest-whitelisted-method
@frappe.whitelist(allow_guest=True)
def get_config():
    """Return SPA config, with Svasamm brand override applied.

    The admin-editable HD Settings fields (brand_name, brand_logo, favicon)
    default to Svasamm values if the admin hasn't set them. If the admin
    HAS set them explicitly via Desk, their values win — per-tenant
    customization still works. This matches the upstream fallback pattern
    for favicon and extends it to brand_name + brand_logo.
    """
    res = _upstream_get_config()

    # Svasamm brand fallback — applied AFTER upstream logic so any admin
    # override via HD Settings / Website Settings wins over our default.
    res.brand_name = res.brand_name or _SVASAMM_BRAND_NAME
    res.brand_logo = res.brand_logo or _SVASAMM_BRAND_LOGO

    # Favicon already has an upstream fallback chain (HD Settings -> Website
    # Settings -> hard-coded helpdesk favicon). Replace the hard-coded
    # last-resort fallback with the Svasamm favicon.
    if res.favicon == "/assets/helpdesk/desk/favicon.svg":
        res.favicon = _SVASAMM_FAVICON

    return res
