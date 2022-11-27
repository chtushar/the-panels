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
                percent: 20,
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
                percent: 50,
                children: [
                    {
                        id: 'lU7nIxd7B9',
                        type: PanelType.Panel,
                        orientation: SplitOrientation.Horizontal,
                        percent: 30,
                        // children: [
                        //     {
                        //         id: 'oSC_U2Vcyn',
                        //         type: PanelType.Panel,
                        //         orientation: SplitOrientation.Horizontal,
                        //         percent: 50,
                        //     },
                        //     {
                        //         id: 'WtaDeMFoUm',
                        //         type: PanelType.Panel,
                        //         orientation: SplitOrientation.Horizontal,
                        //         percent: 50,
                        //     }
                        // ],
                    },
                    {
                        id: '_BkpAPvUb-',
                        type: PanelType.Panel,
                        orientation: SplitOrientation.Horizontal,
                        percent: 70,
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
        const { width, height, orientation: splitOrientation, panels, x: splitX, y: splitY } = split;
        const { percent, index, maxIndex } = node;
        const isHorizontal = splitOrientation === SplitOrientation.Horizontal;
        const isVertical = splitOrientation === SplitOrientation.Vertical;
        const hasResizer = index < maxIndex;
        const isFirst = index === 0;
        let x = 0;
        let y = 0;

        const lastPanelIndex = index - 1;
        let lastPanel = allPanels[panels[lastPanelIndex]];
            
        if (!lastPanel) {
            lastPanel = { x: 0, y: 0, width: 0, height: 0 };
        }

        x = splitX + (isHorizontal ? lastPanel.x + lastPanel.width : 0);
        y = splitY + (isVertical ? lastPanel.y + lastPanel.height : 0);
        

        const dim = {
            width:  isHorizontal ? (width * percent / 100) : width,
            height: isVertical ? (height * percent / 100) : height,
            orientation: node.orientation,
            splitOrientation,
            type: node.type,
            x,
            y,
            resizeHandle: hasResizer,
            panels: panels
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
                    { ...node, ...dim, panels: node.children.map(child => child.id) }
                );
            });
        }
    }

    traverseTree({...layoutSettings, maxIndex: 0, index: 0}, {
        width: dimensions.width,
        height: dimensions.height,
        type: PanelType.Split,
        percent: 100,
        orientation: SplitOrientation.Horizontal,
        x: 0,
        y: 0,
        panels: layoutSettings.children.map((child) => child.id),
    });

    return allPanels;
})
