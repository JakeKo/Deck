import Vue from "vue";
import Vuex from "vuex";
import SlideModel from "./models/SlideModel";
import Utilities from "./utilities";
import Theme from "./models/Theme";
import GraphicModel from "./models/GraphicModel";
import StyleModel from "./models/StyleModel";
import ToolModel from "./models/ToolModel";
import * as SVG from "svg.js";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        focusedGraphicId: "",
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
            textbox: Utilities.textboxTool
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
        },
        focusedGraphicId: (state: any): string => {
            return state.focusedGraphicId;
        }
    },
    mutations: {
        addSlide: (state: any, slideId: string): void => {
            const index: number = slideId ? state.slides.findIndex((slide: SlideModel) => slide.id === slideId) : -1;
            state.slides.splice(index + 1, 0, new SlideModel());
        },
        addGraphic: (state: any, { slideId, graphic }: { slideId: string, graphic: GraphicModel }): void => {
            const slide: SlideModel = state.slides.find((slide: SlideModel) => slide.id === slideId);
            slide.graphics.push(graphic);
        },
        removeGraphic: (state: any, { slideId, graphicId }: { slideId: string, graphicId: string}): void => {
            const slide: SlideModel = state.slides.find((slide: SlideModel) => slide.id === slideId);
            slide.graphics = slide.graphics.filter((graphic: GraphicModel) => graphic.id !== graphicId);
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
        },
        focusGraphic: (state: any, graphic: GraphicModel) => {
            state.focusedGraphicId = graphic.id;
        }
    },
    actions: {
        export: (store: any): void => {
            const html: HTMLHtmlElement = document.createElement("html");

            html.appendChild(document.createElement("head"));
            // Append metadata to head element

            const body: HTMLBodyElement = document.createElement("body");
            store.getters.slides.forEach((slideModel: SlideModel) => {
                // TODO: Resolve discrepancy in that svg.js wants the node to be on the page
                const slide: HTMLDivElement = document.createElement("div");
                slide.setAttribute("id", slideModel.id);
                slide.setAttribute("class", "slide");

                const canvas: SVG.Doc = SVG(slideModel.id);
                slideModel.graphics.forEach((graphic: GraphicModel) => {
                    const style: StyleModel = graphic.styleModel;

                    if (graphic.type === "rectangle") {
                        return canvas.rect(style.width, style.height).attr({
                            "x": style.x,
                            "y": style.y,
                            "fill": style.fill,
                            "stroke": style.stroke,
                            "stroke-width": style.strokeWidth
                        });
                    } else if (graphic.type === "textbox") {
                        return canvas.text(style.message || "").attr({
                            "x": style.x,
                            "y": style.y
                        });
                    }
                });

                body.appendChild(slide);
            });

            html.appendChild(body);

            const anchor: HTMLAnchorElement = document.createElement("a");
            const page: string = `${html.outerHTML}${Utilities.deckScript()}`;
            anchor.setAttribute("href", `data:text/html;charset=UTF-8,${encodeURIComponent(page)}`);
            anchor.setAttribute("download", "deck.html");
            anchor.click();
        }
    }
});
