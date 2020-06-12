import * as SVG from 'svg.js';

export type Renderer = {
    type: string;
    role: string;
    render: (canvas: SVG.Doc) => void;
    unrender: () => void;
    isRendered: () => boolean;
};
