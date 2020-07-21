export type EditorTool = {
    name: TOOL_NAMES;
    mount: () => void;
    unmount: () => void;
};

export enum TOOL_NAMES {
    CURVE = 'curve',
    ELLIPSE = 'ellipse',
    IMAGE = 'image',
    NULL = 'null',
    POINTER = 'pointer',
    RECTANGLE = 'rectangle',
    TEXTBOX = 'textbox',
    VIDEO = 'video'
}
