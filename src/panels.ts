import { nanoid } from 'nanoid';
import throttle from 'lodash/throttle';
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

export const panelsPathCache = writable<{ [key: string]: Array<number> }>({ '1BXcuB6i66': [] });

export const panelsWithDimensions = writable({});

export const setPanelsWithDimensions = ($panels: PanelInterface, $dimensions) => {
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
            type: node.type,
            x: x,
            y: y,
            resizeHandle: panels[index].hasResizer,
            panels: panels,
            splitOrientation,
            splitId: split.id,
            splitIndex: index,
            splitWidth: width,
            splitHeight: height,
            index,
        };

        return dim;
    }

    const traverseTree = (node, split) => {
        const dim = getNodeDimensions(node, split);
        addToAllPanels(node.id, dim);
        if (node.type === PanelType.Split) {
            node.children.forEach((child, index) => {
                panelsPathCache.update(cache => {
                    cache[child.id] = [...(cache[node.id] ?? []), index];
                    return cache;
                });
                traverseTree(
                    { ...child, index, maxIndex: node.children.length - 1 }, 
                    { ...node, ...dim, panels: node.children.map(child => ({ id: child.id, hasResizer: index < node.children.length - 1 })), maxIndex: node.children.length - 1 }
                )
            });
        }
    }

    traverseTree({...$panels, index: 0}, {
        id: 'root',
        width: $dimensions.width,
        height: $dimensions.height,
        type: PanelType.Split,
        percent: 100,
        orientation: SplitOrientation.Horizontal,
        x: 0,
        y: 0,
        panels: [{ id: $panels.id, hasResizer: false }],
    });

    return allPanels;
};

export const resizeHandle = (node, params) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let firstPanelStartWidth = undefined;
    let nextPanelStartWidth = undefined;
    let nextPanelStartX = undefined;

    const handleMouseDown = (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
    }
    const handleMouseMove = (e) => {
        if (isDragging) {
            panelsWithDimensions.update($panels => {
                let panels = $panels;
                const { id } = params;
                const firstPanel = panels[id];
                const nextPanel = panels[firstPanel.panels[firstPanel.index + 1].id];
                const split = panels[firstPanel.splitId];

                if (typeof firstPanelStartWidth === 'undefined') {
                    firstPanelStartWidth = firstPanel.width;
                }

                if (typeof nextPanelStartWidth === 'undefined') {
                    nextPanelStartWidth = nextPanel.width;
                }

                if (typeof nextPanelStartX === 'undefined') {
                    nextPanelStartX = nextPanel.x;
                }

                if (firstPanel.splitOrientation === SplitOrientation.Horizontal) {
                    const delta = e.clientX - startX;
                    console.log(delta, firstPanel.width);

                    panels = {
                        ...panels,
                        [id]: {
                            ...firstPanel,
                            width: Math.min(Math.max(firstPanelStartWidth + delta, 30), split.width - 8),
                        },
                        [nextPanel.id]: {
                            ...nextPanel,
                            width: Math.min(Math.max(nextPanelStartWidth - delta, 30), split.width - 8),
                            x: nextPanelStartX + delta,
                        }
                    }
                }
                
                return panels;
            });
        }
    }
    const handleMouseUp = (e) => {
        isDragging = false;
        firstPanelStartWidth = undefined;
        nextPanelStartWidth = undefined;
        nextPanelStartX = undefined;
    }

    node.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return {
        destroy() {
            node.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    };
}