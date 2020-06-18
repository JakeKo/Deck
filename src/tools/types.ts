import { TOOL_NAMES } from "./constants";

export type EditorTool = {
    name: TOOL_NAMES;
    mount: () => void;
    unmount: () => void;
};
