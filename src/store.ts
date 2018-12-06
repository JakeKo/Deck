import Vue from "vue";
import Vuex from "vuex";
import SlideModel from "./models/SlideModel";
import Utilities from "./utilities";
import Theme from "./models/Theme";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";
import * as SVG from "svg.js";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        focusedGraphicId: "",
        canvas: {
            height: 2000,
            width: 4000,
            zoom: 1
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
            pencil: Utilities.pencilTool,
            pen: Utilities.penTool,
            rectangle: Utilities.rectangleTool,
            ellipse: Utilities.ellipseTool,
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
        },
        canvasHeight: (state: any): number => {
            return state.canvas.height;
        },
        canvasWidth: (state: any): number => {
            return state.canvas.width;
        },
        canvasZoom: (state: any): number => {
            return state.canvas.zoom;
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
        },
        zoom: (state: any) => {
            state.canvas.zoom += 0.25;
        },
        unzoom: (state: any) => {
            state.canvas.zoom = Math.max(state.canvas.zoom - 0.25, 0.25);
        }
    },
    actions: {
        export: (store: any): void => {
            const exportFrame: HTMLElement = document.getElementById("export-frame")!;

            store.getters.slides.forEach((slideModel: SlideModel) => {
                const slide: HTMLDivElement = document.createElement("div");
                slide.setAttribute("id", slideModel.id);
                slide.setAttribute("class", "slide");
                exportFrame.appendChild(slide);

                const canvas: SVG.Doc = SVG(slideModel.id);
                slideModel.graphics.forEach((graphic: GraphicModel) => Utilities.renderGraphic(graphic, canvas));
            });

            const html: HTMLHtmlElement = document.createElement("html");
            const head: HTMLHeadElement = document.createElement("head");
            const body: HTMLBodyElement = document.createElement("body");
            html.appendChild(head);
            html.appendChild(body);

            // Append metadata to head element
            const meta: HTMLMetaElement = document.createElement("meta");
            meta.name = "viewport";
            meta.content = "width=device-width, initial-scale=1.0";
            head.appendChild(meta);

            // Append slide data to body element
            body.innerHTML = exportFrame.innerHTML;

            const anchor: HTMLAnchorElement = document.createElement("a");
            const page: string = `${html.outerHTML}${Utilities.deckScript()}`;
            anchor.setAttribute("href", `data:text/html;charset=UTF-8,${encodeURIComponent(page)}`);
            anchor.setAttribute("download", "deck.html");
            anchor.click();

            while (exportFrame.firstChild) {
                exportFrame.removeChild(exportFrame.firstChild);
            }
        }
    }
});
