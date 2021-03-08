// TODO: Move GRAPHIC_TYPES to here

export type CurveSerialized = {
    id: string;
    type: 'curve';
    points: {
        x: number;
        y: number;
    }[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type EllipseSerialized = {
    id: string;
    type: 'ellipse';
    center: {
        x: number;
        y: number;
    };
    dimensions: {
        x: number;
        y: number;
    };
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type ImageSerialized = {
    id: string;
    type: 'image';
    source: string;
    origin: {
        x: number;
        y: number;
    };
    dimensions: {
        x: number;
        y: number;
    };
    rotation: number;
};

export type RectangleSerialized = {
    id: string;
    type: 'rectangle';
    origin: {
        x: number;
        y: number;
    };
    dimensions: {
        x: number;
        y: number;
    };
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type TextboxSerialized = {
    id: string;
    type: 'textbox';
    origin: {
        x: number;
        y: number;
    };
    dimensions: {
        x: number;
        y: number;
    };
    text: string;
    size: number;
    weight: string;
    font: string;
    rotation: number;
};

export type VideoSerialized = {
    id: string;
    type: 'video';
    origin: {
        x: number;
        y: number;
    };
    dimensions: {
        x: number;
        y: number;
    };
    source: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};
