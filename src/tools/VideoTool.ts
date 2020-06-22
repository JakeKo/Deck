import { EditorTool, TOOL_NAMES } from "./types";

export default (store: any): EditorTool => {
    return {
        name: TOOL_NAMES.VIDEO,
        mount: () => { return; },
        unmount: () => { return; },
    };
};
