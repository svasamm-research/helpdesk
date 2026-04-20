<template>
  <div class="flex h-full items-center justify-center">
    <div
      class="flex flex-col items-center gap-3 text-xl font-medium text-ink-gray-4"
    >
      <!-- Svasamm illustration. h-40 keeps the 400x300 SVGs at a friendly
           ~160px height; w-auto preserves aspect ratio; max-w-full respects
           the parent container. The legacy `icon` prop is still accepted by
           callers (ListViewBuilder passes it through a computed options
           object) but intentionally unrendered here — CRM did the same. -->
      <img
        :src="illustration"
        :alt="`No ${resolvedName || 'records'} yet`"
        class="empty-state-illustration h-40 w-auto max-w-full"
      />
      <!-- title -->
      <span>{{ title }}</span>
      <span
        class="text-center text-p-base text-ink-gray-6 font-normal"
      >
        {{ computedDescription }}
      </span>
      <!-- Button which emits Empty State Action -->
      <Button label="Create" @click="emit('emptyStateAction')" variant="subtle">
        <template #prefix><FeatherIcon name="plus" class="h-4" /></template>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, VNode } from "vue";
import noTickets from "@/svasamm/illustrations/no_tickets.svg";
import noOpenIssues from "@/svasamm/illustrations/no_open_issues.svg";
import { __ } from "@/translation";

interface Props {
  title: string;
  /**
   * Legacy prop: accepted for caller API compatibility (ListViewBuilder
   * forwards it as part of its `emptyState` options bag) but intentionally
   * unrendered. Svasamm EmptyState renders an illustration instead.
   */
  icon?: VNode | string;
  /**
   * Optional list-view name (e.g. "Tickets", "Resolved", "Call Logs"). Used
   * to pick the illustration and to fill the computed description. When
   * unset we fall back to deriving a name from the title.
   */
  name?: string;
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "No Data Found",
  icon: "",
  name: "",
  description: "",
});

const emit = defineEmits(["emptyStateAction"]);

// Map list-view / feature name to the Svasamm illustration it should use.
// Only two illustrations exist today: `no_tickets` (blue speech-bubble
// cluster, conveys "empty inbox") and `no_open_issues` (checkmark, conveys
// "nothing pending — all clear"). Resolved/closed states get the celebratory
// checkmark; everything else gets the speech-bubble fallback. If a future
// list view needs its own mark, flag for Sprint 5 and add here.
const illustrationByName: Record<string, string> = {
  Tickets: noTickets,
  "All Tickets": noTickets,
  "Open Issues": noTickets,
  Active: noTickets,
  Unresolved: noTickets,
  Resolved: noOpenIssues,
  Closed: noOpenIssues,
  Done: noOpenIssues,
  Fulfilled: noOpenIssues,
  Customers: noTickets,
  Contacts: noTickets,
  "Call Logs": noTickets,
};

// Derive a reasonable default from the title ("No Tickets Found" -> "Tickets")
// when the caller didn't pass an explicit `name`. This lets legacy callers
// that still only pass `title` get a sensible illustration choice for free.
const resolvedName = computed(() => {
  if (props.name) return props.name;
  const match = props.title.match(/^No\s+(.+?)\s+Found$/i);
  return match ? match[1] : "";
});

const illustration = computed(
  () => illustrationByName[resolvedName.value] || noTickets,
);

const computedDescription = computed(() => {
  if (props.description) return props.description;
  if (!resolvedName.value) return "";
  return __("Nothing here yet. Create your first {0} to get started.", [
    __(resolvedName.value),
  ]);
});
</script>

<style lang="scss" scoped></style>
