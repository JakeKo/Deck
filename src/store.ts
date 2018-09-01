import Vue from "vue";
import Vuex from "vuex";
import ShapeModel from "./models/ShapeModel";
import SlideModel from "./models/SlideModel";
import TextboxModel from "./models/TextboxModel";
import Point from "./models/Point";
import * as Utilities from "./utilities/store";
import ISlideElement from "./models/ISlideElement";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        activeSlideId: "",
        canvas: {
            height: 2000,
            width: 4000
        },
        styleEditor: {
            width: 300
        },
        roadmap: {
            height: 96
        },
        slides: new Array<SlideModel>()
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
        activeSlide: (state): SlideModel | undefined => {
            return state.slides.length === 0 ? undefined : Utilities.getSlide(state.slides, state.activeSlideId);
        },
        focusedElement: (state): ISlideElement | undefined => {
            const activeSlide: SlideModel = Utilities.getSlide(state.slides, state.activeSlideId);
            const elements: ISlideElement[] = activeSlide.elements.filter((element) => element.id === activeSlide.focusedElementId);

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
        activeSlideShapes: (state): ShapeModel[] => {
            const activeSlide = Utilities.getSlide(state.slides, state.activeSlideId);
            const shapes = new Array<ShapeModel>();

            activeSlide.elements.forEach((element) => {
                if (element instanceof ShapeModel) {
                    shapes.push(element);
                }
            });

            return shapes;
        },
        activeSlideTextboxes: (state): TextboxModel[] => {
            const activeSlide = Utilities.getSlide(state.slides, state.activeSlideId);
            const textboxes = new Array<TextboxModel>();

            activeSlide.elements.forEach((element) => {
                if (element instanceof TextboxModel) {
                    textboxes.push(element);
                }
            });

            return textboxes;
        }
    },
    mutations: {
        setActiveSlide: (state, slideId: string): void => {
            state.activeSlideId = slideId;
        },
        setFocusedElement: (state, shapeId: string): void => {
            const activeSlide = Utilities.getSlide(state.slides, state.activeSlideId);
            activeSlide.focusedElementId = shapeId;
        },
        addSlideAfterSlideWithId: (state, slideId: string): void => {
            const newSlide: SlideModel = new SlideModel();
            const index: number = slideId ? state.slides.indexOf(Utilities.getSlide(state.slides, slideId)) : 0;
            state.slides.splice(index + 1, 0, newSlide);
            state.activeSlideId = newSlide.id;
        },
        addShapeToSlideWithId: (state, slideId: string): void => {
            const shape: ShapeModel = new ShapeModel({
                points: [
                    new Point(100, 10),
                    new Point(40, 198),
                    new Point(190, 78),
                    new Point(10, 78),
                    new Point(160, 198)
                ]
            });
            const slide: SlideModel = Utilities.getSlide(state.slides, slideId);
            slide.elements.push(shape);
        },
        addTextboxToSlideWithId: (state, slideId: string): void => {
            const slide: SlideModel = Utilities.getSlide(state.slides, slideId);
            slide.elements.push(new TextboxModel());
        },
        setStyleEditorWidth: (state, width: number): void => {
            state.styleEditor.width = width;
        },
        setRoadmapHeight: (state, height: number): void => {
            state.roadmap.height = height;
        }
    }
});
