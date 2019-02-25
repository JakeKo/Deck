import Vue from "vue";
import Vuex from "vuex";
import Utilities from "./utilities/general";
import IGraphic from "./models/graphics/IGraphic";
import Slide from "./models/Slide";
import * as SVG from "svg.js";

import ICanvasTool from "./models/tools/ICanvasTool";
import CursorTool from "./models/tools/CursorTool";
import EllipseTool from "./models/tools/EllipseTool";
import PencilTool from "./models/tools/PencilTool";
import PenTool from "./models/tools/PenTool";
import RectangleTool from "./models/tools/RectangleTool";
import TextboxTool from "./models/tools/TextboxTool";

type State = {
    activeSlideId: string,
    focusedGraphicId: string | undefined,
    canvas: {
        height: number,
        width: number,
        zoom: number,
        resolution: number
    },
    styleEditor: {
        object: any
    },
    slides: Array<Slide>,
    currentTool: string,
    tools: { [key: string]: ICanvasTool }
};

type Getters = {
    slides: (state: any) => Array<Slide>,
    activeSlide: (state: any) => Slide | undefined,
    styleEditorObject: (state: any) => any,
    tool: (state: any) => ICanvasTool,
    focusedGraphic: (state: any) => IGraphic | undefined,
    canvasHeight: (state: any) => number,
    canvasWidth: (state: any) => number,
    canvasZoom: (state: any) => number,
    canvasResolution: (state: any) => number
};

type Mutations = {
    addSlide: (state: State, index: number) => void,
    reorderSlide: (state: State, { source, destination }: { source: number, destination: number }) => void,
    addGraphic: (state: State, { slideId, graphic }: { slideId: string, graphic: IGraphic }) => void,
    removeGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId: string }) => void,
    updateGraphic: (state: State, { slideId, graphicId, graphic }: { slideId: string, graphicId: string, graphic: IGraphic }) => void,
    focusGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId?: string }) => void,
    tool: (state: State, toolName: string) => void,
    styleEditorObject: (state: State, object?: IGraphic) => void,
    activeSlide: (state: State, slideId: string) => void,
    canvasZoom: (state: State, zoom: number) => void
};

type Actions = {
    export: (store: any) => void,
    save: (store: any) => void,
    resetPresentation: (store: any, presentation: Array<Slide>) => void
};

const store: {
    state: State,
    getters: Getters,
    mutations: Mutations,
    actions: Actions
} = {
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
            cursor: new CursorTool("cursor"),
            pencil: new PencilTool("pencil"),
            pen: new PenTool("pen"),
            rectangle: new RectangleTool("rectangle"),
            ellipse: new EllipseTool("ellipse"),
            textbox: new TextboxTool("textbox")
        } as { [key: string]: ICanvasTool }
    },
    getters: {
        slides: (state: State): Array<Slide> => {
            return state.slides;
        },
        activeSlide: (state: State): Slide | undefined => {
            return state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId)!;
        },
        styleEditorObject: (state: State): any => {
            return state.styleEditor.object;
        },
        tool: (state: State): ICanvasTool => {
            return state.tools[state.currentTool];
        },
        focusedGraphic: (state: State): IGraphic | undefined => {
            const activeSlide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId);
            return activeSlide === undefined ? undefined : activeSlide.graphics.find((graphic: IGraphic): boolean => graphic.id === state.focusedGraphicId);
        },
        canvasHeight: (state: State): number => {
            return state.canvas.height;
        },
        canvasWidth: (state: State): number => {
            return state.canvas.width;
        },
        canvasZoom: (state: State): number => {
            return state.canvas.zoom;
        },
        canvasResolution: (state: State): number => {
            return state.canvas.resolution;
        }
    },
    mutations: {
        addSlide: (state: State, index: number): void => {
            if (state.slides.length === index) {
                state.slides.push(new Slide());
            } else {
                state.slides.splice(index, 0, new Slide());
            }
        },
        reorderSlide: (state: State, { source, destination }: { source: number, destination: number }): void => {
            const slide: Slide = state.slides[source];

            if (slide === undefined) {
                console.error(`ERROR: No slide exists at index ${source} to reorder`);
                return;
            }

            state.slides.splice(destination + (destination > source ? 1 : 0), 0, slide);
            state.slides.splice(source + (destination > source ? 0 : 1), 1);
        },
        addGraphic: (state: State, { slideId, graphic }: { slideId: string, graphic: IGraphic }): void => {
            if (graphic === undefined) {
                console.error("ERROR: Attempted to add an undefined graphic");
                return;
            }

            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            slide.graphics.push(graphic);
            document.dispatchEvent(new CustomEvent("Deck.GraphicAdded", { detail: { slideId: slideId, graphicId: graphic.id } }));
        },
        removeGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            slide.graphics = slide.graphics.filter((graphic: IGraphic): boolean => graphic.id !== graphicId);
            document.dispatchEvent(new CustomEvent("Deck.GraphicRemoved", { detail: { slideId: slideId, graphicId: graphicId } }));
        },
        updateGraphic: (state: State, { slideId, graphicId, graphic }: { slideId: string, graphicId: string, graphic: IGraphic }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: Could not find slide ("${slideId}")`);
                return;
            }

            // Update the graphic
            const index: number = slide.graphics.findIndex((g: IGraphic): boolean => g.id === graphicId);
            if (index < 0) {
                console.error(`ERROR: Could not find graphic ("${graphicId}")`);
                return;
            }

            slide.graphics.splice(index, 1, graphic);
            document.dispatchEvent(new CustomEvent("Deck.GraphicUpdated", { detail: { slideId: slide.id, graphicId: graphic.id } }));
        },
        focusGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId?: string }): void => {
            state.focusedGraphicId = graphicId;
            document.dispatchEvent(new CustomEvent("Deck.GraphicFocused", { detail: { slideId: slideId, graphicId: graphicId } }));
        },
        tool: (state: State, toolName: string): void => {
            state.currentTool = toolName;
        },
        styleEditorObject: (state: State, object?: IGraphic): void => {
            state.styleEditor.object = object;
        },
        activeSlide: (state: State, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        canvasZoom: (state: State, zoom: number): void => {
            state.canvas.zoom = Math.max(zoom, 0.25);
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

            const page: string = `${html.outerHTML}${Utilities.deckScript}`;

            const anchor: HTMLAnchorElement = document.createElement("a");
            anchor.setAttribute("href", `data:text/html;charset=UTF-8,${encodeURIComponent(page)}`);
            anchor.setAttribute("download", "deck.html");
            anchor.click();
            anchor.remove();

            while (exportFrame.firstChild) {
                exportFrame.removeChild(exportFrame.firstChild);
            }
        },
        save: (store: any): void => {
            const json: string = JSON.stringify(store.getters.slides);

            const anchor: HTMLAnchorElement = document.createElement("a");
            anchor.setAttribute("href", `data:application/json;charset=UTF-8,${encodeURIComponent(json)}`);
            anchor.setAttribute("download", "deck.json");
            anchor.click();
            anchor.remove();
        },
        resetPresentation: (store: any, presentation: Array<Slide>): void => {
            // Wipe the current slide deck and load the new presentation
            store.state.slides = [];
            presentation.forEach((slide: Slide, index: number): void => {
                store.commit("addSlide", index);

                const slideId: string = store.state.slides[index].id;
                slide.graphics.forEach((graphic: IGraphic): void => {
                    store.commit("addGraphic", { slideId, graphic });
                });
            });

            if (store.state.slides.length > 0) {
                const slideId: string = store.state.slides[0].id;
                store.commit("activeSlide", slideId);
            }
        }
    }
};

Vue.use(Vuex);
export default new Vuex.Store(store);
