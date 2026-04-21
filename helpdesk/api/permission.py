import frappe


def has_app_permission():
    """Check if the user has permission to access the app.

    Svasamm fork note: unlike CRM's `check_app_permission` (which gates on
    FCRM being in the user's allowed modules and which we patched to also
    accept the `Svasamm CRM` module marker), this function is permissive —
    it returns True for all callers after the role check. Full-suite DMS
    tenants reach /helpdesk via the Svasamm Helpdesk launcher tile (backed
    by the `Svasamm Helpdesk` module); the upstream Helpdesk module can be
    hidden by Module Profile without locking anyone out of the SPA. If a
    future upstream change makes this function gate on module membership
    (e.g. by checking `Helpdesk` in allowed_modules), mirror the CRM
    Svasamm fix here: also accept `Svasamm Helpdesk`.
    """
    if frappe.session.user == "Administrator":
        return True

    roles = frappe.get_roles()
    helpdesk_roles = ["Agent"]
    if any(role in roles for role in helpdesk_roles):
        return True

    # TODO: Check for Customer permission once the role is added
    return True
