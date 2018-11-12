import Vue from "vue";
import Vuex from "vuex";
import SlideModel from "./models/SlideModel";
import Utilities from "./Utilities";
import Theme from "./models/Theme";
import GrahpicModel from "./models/GraphicModel";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        canvas: {
            height: 2000,
            width: 4000
        },
        styleEditor: {
            width: 500
        },
        roadmap: {
            height: 96
        },
        slides: new Array<SlideModel>(),
        theme: 0,
        themes: [
            new Theme("light", "#FFFFFF", "#EEEEEE", "#DDDDDD", "#275DAD", "#2FBF71" ,"#ED7D3A", "#A22C29"),
            new Theme("dark", "", "", "", "", "", "", "")
        ]
    },
    getters: {
        slides: (state): SlideModel[] => {
            return state.slides;
        },
        firstSlide: (state): SlideModel => {
            if (state.slides.length === 0) {
                console.error("There are 0 slides");
            }

            return state.slides[0];
        },
        lastSlide: (state): SlideModel => {
            if (state.slides.length === 0) {
                console.error("There are 0 slides");
            }

            return state.slides[state.slides.length - 1];
        },
        activeSlide: (state): SlideModel | undefined => {
            return state.slides.length === 0 ? undefined : Utilities.getSlide(state.slides, state.activeSlideId);
        },
        focusedElement: (state): GrahpicModel | undefined => {
            const activeSlide: SlideModel | undefined = Utilities.getSlide(state.slides, state.activeSlideId);
            const elements: GrahpicModel[] = activeSlide!.elements.filter((element) => element.id === activeSlide!.focusedElementId);

            if (elements.length > 1 || elements.length < 0) {
                console.error(`There are ${elements.length} focused elements`);
                return undefined;
            } else if (elements.length === 0) {
                return undefined;
            }

            return elements[0];
        },
        styleEditorWidth: (state): number => {
            return state.styleEditor.width;
        },
        roadmapHeight: (state): number => {
            return state.roadmap.height;
        },
        activeSlideShapes: (state): GrahpicModel[] => {
            const activeSlide = Utilities.getSlide(state.slides, state.activeSlideId);
            const shapes = new Array<GrahpicModel>();

            activeSlide!.elements.forEach((element) => {
                if (element instanceof GrahpicModel) {
                    shapes.push(element);
                }
            });

            return shapes;
        },
        theme: (state): Theme => {
            return state.themes[state.theme];
        }
    },
    mutations: {
        setActiveSlide: (state, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        setFocusedElement: (state, shapeId: string): void => {
            const activeSlide = Utilities.getSlide(state.slides, state.activeSlideId);
            activeSlide!.focusedElementId = shapeId;
        },
        addSlideAfterSlideWithId: (state, slideId: string): void => {
            const newSlide: SlideModel = new SlideModel();
            const index: number = slideId ? state.slides.indexOf(Utilities.getSlide(state.slides, slideId)!) : 0;
            state.slides.splice(index + 1, 0, newSlide);
            state.activeSlideId = newSlide.id;
        },
        mountTool: (state, { tool, slideId }: { tool: string, slideId: string }): void => {
            // TODO: Mount specific tool
            console.log(tool);
            console.log(slideId);
            state.activeSlideId = slideId;
        },
        setStyleEditorWidth: (state, width: number): void => {
            state.styleEditor.width = width;
        },
        setRoadmapHeight: (state, height: number): void => {
            state.roadmap.height = height;
        },
        onGraphicFocused: (state, graphic: GrahpicModel): void => {
            console.log(graphic);
        }
    },
    actions: {
        export: (store): void => {
            const html = document.createElement("html");

            html.appendChild(document.createElement("head"));
            // Append metadata to head element

            const body = document.createElement("body");
            store.getters.slides.forEach((slideModel: SlideModel) => {
                const slide: HTMLElement = document.createElement("svg");
                slide.setAttribute("id", slideModel.id);
                slide.setAttribute("class", "slide");

                // TODO: Use svg.js to programmatically add graphics
                slideModel.elements.forEach((element: GrahpicModel) => {
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
