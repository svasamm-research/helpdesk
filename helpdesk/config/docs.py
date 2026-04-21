"""
Configuration for docs
"""

# source_link = "https://github.com/frappe/desk"
# headline = "App that does everything"
# sub_heading = "Yes, you got that right the first time, everything"


def get_context(context):
    # Svasamm fork rebrand: brand_html is shown on the generated docs site
    # for this app. Mirror the SPA branding.
    context.brand_html = "Svasamm Helpdesk"
