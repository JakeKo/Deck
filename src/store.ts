import Vue from "vue";
import Vuex from "vuex";
import Slide from "./models/Slide";
import Utilities from "./utilities/general";
import Tools from "./utilities/tools";
import Graphic from "./models/Graphic";
import Tool from "./models/Tool";
import * as SVG from "svg.js";
import Style from "./models/Style";
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
        slides: new Array<Slide>(),
        currentTool: "cursor",
        tools: {
            cursor: Tools.cursorTool,
            pencil: Tools.pencilTool,
            pen: Tools.penTool,
            rectangle: Tools.rectangleTool,
            ellipse: Tools.ellipseTool,
            textbox: Tools.textboxTool
        } as { [key: string]: Tool },
        toolbox: {
            width: 64
        }
    },
    getters: {
        slides: (state: any): Slide[] => {
            return state.slides;
        },
        firstSlide: (state: any): Slide => {
            return state.slides[0];
        },
        lastSlide: (state: any): Slide => {
            return state.slides[state.slides.length - 1];
        },
        activeSlide: (state: any): Slide => {
            return state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId)!;
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
        tool: (state: any): Tool => {
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
        },
        slidePreviewHeight: (state: any): number => {
            return state.roadmap.slidePreview.height;
        }
    },
    mutations: {
        addSlide: (state: any, index: number): void => {
            state.slides.splice(index, 0, new Slide());
        },
        addGraphic: (state: any, { slideId, graphic }: { slideId: string, graphic: Graphic }): void => {
            const slide: Slide = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            slide.graphics.push(graphic);
        },
        removeGraphic: (state: any, { slideId, graphicId }: { slideId: string, graphicId: string}): void => {
            const slide: Slide = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            slide.graphics = slide.graphics.filter((graphic: Graphic): boolean => graphic.id !== graphicId);
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
        focusGraphic: (state: any, graphic?: Graphic): void => {
            state.focusedGraphicId = graphic === undefined ? undefined : graphic.id;
        },
        canvasZoom: (state: any, zoom: number): void => {
            state.canvas.zoom = Math.max(zoom, 0.25);
        },
        graphicStyle: (state: any, { graphicId, style }: { graphicId: string, style: any }): void => {
            const activeSlide: Slide = state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId)!;
            const graphic: Graphic = activeSlide.graphics.find((graphic: Graphic): boolean => graphic.id === graphicId)!;
            const styleModel: Style = new Style(style);

            // Points are not preserved in the style editor object
            if (style.points !== undefined) {
                styleModel.points = style.points.map((point: any): Point => new Point(point.x, point.y));
            }

            graphic.style = styleModel;
        }
    },
    actions: {
        export: (store: any): void => {
            const exportFrame: HTMLElement = document.getElementById("export-frame")!;

            store.getters.slides.forEach((slideModel: Slide) => {
                const slide: HTMLDivElement = document.createElement("div");
                slide.setAttribute("id", slideModel.id);
                slide.setAttribute("class", "slide");
                exportFrame.appendChild(slide);

                const canvas: SVG.Doc = SVG(slideModel.id);
                slideModel.graphics.forEach((graphic: Graphic) => Utilities.renderGraphic(graphic, canvas));
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
