import Vue from "vue";
import Vuex from "vuex";
import SlideModel from "./models/SlideModel";
import Utilities from "./utilities";
import Theme from "./models/Theme";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";
import * as SVG from "svg.js";
import StyleModel from "./models/StyleModel";
import Point from "./models/Point";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        focusedGraphicId: undefined,
        canvas: {
            height: 2000,
            width: 4000,
            zoom: 1,
            resolution: 1,
            slide: {
                height: 603,
                width: 1072
            }
        },
        styleEditor: {
            width: 300,
            object: undefined,
            objectId: ""
        },
        roadmap: {
            height: 96,
            slidePreview: {
                height: 60
            }
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
            width: 72
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
            return state.slides.find((slide: SlideModel): boolean => slide.id === state.activeSlideId)!;
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
        },
        canvasResolution: (state: any): number => {
            return state.canvas.resolution;
        },
        slideHeight: (state: any): number => {
            return state.canvas.slide.height;
        },
        slideWidth: (state: any): number => {
            return state.canvas.slide.width;
        },
        slidePreviewHeight: (state: any): number => {
            return state.roadmap.slidePreview.height;
        }
    },
    mutations: {
        addSlide: (state: any, index: number): void => {
            state.slides.splice(index, 0, new SlideModel());
        },
        addGraphic: (state: any, { slideId, graphic }: { slideId: string, graphic: GraphicModel }): void => {
            const slide: SlideModel = state.slides.find((slide: SlideModel): boolean => slide.id === slideId);
            slide.graphics.push(graphic);
        },
        removeGraphic: (state: any, { slideId, graphicId }: { slideId: string, graphicId: string}): void => {
            const slide: SlideModel = state.slides.find((slide: SlideModel): boolean => slide.id === slideId);
            slide.graphics = slide.graphics.filter((graphic: GraphicModel): boolean => graphic.id !== graphicId);
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
            // Set roadmap height with arbitrary boundaries 64 <= height <= 256
            state.roadmap.height = Math.max(Math.min(height, 256), 64);
            // Set slide preview height within the roadmap
            state.roadmap.slidePreview.height = state.roadmap.height - 42;
        },
        activeSlide: (state: any, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        pressedKeys: (state: any, { keyCode, isPressed }: { keyCode: number, isPressed: boolean }): void => {
            state.pressedKeys[keyCode] = isPressed;
        },
        focusGraphic: (state: any, graphic?: GraphicModel): void => {
            state.focusedGraphicId = graphic === undefined ? undefined : graphic.id;
        },
        zoom: (state: any): void => {
            state.canvas.zoom += 0.05;
        },
        unzoom: (state: any): void => {
            state.canvas.zoom = Math.max(state.canvas.zoom - 0.05, 0.25);
        },
        graphicStyle: (state: any, { graphicId, style }: { graphicId: string, style: any }): void => {
            const activeSlide: SlideModel = state.slides.find((slide: SlideModel): boolean => slide.id === state.activeSlideId)!;
            const graphic: GraphicModel = activeSlide.graphics.find((graphic: GraphicModel): boolean => graphic.id === graphicId)!;
            const styleModel: StyleModel = new StyleModel(style);

            // Points are not preserved in the style editor object
            if (style.points !== undefined) {
                styleModel.points = style.points.map((point: any): Point => new Point(point.x, point.y));
            }

            graphic.styleModel = styleModel;
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
            const page: string = `${html.outerHTML}${Utilities.deckScript}`;
            anchor.setAttribute("href", `data:text/html;charset=UTF-8,${encodeURIComponent(page)}`);
            anchor.setAttribute("download", "deck.html");
            anchor.click();

            while (exportFrame.firstChild) {
                exportFrame.removeChild(exportFrame.firstChild);
            }
        }
    }
});
