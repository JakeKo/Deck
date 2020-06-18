export type EditorTool = {
    name: TOOL_NAMES;
    mount: () => void;
    unmount: () => void;
};

export enum TOOL_NAMES {
    NULL = 'null',
    POINTER = 'pointer',
    RECTANGLE = 'rectangle',
    CURVE = 'curve'
}
