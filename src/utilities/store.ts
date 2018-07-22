import SlideModel from "../models/SlideModel";

export const getSlide = (slides: SlideModel[], slideId: string): SlideModel => {
    const slide = slides.filter((s) => s.id === slideId);

    if (slide.length != 1) {
        console.error(`There are ${slide.length} slides with the given id: ${slideId}`);
    }

    return slide[0];
};
