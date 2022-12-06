import { nanoid } from 'nanoid';
import { derived, writable } from 'svelte/store';


export enum SplitOrientation {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
}

export enum PanelType {
    Split = 'split',
    Panel = 'panel',
    Resize = 'resize',
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
        type: PanelType.Split,
        orientation: SplitOrientation.Horizontal,
        percent: 100,
        children: [
            {
                id: '3La5i2dZci',
                type: PanelType.Panel,
                orientation: SplitOrientation.Horizontal,
                percent: 30,
            },
            {
                id: 'PEXjXDeaq2',
                type: PanelType.Panel,
                orientation: SplitOrientation.Horizontal,
                percent: 30,
            },
            {
                id: 'zQCYKjFLLk',
                type: PanelType.Split,
                orientation: SplitOrientation.Vertical,
                percent: 40,
                children: [
                    {
                        id: 'lU7nIxd7B9',
                        type: PanelType.Split,
                        orientation: SplitOrientation.Horizontal,
                        percent: 30,
                        children: [
                            {
                                id: 'oSC_U2Vcyn',
                                type: PanelType.Panel,
                                orientation: SplitOrientation.Horizontal,
                                percent: 50,
                            },
                            {
                                id: 'WtaDeMFoUm',
                                type: PanelType.Panel,
                                orientation: SplitOrientation.Horizontal,
                                percent: 50,
                            }
                        ],
                    },
                    {
                        id: '_BkpAPvUb-',
                        type: PanelType.Split,
                        orientation: SplitOrientation.Horizontal,
                        percent: 70,
                        children: [
                            {
                                id: 'LEwUg-xId1',
                                type: PanelType.Panel,
                                orientation: SplitOrientation.Horizontal,
                                percent: 30,
                            },
                            {
                                id: '7Z5lQaENSU',
                                type: PanelType.Panel,
                                orientation: SplitOrientation.Horizontal,
                                percent: 70,
                            }
                        ]
                    }
                ]
            }
        ]
    }
});

export const panelsWithDimensions = derived([dimensions, panels], (value) => {
    const [dimensions, panels] = value;
    const { layoutSettings } = panels;
    let allPanels = {};

    const addToAllPanels = (id: string, dimensions) => {
        allPanels[id] = dimensions;
    }
    
    const getNodeDimensions = (node, split) => {
        const { percent, index } = node;
        const { width, height, orientation: splitOrientation, panels, x: splitX, y: splitY } = split;
        const isHorizontal = splitOrientation === SplitOrientation.Horizontal;
        const isVertical = splitOrientation === SplitOrientation.Vertical;

        const coveredWidth = panels.reduce((acc, { id }, i) => {
            if (i >= index) {
                return acc;
            }
            const panel = allPanels[id];
            const xOffset = panel.splitOrientation === SplitOrientation.Horizontal ? 8 : 0;
    
            return acc + panel.width + xOffset;
        }, 0);

        const coveredHeight = panels.reduce((acc, { id }, i) => {
            if (i >= index) {
                return acc;
            }
            const panel = allPanels[id];
            const yOffset = panel.splitOrientation === SplitOrientation.Vertical ? 8 : 0;

            return acc + panel.height + yOffset;
        }, 0);

        const x =  splitX + (isHorizontal ? coveredWidth : 0);
        const y =  splitY + (isVertical ? coveredHeight : 0);

        const widthOffset = isHorizontal ? ( panels[index].hasResizer ? 8 : 0 ) : 0;
        const heightOffset = isVertical ? ( panels[index].hasResizer ? 8 : 0 ) : 0;

        const dim = {
            width:  (isHorizontal ? (width * percent / 100) : width) - widthOffset,
            height: (isVertical ? (height * percent / 100) : height) - heightOffset,
            orientation: node.orientation,
            splitOrientation,
            type: node.type,
            x: x,
            y: y,
            resizeHandle: panels[index].hasResizer,
            panels: panels,
        };

        return dim;
    }

    const traverseTree = (node, split) => {
        const dim = getNodeDimensions(node, split);
        addToAllPanels(node.id, dim);
        if (node.type === PanelType.Split) {
            node.children.forEach((child, index) => {
                traverseTree(
                    { ...child, index, maxIndex: node.children.length - 1 }, 
                    { ...node, ...dim, panels: node.children.map(child => ({ id: child.id, hasResizer: index < node.children.length - 1 })), maxIndex: node.children.length - 1 }
                );
            });
        }
    }

    traverseTree({...layoutSettings, index: 0}, {
        width: dimensions.width,
        height: dimensions.height,
        type: PanelType.Split,
        percent: 100,
        orientation: SplitOrientation.Horizontal,
        x: 0,
        y: 0,
        panels: [{ id: layoutSettings.id, hasResizer: false }],
    });

    return allPanels;
})
