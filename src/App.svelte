<script lang="ts">
  import { writable } from 'svelte/store';
  import { ROOT_PADDING } from './constants';

  import Panel from "./lib/Panel.svelte";
  import { panels, dimensions } from './panels';

</script>

<main class="flex flex-col items-center justify-center h-full p-4 dark:bg-neutral-900 bg-slate-50">
  <div class="w-full h-full max-w-[1200px] max-h-[600px] dark:bg-slate-800 bg-slate-100 border-2 border-solid dark:border-slate-700 border-slate-200 rounded-lg relative flex gap-4 p-4">
    <div class="relative bg-transparent w-full h-full" bind:clientWidth={$dimensions.width} bind:clientHeight={$dimensions.height}>
      <Panel {...$panels.layoutSettings} />
    </div>
  </div>
</main>
