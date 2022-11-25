import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { ROOT_PADDING } from './constants';


export enum SplitOrientation {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
}

export enum PanelType {
    Root = 'root',
    Split = 'split',
}

export interface PanelInterface {
    id: string;
    type: PanelType;
    orientation: SplitOrientation;
    percent: number;
    children?: PanelInterface[];
}

export const dimensions = writable({ width: 0, height: 0 });

export const panels = writable<{
    layoutSettings: PanelInterface;
}>({
    layoutSettings: {
        id: '1BXcuB6i66',
        type: PanelType.Root,
        orientation: SplitOrientation.Horizontal,
        percent: 100,
        children: [
            {
                id: '3La5i2dZci',
                type: PanelType.Split,
                orientation: SplitOrientation.Horizontal,
                percent: 33.33333333333333,
            },
            {
                id: 'PEXjXDeaq2',
                type: PanelType.Split,
                orientation: SplitOrientation.Horizontal,
                percent: 33.33333333333333,
            },
            {
                id: 'zQCYKjFLLk',
                type: PanelType.Split,
                orientation: SplitOrientation.Horizontal,
                percent: 33.33333333333333,
            }
        ]
    }
});

export const panelDimensions = (node, params) => {
    const { id, type, orientation, percent } = params;
    const isRoot = type === PanelType.Root;
    const isSplit = type === PanelType.Split;
    const isHorizontal = orientation === SplitOrientation.Horizontal;
    const isVertical = orientation === SplitOrientation.Vertical;

    dimensions.subscribe(dimensions => {
        node.style.width = `${dimensions.width * (percent / 100)}px`;
        node.style.height = `${dimensions.height}px`;
    });
}