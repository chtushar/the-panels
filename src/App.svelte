<script lang="ts">
  import { panelsWithDimensions, dimensions, PanelType, SplitOrientation, resizeHandle , panelsPathCache} from './panels';
  import clsx from 'clsx';

  panelsWithDimensions.subscribe((panels) => {
    // console.table(panels);
  });
  
</script>

<main class="flex flex-col items-center justify-center h-full p-4 dark:bg-neutral-900 bg-neutral-50">
  <div class="w-full h-full max-w-[1000px] max-h-[600px] dark:bg-neutral-800 bg-neutral-200 rounded-lg relative flex gap-4 p-4">
    <div class="relative bg-transparent w-full h-full" bind:clientWidth={$dimensions.width} bind:clientHeight={$dimensions.height}>
      {#each Object.keys($panelsWithDimensions) as id}
        {#if $panelsWithDimensions[id].type === PanelType.Panel}
          <div
            data-id={id}
            class="absolute dark:bg-neutral-900 bg-neutral-50 rounded-md flex flex-col overflow-hidden"
            style="
              left: {$panelsWithDimensions[id].x}px; 
              top: {$panelsWithDimensions[id].y}px; 
              width: {$panelsWithDimensions[id].width}px; 
              height: {$panelsWithDimensions[id].height}px;"
          >
            <div class="h-8 w-full" />
            <div class="flex-1" />
          </div>
        {/if}
        {#if $panelsWithDimensions[id].resizeHandle}
          <div
            class="{
              clsx(
                "absolute flex items-center justify-center",
                $panelsWithDimensions[id].splitOrientation === SplitOrientation.Horizontal ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize",
            )}"
            style:left="{$panelsWithDimensions[id].x + ($panelsWithDimensions[id].splitOrientation === SplitOrientation.Horizontal ? $panelsWithDimensions[id].width : 0)}px" 
            style:top="{$panelsWithDimensions[id].y + ($panelsWithDimensions[id].splitOrientation === SplitOrientation.Vertical ? $panelsWithDimensions[id].height : 0)}px"
            style:width="{$panelsWithDimensions[id].splitOrientation === SplitOrientation.Horizontal ? '8px' : $panelsWithDimensions[id].width}px"
            style:height="{$panelsWithDimensions[id].splitOrientation === SplitOrientation.Vertical ? '8px' : $panelsWithDimensions[id].height}px"
            use:resizeHandle={{ 
              id,
              index: $panelsWithDimensions[id].index,
              splitId: $panelsWithDimensions[id].splitId,
              cache: $panelsPathCache,
              splitOrientation: $panelsWithDimensions[id].splitOrientation,
            }}
          >
            <div 
            class=
              "{
                clsx(
                  "bg-neutral-400 dark:bg-neutral-700",
                  $panelsWithDimensions[id].splitOrientation === SplitOrientation.Horizontal ? "w-0.5 h-8" : "w-8 h-0.5",
                )
              }" 
            />
        </div>
        {/if}          
      {/each}
    </div>
  </div>
</main>

<!-- 
{#if $panelsWithDimensions[id].resizeHandle}
          <div 
            class=
              "{
                clsx(
                  "absolute flex items-center justify-center",
                  $panelsWithDimensions[id].splitOrientation === SplitOrientation.Horizontal ? "w-2 h-full cursor-col-resize" : "w-full h-2 cursor-row-resize",

              )}"
            style="
              left: {$panelsWithDimensions[id].x + $panelsWithDimensions[id].width}px; 
              top: {$panelsWithDimensions[id].y}px;"
          >
            <div 
              class=
                "{
                  clsx(
                    "bg-slate-300 dark:bg-slate-700",
                    $panelsWithDimensions[id].splitOrientation === SplitOrientation.Horizontal ? "w-0.5 h-8" : "w-8 h-0.5",
                  )
                }" 
            />
          </div>
        {/if} -->