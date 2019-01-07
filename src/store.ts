import Vue from "vue";
import Vuex from "vuex";
import SlideModel from "./models/SlideModel";
import Utilities from "./utilities/general";
import Tools from "./utilities/tools";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";
import * as SVG from "svg.js";
import StyleModel from "./models/StyleModel";
import PointModel from "./models/PointModel";

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
        },
        styleEditor: {
            width: 300,
            object: undefined,
            objectId: ""
        },
        slides: new Array<SlideModel>(),
        currentTool: "cursor",
        tools: {
            cursor: Tools.cursorTool,
            pencil: Tools.pencilTool,
            pen: Tools.penTool,
            rectangle: Tools.rectangleTool,
            ellipse: Tools.ellipseTool,
            textbox: Tools.textboxTool
        } as { [key: string]: ToolModel },
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
        tool: (state: any): ToolModel => {
            return state.tools[state.currentTool];
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
        activeSlide: (state: any, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        focusGraphic: (state: any, graphic?: GraphicModel): void => {
            state.focusedGraphicId = graphic === undefined ? undefined : graphic.id;
        },
        canvasZoom: (state: any, zoom: number): void => {
            state.canvas.zoom = Math.max(zoom, 0.25);
        },
        graphicStyle: (state: any, { graphicId, style }: { graphicId: string, style: any }): void => {
            const activeSlide: SlideModel = state.slides.find((slide: SlideModel): boolean => slide.id === state.activeSlideId)!;
            const graphic: GraphicModel = activeSlide.graphics.find((graphic: GraphicModel): boolean => graphic.id === graphicId)!;
            const styleModel: StyleModel = new StyleModel(style);

            // Points are not preserved in the style editor object
            if (style.points !== undefined) {
                styleModel.points = style.points.map((point: any): PointModel => new PointModel(point.x, point.y));
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
