import { TOOL_NAMES } from "./constants";

export type EditorTool = {
    name: TOOL_NAMES;
    mount: () => void;
    unmount: () => void;
};

export type EditorToolInitializer = (store: any) => EditorTool;
