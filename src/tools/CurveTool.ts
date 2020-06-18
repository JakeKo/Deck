import { EditorTool, TOOL_NAMES } from "./types";

export default function curveTool(store: any): EditorTool {
    return {
        name: TOOL_NAMES.CURVE,
        mount: () => { return; },
        unmount: () => { return; },
    };
}
