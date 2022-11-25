<script lang="ts">
    import { SplitOrientation, PanelType, panelDimensions } from '../panels';
    import type { PanelInterface  } from '../panels';
  import { onMount } from 'svelte';
    
    export let id: string = '';
    export let type: PanelType = PanelType.Split;
    export let children: Array<PanelInterface> = [];
    export let orientation: SplitOrientation = SplitOrientation.Horizontal;
    export let percent: number = 100;

</script>

{#if type === PanelType.Split }
    <div class="absolute rounded-md dark:bg-neutral-900" use:panelDimensions={{ id, type, orientation, percent }}>
        {id}
    </div>
{/if}

{#each children as child}
		<svelte:self {...child}>
        </svelte:self>
{/each}
