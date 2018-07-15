import SlideModel from "../models/SlideModel";

export const getSlide = (slides: Array<SlideModel>, slideId: String): SlideModel => {
    const slide = slides.filter((s) => s.id === slideId);

    if (slide.length > 1) {
        console.error(`There are ${slide.length} slides with the given id: ${slideId}`);
    } else if (slide.length === 0) {
        console.error(`There is no slide with the given id: ${slideId}`);
    }

    return slide[0];
};
