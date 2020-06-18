import { EditorTool } from "./types";
import { TOOL_NAMES } from "./constants";

export default function pointerTool(store: any): EditorTool {
    return {
        name: TOOL_NAMES.POINTER,
        mount: () => { return; },
        unmount: () => { return; },
    };
}
