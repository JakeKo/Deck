import Vue from "vue";
import Vuex from "vuex";
import SlideModel from "./models/SlideModel";
import Utilities from "./foo";
import Theme from "./models/Theme";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        canvas: {
            height: 2000,
            width: 4000
        },
        styleEditor: {
            width: 300,
            object: undefined,
            objectId: ""
        },
        roadmap: {
            height: 96
        },
        slides: new Array<SlideModel>(),
        theme: 0,
        themes: [
            new Theme("light", "#FFFFFF", "#EEEEEE", "#DDDDDD", "#275DAD", "#2FBF71" ,"#ED7D3A", "#A22C29"),
            new Theme("dark", "", "", "", "", "", "", "")
        ],
        currentTool: "cursor",
        tools: {
            cursor: Utilities.cursorTool,
            rectangle: Utilities.rectangleTool,
            textbox: Utilities.cursorTool
        } as { [key: string]: ToolModel },
        pressedKeys: { } as { [key: number]: boolean },
        toolbox: {
            width: 64
        }
    },
    getters: {
        slides: (state: any): SlideModel[] => {
            return state.slides;
        },
        firstSlide: (state: any): SlideModel => {
            return state.slides[0];
        },
        lastSlide: (state: any): SlideModel => {
            return state.slides[state.slides.length - 1];
        },
        activeSlide: (state: any): SlideModel => {
            return state.slides.find((slide: SlideModel) => slide.id === state.activeSlideId)!;
        },
        styleEditorWidth: (state: any): number => {
            return state.styleEditor.width;
        },
        styleEditorObject: (state: any): any => {
            return state.styleEditor.object;
        },
        styleEditorObjectId: (state: any): string => {
            return state.styleEditor.objectId;
        },
        roadmapHeight: (state: any): number => {
            return state.roadmap.height;
        },
        theme: (state: any): Theme => {
            return state.themes[state.theme];
        },
        tool: (state: any): ToolModel => {
            return state.tools[state.currentTool];
        },
        pressedKeys: (state: any): any => {
            return state.pressedKeys;
        },
        toolboxWidth: (state: any): number => {
            return state.toolbox.width;
        }
    },
    mutations: {
        addSlide: (state: any, slideId: string): void => {
            const index: number = slideId ? state.slides.findIndex((slide: SlideModel) => slide.id === slideId) : -1;
            state.slides.splice(index + 1, 0, new SlideModel());
        },
        tool: (state: any, toolName: string): void => {
            state.currentTool = toolName;
        },
        styleEditorWidth: (state: any, width: number): void => {
            state.styleEditor.width = width;
        },
        styleEditorObject: (state: any, object: any): void => {
            // Object is of type any because styleEditor.object is initialized as undefined
            if (object === undefined) {
                state.styleEditor.objectId = "";
                state.styleEditor.object = undefined;
            } else {
                state.styleEditor.objectId = object.id;
                state.styleEditor.object = object.styleModel;
            }
        },
        roadmapHeight: (state: any, height: number): void => {
            state.roadmap.height = height;
        },
        activeSlide: (state: any, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        pressedKeys: (state: any, { keyCode, isPressed }: { keyCode: number, isPressed: boolean }) => {
            state.pressedKeys[keyCode] = isPressed;
        }
    },
    actions: {
        export: (store: any): void => {
            const html = document.createElement("html");

            html.appendChild(document.createElement("head"));
            // Append metadata to head element

            const body = document.createElement("body");
            store.getters.slides.forEach((slideModel: SlideModel) => {
                const slide: HTMLElement = document.createElement("svg");
                slide.setAttribute("id", slideModel.id);
                slide.setAttribute("class", "slide");

                // TODO: Use svg.js to programmatically add graphics
                slideModel.graphics.forEach((element: GraphicModel) => {
                    const polygon = document.createElement("polygon");
                    polygon.setAttribute("fill", element.styleModel.fill);
                    polygon.setAttribute("stroke", element.styleModel.stroke);
                    polygon.setAttribute("stroke-width", element.styleModel.strokeWidth);
                    polygon.setAttribute("fill-rule", "evenodd");
                    slide.appendChild(polygon);
                });

                body.appendChild(slide);
            });

            html.appendChild(body);

            const deck = `${html.outerHTML}${Utilities.deckScript()}`;
            const url: string = `data:text/html;charset=UTF-8,${encodeURIComponent(deck)}`;
            const anchor: HTMLElement = document.createElement("a");
            anchor.setAttribute("href", url);
            anchor.setAttribute("download", "deck.html");
            anchor.click();
        }
    }
});
