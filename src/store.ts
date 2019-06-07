import Vue from "vue";
import Vuex from "vuex";
import Utilities from "./utilities/general";
import IGraphic from "./models/graphics/IGraphic";
import Slide from "./models/Slide";
import GraphicEvent from "./models/GraphicEvent";
import SnapVector from "./models/SnapVector";
import * as SVG from "svg.js";

import ICanvasTool from "./models/tools/ICanvasTool";
import CursorTool from "./models/tools/CursorTool";
import EllipseTool from "./models/tools/EllipseTool";
import PencilTool from "./models/tools/PencilTool";
import PenTool from "./models/tools/PenTool";
import RectangleTool from "./models/tools/RectangleTool";
import TextboxTool from "./models/tools/TextboxTool";
import Vector from "./models/Vector";

type State = {
    activeSlideId: string,
    focusedGraphicId: string | undefined,
    canvas: {
        height: number,
        width: number,
        zoom: number,
        rawViewbox: {
            x: number,
            y: number,
            width: number,
            height: number
        },
        croppedViewbox: {
            x: number,
            y: number,
            width: number,
            height: number
        }
    },
    graphicEditor: {
        object: any
    },
    slides: Array<Slide>,
    currentTool: string,
    tools: { [key: string]: ICanvasTool }
};

type Getters = {
    slides: (state: State) => Array<Slide>,
    graphic: (state: State) => (slideId: string, graphicId: string) => IGraphic | undefined,
    snapVectors: (state: State) => (slideId: string) => Array<SnapVector>,
    activeSlide: (state: State) => Slide | undefined,
    graphicEditorObject: (state: State) => any,
    tool: (state: State) => ICanvasTool,
    toolName: (state: State) => string,
    focusedGraphic: (state: State) => IGraphic | undefined,
    canvasHeight: (state: State) => number,
    canvasWidth: (state: State) => number,
    canvasZoom: (state: State) => number,
    rawViewbox: (state: State) => { x: number, y: number, width: number, height: number },
    croppedViewbox: (state: State) => { x: number, y: number, width: number, height: number }
};

type Mutations = {
    addSlide: (state: State, index: number) => void,
    reorderSlide: (state: State, { source, destination }: { source: number, destination: number }) => void,
    addGraphic: (state: State, { slideId, graphic }: { slideId: string, graphic: IGraphic }) => void,
    removeGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId: string }) => void,
    updateGraphic: (state: State, { slideId, graphicId, graphic }: { slideId: string, graphicId: string, graphic: IGraphic }) => void,
    focusGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId?: string }) => void,
    tool: (state: State, toolName: string) => void,
    graphicEditorObject: (state: State, object?: IGraphic) => void,
    activeSlide: (state: State, slideId: string) => void,
    canvasZoom: (state: State, zoom: number) => void,
    removeSnapVectors: (state: State, { slideId, graphicId }: { slideId: string, graphicId: string }) => void,
    addSnapVectors: (state: State, { slideId, snapVectors }: { slideId: string, snapVectors: Array<SnapVector> }) => void
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
            width: 4000,
            height: 2250,
            zoom: 1,
            rawViewbox: {
                x: -4000 / 3,
                y: -2250 / 3,
                width: 4000,
                height: 2250
            },
            croppedViewbox: {
                x: 0,
                y: 0,
                width: 4000 / 3,
                height: 2250 / 3
            }
        },
        graphicEditor: {
            object: undefined
        },
        slides: new Array<Slide>(),
        currentTool: "cursor",
        tools: {
            cursor: new CursorTool(),
            pencil: new PencilTool(),
            pen: new PenTool(),
            rectangle: new RectangleTool(),
            ellipse: new EllipseTool(),
            textbox: new TextboxTool()
        } as { [key: string]: ICanvasTool }
    },
    getters: {
        slides: (state: State): Array<Slide> => {
            return state.slides;
        },
        graphic: (state: State): ((slideId: string, graphicId: string) => IGraphic | undefined) => {
            return function (slideId: string, graphicId: string): IGraphic | undefined {
                const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
                if (slide === undefined) {
                    console.error(`ERROR: No slide exists with id: ${slideId}`);
                    return;
                }

                const index: number = slide.graphics.findIndex((graphic: IGraphic): boolean => graphic.id === graphicId);
                if (index < 0) {
                    console.error(`ERROR: Could not find graphic ("${graphicId}")`);
                    return;
                }

                return slide.graphics[index];
            };
        },
        snapVectors: (state: State): ((slideId: string) => Array<SnapVector>) => {
            return function (slideId: string): Array<SnapVector> {
                const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
                if (slide === undefined) {
                    console.error(`ERROR: No slide exists with id: ${slideId}`);
                    return [];
                }

                return slide.snapVectors;
            };
        },
        activeSlide: (state: State): Slide | undefined => {
            return state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId)!;
        },
        graphicEditorObject: (state: State): any => {
            return state.graphicEditor.object;
        },
        tool: (state: State): ICanvasTool => {
            return state.tools[state.currentTool];
        },
        toolName: (state: State): string => {
            return state.currentTool;
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
        rawViewbox: (state: State): { x: number, y: number, width: number, height: number } => {
            return state.canvas.rawViewbox;
        },
        croppedViewbox: (state: State): { x: number, y: number, width: number, height: number } => {
            return state.canvas.croppedViewbox;
        }
    },
    mutations: {
        addSlide: (state: State, index: number): void => {
            const slide: Slide = new Slide();
            const { width, height } = state.canvas.croppedViewbox;
            slide.snapVectors.push(new SnapVector("slide", new Vector(width / 2, 0), Vector.right));
            slide.snapVectors.push(new SnapVector("slide", new Vector(width, height / 2), Vector.up));
            slide.snapVectors.push(new SnapVector("slide", new Vector(width / 2, height), Vector.right));
            slide.snapVectors.push(new SnapVector("slide", new Vector(0, height / 2), Vector.up));
            slide.snapVectors.push(new SnapVector("slide", new Vector(width / 2, height / 2), Vector.right));
            slide.snapVectors.push(new SnapVector("slide", new Vector(width / 2, height / 2), Vector.up));

            state.slides.splice(index, 0, slide);
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
            document.dispatchEvent(new CustomEvent<GraphicEvent>("Deck.GraphicAdded", { detail: { slideId: slideId, graphicId: graphic.id, graphic: graphic } }));
        },
        removeGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            const index: number = slide.graphics.findIndex((graphic: IGraphic): boolean => graphic.id === graphicId);
            if (index < 0) {
                console.error(`ERROR: Could not find graphic ("${graphicId}")`);
                return;
            }

            const graphic: IGraphic = slide.graphics.splice(index, 1)[0];
            document.dispatchEvent(new CustomEvent<GraphicEvent>("Deck.GraphicRemoved", { detail: { slideId: slideId, graphicId: graphicId, graphic: graphic } }));
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

            slide.graphics[index] = graphic;
            document.dispatchEvent(new CustomEvent<GraphicEvent>("Deck.GraphicUpdated", { detail: { slideId: slide.id, graphicId: graphic.id, graphic: graphic } }));
        },
        focusGraphic: (state: State, { slideId, graphicId }: { slideId: string, graphicId?: string }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            const graphic: IGraphic | undefined = slide.graphics.find((graphic: IGraphic): boolean => graphic.id === graphicId);
            if (graphicId !== undefined && graphic === undefined) {
                console.error(`ERROR: No graphic (${graphicId}) exists on slide (${slideId})`);
                return;
            }

            state.focusedGraphicId = graphicId;
            document.dispatchEvent(new CustomEvent<GraphicEvent>("Deck.GraphicFocused", { detail: { slideId: slideId, graphicId: graphicId, graphic: graphic } }));
        },
        tool: (state: State, toolName: string): void => {
            state.currentTool = toolName;
        },
        graphicEditorObject: (state: State, object?: IGraphic): void => {
            state.graphicEditor.object = object;
        },
        activeSlide: (state: State, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        canvasZoom: (state: State, zoom: number): void => {
            state.canvas.zoom = Math.max(zoom, 0.25);
        },
        removeSnapVectors: (state: State, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            slide.snapVectors = slide.snapVectors.filter((snapVector: SnapVector): boolean => snapVector.graphicId !== graphicId);
        },
        addSnapVectors: (state: State, { slideId, snapVectors }: { slideId: string, snapVectors: Array<SnapVector> }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            slide.snapVectors.push(...snapVectors);
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

                const viewbox: { x: number, y: number, width: number, height: number } = store.getters.croppedViewbox;
                const canvas: SVG.Doc = SVG(slideModel.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
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
