import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { TextboxRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";

type TextboxMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

type TextboxMakerHelpers = {
    topLeft: VertexRenderer,
    topRight: VertexRenderer,
    bottomLeft: VertexRenderer,
    bottomRight: VertexRenderer
};

class TextboxMaker {
    private _textbox: TextboxRenderer;
    private _slide: SlideRenderer;
    private _initialPosition: Vector;
    private _helpers: TextboxMakerHelpers;

    constructor(args: TextboxMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;

        // TODO: Aggregate snap vectors here
        // Initialize primary graphic
        this._textbox = new TextboxRenderer({
            id: provideId(),
            slide: this._slide,
            origin: this._initialPosition
        });

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                center: this._textbox.getOrigin(),
                scale: args.scale
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                center: this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0)),
                scale: args.scale
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                center: this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight())),
                scale: args.scale
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                center: this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight())),
                scale: args.scale
            })
        };

        // Render primary graphic
        this._textbox.render();

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public getTarget(): TextboxRenderer {
        return this._textbox;
    }

    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const rawOffset = this._initialPosition.towards(position);
        const absOffset = rawOffset.transform(Math.abs);
        const minOffset = Math.min(absOffset.x, absOffset.y);
        const postShiftOffset = shift ? new Vector(Math.sign(rawOffset.x) * minOffset, Math.sign(rawOffset.y) * minOffset) : rawOffset;

        if (ctrl) {
            const dimensions = postShiftOffset.transform(Math.abs).scale(2);
            const originOffset = postShiftOffset.transform(Math.abs).scale(-1);
            this._textbox.setOrigin(this._initialPosition.add(originOffset));
            this._textbox.setWidth(dimensions.x);
            this._textbox.setHeight(dimensions.y);
        } else {
            const dimensions = postShiftOffset.transform(Math.abs);
            const originOffset = postShiftOffset.scale(0.5).add(dimensions.scale(-0.5));
            this._textbox.setOrigin(this._initialPosition.add(originOffset));
            this._textbox.setWidth(dimensions.x);
            this._textbox.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._textbox.getOrigin());
        this._helpers.topRight.setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight())));
        this._helpers.bottomRight.setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight())));
    }

    public complete(): void {
        this._slide.setGraphic(this._textbox);

        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }
}

export default TextboxMaker;
