<template>
  <div class="flex border-b pr-5">
    <div id="app-header" class="flex-1 w-full"></div>
    <div class="flex items-start justify-center">
      <CallUI :userEmail="user" />
    </div>
  </div>
</template>

<script setup>
// TODO(Sprint 5): remove CallUI + useTelephonyStore — Python hd_call_log dep
// was dropped in Sprint 1 (v1.22.1-svasamm.1), but the Vue telephony
// components still ship in desk/src/components/telephony/ (6 files) and
// are imported here, in ticket pages, and in call-log pages. Excise as
// part of a focused telephony-removal sweep, not during the branding pass.
import CallUI from "@/components/telephony/CallUI.vue";
import { useAuthStore } from "@/stores/auth";
import { useTelephonyStore } from "@/stores/telephony";
import { onMounted } from "vue";

const { user } = useAuthStore();

const telephonyStore = useTelephonyStore();

onMounted(() => {
  telephonyStore.fetchCallIntegrationStatus();
});
</script>
