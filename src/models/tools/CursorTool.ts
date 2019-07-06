import { IGraphic, CustomGraphicMouseEvent, CustomMouseEvent, ISlideWrapper, Snap } from "../../types";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import Sketch from "../graphics/Sketch";
import CanvasMouseEvent from "../CanvasMouseEvent";
import CanvasTool from "./CanvasTool";
import Utilities from "../../utilities/general";

export default class CursorTool extends CanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): () => void {
        return (): void => {
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("graphicEditorGraphicId", undefined);
        };
    }

    public graphicMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("pointer");
    }

    public graphicMouseOut(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("default");
    }

    public graphicMouseDown(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void {
        return function (event: CustomGraphicMouseEvent): void {
            // Stop propagation of the event when clicking on a graphic so the event does not propagate to the canvas level
            // Otherwise, the graphicEditorGraphicId will be set to undefined
            event.detail.baseEvent.stopPropagation();

            const graphic: IGraphic | undefined = slideWrapper.store.getters.graphic(slideWrapper.slideId, event.detail.graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: Could not find a graphic with the id: ${event.detail.graphicId}`);
                return;
            }

            // Create preview lines to show snapping
            const snapHighlights: Array<Sketch> = [];

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: graphic.id });
            slideWrapper.store.commit("graphicEditorGraphicId", graphic.id);
            slideWrapper.store.commit("removeSnapVectors", { slideId: slideWrapper.slideId, graphicId: graphic.id });

            const initialOrigin: Vector = new Vector(graphic.origin.x, graphic.origin.y);
            const initialPosition: Vector = slideWrapper.getPosition(event);
            const snapVectors: Array<SnapVector> = slideWrapper.store.getters.snapVectors(slideWrapper.slideId);
            const snappableVectorOffsets: Array<Vector> = graphic.getSnappableVectors().map((snappableVector: Vector): Vector => initialPosition.towards(snappableVector));
            let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            let shiftPressed = false;

            document.addEventListener("Deck.CanvasMouseMove", preview as EventListener);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);
            document.addEventListener("keydown", toggleStrictMovement);
            document.addEventListener("keyup", toggleStrictMovement);

            // Preview moving shape
            function preview(event: CustomMouseEvent): void {
                graphic!.anchorIds.forEach((anchorId: string): void => slideWrapper.removeGraphic(anchorId));
                lastPosition = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
                const position: Vector = slideWrapper.getPosition(event);
                let movement: Vector = initialPosition.towards(position);
                const projection: Vector = Utilities.getStrictProjectionVector(movement);

                // Remove the old snap highlights
                snapHighlights.forEach((snapHighlight: Sketch): void => slideWrapper.store.commit("removeGraphic", { slideId: slideWrapper.slideId, graphicId: snapHighlight.id }));
                snapHighlights.length = 0;

                // Do not perform any snapping if the alt key is pressed
                if (!event.detail.baseEvent.altKey) {
                    const snappableVectors: Array<Vector> = snappableVectorOffsets.map<Vector>((offset: Vector): Vector => position.add(offset));
                    const snaps: Array<Snap> = Utilities.getSnaps(snapVectors, snappableVectors);
                    const snapLineScale: number = 5000;

                    snaps.forEach((snap: Snap): void => {
                        const snapAngle: number = Utilities.getTranslation(snap).theta(projection);
                        const snapIsNotParallel: boolean = snapAngle !== 0 && snapAngle !== Math.PI;
                        if (event.detail.baseEvent.shiftKey && snapIsNotParallel) {
                            return;
                        }

                        movement = movement.add(Utilities.getTranslation(snap));

                        const snapHighlight: Sketch = new Sketch({
                            supplementary: true,
                            origin: snap.destination.origin,
                            points: [snap.destination.direction.scale(-snapLineScale), snap.destination.direction.scale(snapLineScale)],
                            strokeWidth: 2,
                            strokeColor: "hotpink"
                        });

                        slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: snapHighlight });
                        snapHighlights.push(snapHighlight);
                    });
                }

                graphic!.origin = event.detail.baseEvent.shiftKey ? initialOrigin.add(movement.projectOn(projection)) : initialOrigin.add(movement);
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
            }

            // End moving shape
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview as EventListener);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);
                document.removeEventListener("keydown", toggleStrictMovement);
                document.removeEventListener("keyup", toggleStrictMovement);

                // Add the new SnapVectors once the graphic move has been finalized
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.slideId, snapVectors: graphic!.getSnapVectors() });
                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id });

                // Remove the old snap highlights
                snapHighlights.forEach((snapHighlight: Sketch): void => slideWrapper.store.commit("removeGraphic", { slideId: slideWrapper.slideId, graphicId: snapHighlight.id }));
                snapHighlights.length = 0;
            }

            function toggleStrictMovement(event: KeyboardEvent): void {
                if (event.key !== "Shift" || (event.type === "keydown" && shiftPressed)) {
                    return;
                }

                shiftPressed = event.type === "keydown";
                document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseMove", {
                    detail: new CanvasMouseEvent(
                        new MouseEvent("mousemove", {
                            shiftKey: event.type === "keydown",
                            clientX: lastPosition.x,
                            clientY: lastPosition.y
                        }),
                        slideWrapper.slideId
                    )
                }));
            }
        };
    }
}
