import { nanoid } from 'nanoid';
import { derived, writable } from 'svelte/store';


export enum SplitOrientation {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
}

export enum PanelType {
    Root = 'root',
    Split = 'split',
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
        type: PanelType.Root,
        orientation: SplitOrientation.Horizontal,
        percent: 100,
        children: [
            {
                id: '3La5i2dZci',
                type: PanelType.Split,
                orientation: SplitOrientation.Horizontal,
                percent: 20,
            },
            {
                id: 'PEXjXDeaq2',
                type: PanelType.Split,
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
                        type: PanelType.Split,
                        orientation: SplitOrientation.Horizontal,
                        percent: 50,
                        children: [
                            {
                                id: 'oSC_U2Vcyn',
                                type: PanelType.Split,
                                orientation: SplitOrientation.Horizontal,
                                percent: 50,
                            },
                            {
                                id: 'WtaDeMFoUm',
                                type: PanelType.Split,
                                orientation: SplitOrientation.Horizontal,
                                percent: 50,
                            }
                        ],
                    },
                    {
                        id: '_BkpAPvUb-',
                        type: PanelType.Split,
                        orientation: SplitOrientation.Horizontal,
                        percent: 50,
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

    const getPanelDimensions = (panel: PanelInterface & { index: number }, parentDim) => {
        if (panel.type === PanelType.Root) {
            return {
                ...parentDim,
                index: panel.index,
                x: 0,
                y: 0,
                resizeHandler: false
            };
        }
    
        const { width, height, orientation, maxIndex } = parentDim;
        const { percent } = panel;
    
        const isHorizontal = orientation === SplitOrientation.Horizontal;
        const isVertical = orientation === SplitOrientation.Vertical;
        const resizeHandler = panel.type === PanelType.Split && maxIndex !== panel.index;
    
        const dim = {
            width:  isHorizontal ? width * percent / 100 - (resizeHandler ? 8 : 0) : width,
            height: isVertical ? height * percent / 100 - (resizeHandler ? 8 : 0): height,
            orientation: panel.orientation,
            parentOrientation: orientation,
            type: panel.type,
            index: panel.index,
            x: 0,
            y: 0,
            resizeHandler,
        };
    
        return dim;
    }    
    
    const resizeHandle = (panelDim) => {
            const x = panelDim.parentOrientation === SplitOrientation.Horizontal ? panelDim.x + panelDim.width : panelDim.x;
            const y = panelDim.parentOrientation === SplitOrientation.Vertical ? panelDim.y + panelDim.height : panelDim.y;
            const handle = {
                id: nanoid(10),
                type: PanelType.Resize,
                orientation: panelDim.parentOrientation,
                width: panelDim.parentOrientation === SplitOrientation.Horizontal ? 8 : panelDim.width,
                height: panelDim.parentOrientation === SplitOrientation.Vertical ? 8 : panelDim.height,
                x, y
            }
        addToAllPanels(handle.id, handle)
    }

    const traversePanel = (
        panel: PanelInterface & { index: number }, 
        parent: { width: number; height: number, orientation: SplitOrientation, type: PanelType }) => 
    {
            const dim = getPanelDimensions(panel, parent);
            if (dim.resizeHandler) {
                resizeHandle(dim);
            }
            
            addToAllPanels(panel.id, dim);

            if (panel.children) {
                panel.children.forEach((p, i) => traversePanel({ ...p, index: i }, { ...dim, orientation: panel.orientation, maxIndex: panel.children.length - 1 }));
            }
    }

    traversePanel({ ...layoutSettings, index: 0 }, { ...dimensions, orientation: layoutSettings.orientation, type: layoutSettings.type });

    return allPanels;
})
