<script lang="ts">
  import { panelsWithDimensions, dimensions, PanelType, SplitOrientation } from './panels';
  import clsx from 'clsx';

  panelsWithDimensions.subscribe((panels) => {
    console.table(panels);
  });
</script>

<main class="flex flex-col items-center justify-center h-full p-4 dark:bg-neutral-900 bg-slate-50">
  <div class="w-full h-full max-w-[1000px] max-h-[600px] dark:bg-slate-800 bg-slate-100 border-2 border-solid dark:border-slate-700 border-slate-200 rounded-lg relative flex gap-4 p-4">
    <div class="relative bg-transparent w-full h-full" bind:clientWidth={$dimensions.width} bind:clientHeight={$dimensions.height}>
      {#each Object.keys($panelsWithDimensions) as id}
        {#if $panelsWithDimensions[id].type === PanelType.Split}
          <div
            class="absolute dark:bg-slate-900 bg-slate-500 rounded-md opacity-0"
            style="left: {$panelsWithDimensions[id].x}px; top: {$panelsWithDimensions[id].y}px; width: {$panelsWithDimensions[id].width}px; height: {$panelsWithDimensions[id].height}px;"
          />
        {/if}
        {#if $panelsWithDimensions[id].type === PanelType.Resize}
          <div class="absolute dark:bg-neutral-900 opacity-10"
            style="left: {$panelsWithDimensions[id].x}px; top: {$panelsWithDimensions[id].y}px; width: {$panelsWithDimensions[id].width}px; height: {$panelsWithDimensions[id].height}px;"
          />
        {/if}
      {/each}
    </div>
  </div>
</main>
