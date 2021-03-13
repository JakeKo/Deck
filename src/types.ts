// TODO: Move GRAPHIC_TYPES to here

export type CurveSerialized = {
    id: string;
    type: 'curve';
    anchors: {
        inHandle: {
            x: number;
            y: number;
        };
        point: {
            x: number;
            y: number;
        };
        outHandle: {
            x: number;
            y: number;
        };
    }[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

export type CurveMutableSerialized = Partial<Pick<CurveSerialized, 'anchors' | 'fillColor' | 'strokeColor' | 'strokeWidth' | 'rotation'>>;

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

export type EllipseMutableSerialized = Partial<Pick<EllipseSerialized, 'center' | 'dimensions' | 'fillColor' | 'strokeColor' | 'strokeWidth' | 'rotation'>>;

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

export type ImageMutableSerialized = Partial<Pick<ImageSerialized, 'origin' | 'dimensions' | 'rotation'>>;

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

export type RectangleMutableSerialized = Partial<Pick<RectangleSerialized, 'origin' | 'dimensions' | 'fillColor' | 'strokeColor' | 'strokeWidth' | 'rotation'>>;

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

export type TextboxMutableSerialized = Partial<Pick<TextboxSerialized, 'origin' | 'dimensions' | 'text' | 'size' | 'weight' | 'font' | 'rotation'>>;

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

export type VideoMutableSerialized = Partial<Pick<VideoSerialized, 'origin' | 'dimensions' | 'strokeColor' | 'strokeWidth' | 'rotation'>>;
