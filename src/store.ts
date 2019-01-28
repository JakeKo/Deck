import Vue from "vue";
import Vuex from "vuex";
import Utilities from "./utilities/general";
import Tools from "./utilities/tools";
import IGraphic from "./models/IGraphic";
import Slide from "./models/Slide";
import Tool from "./models/Tool";
import * as SVG from "svg.js";

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
            object: undefined
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
        } as { [key: string]: Tool }
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
        focusedGraphic: (state: any): IGraphic | undefined => {
            const activeSlide: Slide = state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId)!;
            return activeSlide.graphics.find((graphic: IGraphic): boolean => graphic.id === state.focusedGraphicId);
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
            state.slides.splice(index, 0, new Slide());
        },
        reorderSlide: (state: any, { source, destination }: { source: number, destination: number }): void => {
            const slide: Slide = state.slides[source];
            state.slides.splice(destination + (destination > source ? 1 : 0), 0, slide);
            state.slides.splice(source + (destination > source ? 0 : 1), 1);
        },
        addGraphic: (state: any, { slideId, graphic }: { slideId: string, graphic: IGraphic }): void => {
            const slide: Slide = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            slide.graphics.push(graphic);
        },
        removeGraphic: (state: any, { slideId, graphicId }: { slideId: string, graphicId: string}): void => {
            const slide: Slide = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            slide.graphics = slide.graphics.filter((graphic: IGraphic): boolean => graphic.id !== graphicId);
        },
        tool: (state: any, toolName: string): void => {
            state.currentTool = toolName;
        },
        styleEditorObject: (state: any, object?: IGraphic): void => {
            state.styleEditor.object = object;
        },
        activeSlide: (state: any, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        focusGraphic: (state: any, graphic?: IGraphic): void => {
            state.focusedGraphicId = graphic === undefined ? undefined : graphic.id;
        },
        canvasZoom: (state: any, zoom: number): void => {
            state.canvas.zoom = Math.max(zoom, 0.25);
        },
        updateGraphic: (state: any, graphic: IGraphic): void => {
            const activeSlide: Slide = state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId)!;
            const index: number = activeSlide.graphics.findIndex((g: IGraphic): boolean => g.id === graphic.id);

            // Update the graphic
            activeSlide.graphics.splice(index, 1, graphic);
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
                slideModel.graphics.forEach((graphic: IGraphic): SVG.Element => graphic.render(canvas));
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
            anchor.remove();

            while (exportFrame.firstChild) {
                exportFrame.removeChild(exportFrame.firstChild);
            }
        },
        save: (store: any): void => {
            const anchor: HTMLAnchorElement = document.createElement("a");
            const json: string = JSON.stringify(store.getters.slides);
            anchor.setAttribute("href", `data:text/html;charset=UTF-8,${encodeURIComponent(json)}`);
            anchor.setAttribute("download", "deck.json");
            anchor.click();
            anchor.remove();
        }
    }
});
