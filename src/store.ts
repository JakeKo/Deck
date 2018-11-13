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
            width: 500,
            object: undefined
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
            return state.slides[0];
        },
        lastSlide: (state): SlideModel => {
            return state.slides[state.slides.length - 1];
        },
        activeSlide: (state): SlideModel => {
            return Utilities.getSlide(state.slides, state.activeSlideId)!;
        },
        styleEditorWidth: (state): number => {
            return state.styleEditor.width;
        },
        styleEditorObject: (state): any => {
            return state.styleEditor.object;
        },
        roadmapHeight: (state): number => {
            return state.roadmap.height;
        },
        theme: (state): Theme => {
            return state.themes[state.theme];
        }
    },
    mutations: {
        addSlide: (state, slideId: string): void => {
            const index: number = slideId ? state.slides.findIndex((slide: SlideModel) => slide.id === slideId) : -1;
            state.slides.splice(index + 1, 0, new SlideModel());
        },
        mountTool: (state, { tool, slideId }: { tool: string, slideId: string }): void => {
            // TODO: Mount specific tool
            console.log(tool);
            console.log(slideId);
            state.activeSlideId = slideId;
        },
        styleEditorWidth: (state, width: number): void => {
            state.styleEditor.width = width;
        },
        styleEditorObject: (state, object: any): void => {
            // Object is of type any because styleEditor.object is initialized as undefined
            state.styleEditor.object = object;
        },
        roadmapHeight: (state, height: number): void => {
            state.roadmap.height = height;
        },
        activeSlide: (state, slideId: string): void => {
            state.activeSlideId = slideId;
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
                slideModel.graphics.forEach((element: GrahpicModel) => {
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
