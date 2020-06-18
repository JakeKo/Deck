import { EditorTool } from "./types";
import { TOOL_NAMES } from "./constants";

export default function curveTool(store: any): EditorTool {
    return {
        name: TOOL_NAMES.CURVE,
        mount: () => { return; },
        unmount: () => { return; },
    };
}
