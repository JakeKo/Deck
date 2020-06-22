import { TOOL_NAMES, EditorTool } from "./types";

export default {
    name: TOOL_NAMES.NULL,
    mount: () => { return; },
    unmount: () => { return; }
} as EditorTool;
