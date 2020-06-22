export type EditorTool = {
    name: TOOL_NAMES;
    mount: () => void;
    unmount: () => void;
};

export enum TOOL_NAMES {
    NULL = 'null',
    POINTER = 'pointer',
    RECTANGLE = 'rectangle',
    ELLIPSE = 'ellipse',
    CURVE = 'curve',
    IMAGE = 'image',
    TEXTBOX = 'textbox',
    VIDEO = 'video'
}
