import { EditorTool, TOOL_NAMES } from "./types";

export default function pointerTool(store: any): EditorTool {
    return {
        name: TOOL_NAMES.POINTER,
        mount: () => { return; },
        unmount: () => { return; },
    };
}
