<template>
  <svg
    width="300"
    height="300"
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Svasamm Helpdesk"
  >
    <!--
      Svasamm Helpdesk app-icon mark. The original upstream 118x118 viewBox
      was deliberately widened to 300x300 (matching the Svasamm CRM mark) so
      downstream consumers - BrandLogo, UserMenu, the frappe-ui HelpModal
      slot, manifest icons - render the new mark with generous bleed. Filename
      (HDLogo.vue) preserved so no callers need updating.
    -->
    <defs>
      <linearGradient id="hd-logo-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ea580c" />
        <stop offset="100%" stop-color="#c2410c" />
      </linearGradient>
    </defs>
    <rect width="300" height="300" rx="56" fill="url(#hd-logo-grad)" />
    <!-- White speech bubble with tail (customer voice) -->
    <path
      d="M60 75 Q60 55 80 55 L220 55 Q240 55 240 75 L240 185 Q240 205 220 205 L135 205 L95 245 L95 205 L80 205 Q60 205 60 185 Z"
      fill="#ffffff"
    />
    <!-- Orange checkmark inside bubble (issue resolved) -->
    <path
      d="M105 130 L140 165 L210 95"
      fill="none"
      stroke="#c2410c"
      stroke-width="22"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
