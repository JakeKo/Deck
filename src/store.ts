import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import Utilities from './utilities';
import Slide from './models/Slide';
import SnapVector from './models/SnapVector';
import * as SVG from 'svg.js';
import { CursorTool, EllipseTool, PencilTool, PenTool, RectangleTool, TextboxTool } from './models/tools/tools';
import { IRootState, ICanvasTool, IGraphic, GraphicEvent, SlideExportObject } from './types';

const store: StoreOptions<IRootState> = {
    state: {
        activeSlideId: '',
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
        graphicEditorGraphicId: undefined,
        slides: new Array<Slide>(),
        currentTool: 'cursor',
        tools: {
            cursor: new CursorTool(),
            pencil: new PencilTool(),
            pen: new PenTool(),
            rectangle: new RectangleTool(),
            ellipse: new EllipseTool(),
            textbox: new TextboxTool()
        } as { [key: string]: ICanvasTool },
        deckTitle: undefined
    },
    getters: {
        slides: (state: IRootState): Array<Slide> => {
            return state.slides;
        },
        graphic: (state: IRootState): ((slideId: string, graphicId: string) => IGraphic | undefined) => {
            return function (slideId: string, graphicId: string): IGraphic | undefined {
                const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
                if (slide === undefined) {
                    console.error(`ERROR: No slide exists with id: ${slideId}`);
                    return;
                }

                return slide.getGraphic(graphicId);
            };
        },
        snapVectors: (state: IRootState): ((slideId: string) => Array<SnapVector>) => {
            return function (slideId: string): Array<SnapVector> {
                const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
                if (slide === undefined) {
                    console.error(`ERROR: No slide exists with id: ${slideId}`);
                    return [];
                }

                return new Array<SnapVector>(...slide.snapVectors);
            };
        },
        activeSlide: (state: IRootState): Slide | undefined => {
            return state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId)!;
        },
        graphicEditorGraphicId: (state: IRootState): string | undefined => {
            return state.graphicEditorGraphicId;
        },
        graphicEditorGraphic: (state: IRootState): IGraphic | undefined => {
            if (state.graphicEditorGraphicId === undefined) {
                return undefined;
            }

            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${state.activeSlideId}`);
                return;
            }

            return slide.getGraphic(state.graphicEditorGraphicId);
        },
        tool: (state: IRootState): ICanvasTool => {
            return state.tools[state.currentTool];
        },
        toolName: (state: IRootState): string => {
            return state.currentTool;
        },
        focusedGraphic: (state: IRootState): IGraphic | undefined => {
            const activeSlide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === state.activeSlideId);
            return activeSlide === undefined ? undefined : activeSlide.getGraphic(state.focusedGraphicId);
        },
        canvasHeight: (state: IRootState): number => {
            return state.canvas.height;
        },
        canvasWidth: (state: IRootState): number => {
            return state.canvas.width;
        },
        canvasZoom: (state: IRootState): number => {
            return state.canvas.zoom;
        },
        rawViewbox: (state: IRootState): { x: number, y: number, width: number, height: number } => {
            return state.canvas.rawViewbox;
        },
        croppedViewbox: (state: IRootState): { x: number, y: number, width: number, height: number } => {
            return state.canvas.croppedViewbox;
        },
        deckTitle: (state: IRootState): string | undefined => {
            return state.deckTitle;
        }
    },
    mutations: {
        addSlide: (state: IRootState, { index, slide }: { index: number, slide?: Slide }): void => {
            const { width, height } = state.canvas.croppedViewbox;
            state.slides.splice(index, 0, slide || new Slide({ width, height }));
        },
        reorderSlide: (state: IRootState, { source, destination }: { source: number, destination: number }): void => {
            const slide: Slide = state.slides[source];

            if (slide === undefined) {
                console.error(`ERROR: No slide exists at index ${source} to reorder`);
                return;
            }

            state.slides.splice(destination + (destination > source ? 1 : 0), 0, slide);
            state.slides.splice(source + (destination > source ? 0 : 1), 1);
        },
        addGraphic: (state: IRootState, { slideId, graphic }: { slideId: string, graphic: IGraphic }): void => {
            if (graphic === undefined) {
                console.error('ERROR: Attempted to add an undefined graphic');
                return;
            }

            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            slide.graphics.push(graphic);
            document.dispatchEvent(new CustomEvent<GraphicEvent>('Deck.GraphicAdded', { detail: { slideId: slideId, graphicId: graphic.id, graphic: graphic } }));
        },
        removeGraphic: (state: IRootState, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            const graphic: IGraphic = slide.removeGraphic(graphicId);
            document.dispatchEvent(new CustomEvent<GraphicEvent>('Deck.GraphicRemoved', { detail: { slideId, graphicId, graphic } }));
        },
        updateGraphic: (state: IRootState, { slideId, graphicId, graphic }: { slideId: string, graphicId: string, graphic: IGraphic }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: Could not find slide ('${slideId}')`);
                return;
            }

            // Update the graphic
            const index: number = slide.graphics.findIndex((g: IGraphic): boolean => g.id === graphicId);
            if (index < 0) {
                console.error(`ERROR: Could not find graphic ('${graphicId}')`);
                return;
            }

            slide.graphics[index] = graphic;
            document.dispatchEvent(new CustomEvent<GraphicEvent>('Deck.GraphicUpdated', { detail: { slideId: slide.id, graphicId: graphic.id, graphic: graphic } }));
        },
        focusGraphic: (state: IRootState, { slideId, graphicId }: { slideId: string, graphicId?: string }): void => {
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
            document.dispatchEvent(new CustomEvent<GraphicEvent>('Deck.GraphicFocused', { detail: { slideId: slideId, graphicId: graphicId, graphic: graphic } }));
        },
        tool: (state: IRootState, toolName: string): void => {
            console.log(toolName);
            state.currentTool = toolName;
        },
        graphicEditorGraphicId: (state: IRootState, graphicId?: string): void => {
            state.graphicEditorGraphicId = graphicId;
        },
        activeSlide: (state: IRootState, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        canvasZoom: (state: IRootState, zoom: number): void => {
            state.canvas.zoom = Math.max(zoom, 0.25);
        },
        removeSnapVectors: (state: IRootState, { slideId, graphicId }: { slideId: string, graphicId: string }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            slide.snapVectors = new Set<SnapVector>([...slide.snapVectors].filter((snapVector: SnapVector): boolean => snapVector.graphicId !== graphicId));
        },
        addSnapVectors: (state: IRootState, { slideId, snapVectors }: { slideId: string, snapVectors: Array<SnapVector> }): void => {
            const slide: Slide | undefined = state.slides.find((slide: Slide): boolean => slide.id === slideId);
            if (slide === undefined) {
                console.error(`ERROR: No slide exists with id: ${slideId}`);
                return;
            }

            slide.addSnapVectors(...snapVectors);
        },
        deckTitle: (state: IRootState, deckTitle: string): void => {
            state.deckTitle = deckTitle === '' ? undefined : deckTitle;
        },
        setTopic: (state: IRootState, { index, topic }: { index: number, topic: string }): void => {
            state.slides[index].topic = topic;
        }
    },
    actions: {
        save: (store: any): void => {
            // Construct the slides on a hidden element
            const exportFrame: HTMLElement = document.getElementById('export-frame')!;
            store.getters.slides.forEach((slideModel: Slide): void => {
                const slide: HTMLDivElement = document.createElement('div');
                slide.setAttribute('id', slideModel.id);
                slide.setAttribute('class', 'slide');
                exportFrame.appendChild(slide);

                const viewbox: { x: number, y: number, width: number, height: number } = store.getters.croppedViewbox;
                const canvas: SVG.Doc = SVG(slideModel.id).viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
                slideModel.graphics.forEach((graphic: IGraphic): void => void graphic.render(canvas));
            });

            // Copy the slides over to the exported object and clear the hidden element
            const body: HTMLBodyElement = document.createElement('body');
            body.innerHTML = exportFrame.innerHTML;
            while (exportFrame.firstChild) {
                exportFrame.removeChild(exportFrame.firstChild);
            }

            const html: HTMLHtmlElement = document.createElement('html');
            const head: HTMLHeadElement = document.createElement('head');
            const meta: HTMLMetaElement = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0';
            head.appendChild(meta);
            html.appendChild(head);
            html.appendChild(body);

            const page: string = `
                ${html.outerHTML}
                ${Utilities.deckScript}
                <script>
                // BEGIN SLIDE DATA ${JSON.stringify(store.getters.slides.map((slide: Slide): SlideExportObject => slide.toExportObject()))} END SLIDE DATA
                </script>
            `;

            const anchor: HTMLAnchorElement = document.createElement('a');
            anchor.setAttribute('href', `data:text/html;charset=UTF-8,${encodeURIComponent(page)}`);
            anchor.setAttribute('download', `${store.getters.deckTitle || 'Untitled'}.html`);
            anchor.click();
            anchor.remove();
        },
        resetPresentation: (store: any, presentation: Array<Slide>): void => {
            // Wipe the current slide deck
            store.state.slides = [];
            store.commit('activeSlide', undefined);
            presentation.forEach((slide: Slide, index: number): void => store.commit('addSlide', { index, slide }));

            // If the new slide deck is non-empty, focus the first slide
            if (store.state.slides.length > 0) {
                store.commit('activeSlide', store.state.slides[0].id);
            }
        }
    }
};

Vue.use(Vuex);
export default new Vuex.Store<IRootState>(store);
