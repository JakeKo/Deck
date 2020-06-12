import * as SVG from 'svg.js';

export type GraphicRenderer = {
    type: string;
    role: string;
    isRendered: boolean;
    render: (canvas: SVG.Doc) => void;
    unrender: () => void;
};
