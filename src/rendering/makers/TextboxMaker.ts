import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { TextboxRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker, VERTEX_ROLES } from "../types";

type TextboxMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

type TextboxMakerHelpers = { [key in VERTEX_ROLES]: VertexRenderer };

class TextboxMaker implements GraphicMaker {
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
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin(),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0)),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            })
        };

        // Render primary graphic
        this._textbox.render();

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
    }

    public getTarget(): TextboxRenderer {
        return this._textbox;
    }

    public setScale(scale: number): void {
        this._helpers[VERTEX_ROLES.TOP_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
    }

    public complete(): void {
        this._slide.setGraphic(this._textbox);

        // Remove helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
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
        this._helpers[VERTEX_ROLES.TOP_LEFT].setCenter(this._textbox.getOrigin());
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0)));
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setCenter(this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight())));
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight())));
    }
}

export default TextboxMaker;
