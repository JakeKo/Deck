import Vector from "../../utilities/Vector";
import { TextboxRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES } from "../types";

type TextboxMutatorArgs = {
    textbox: TextboxRenderer;
    slide: SlideRenderer;
    scale: number;
};

type TextboxMutatorHelpers = {
    topLeft: VertexRenderer;
    topRight: VertexRenderer;
    bottomLeft: VertexRenderer;
    bottomRight: VertexRenderer;
};

class TextboxMutator implements GraphicMutator {
    private _textbox: TextboxRenderer;
    private _slide: SlideRenderer;
    private _helpers: TextboxMutatorHelpers;

    constructor(args: TextboxMutatorArgs) {
        this._textbox = args.textbox;
        this._slide = args.slide;

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin(),
                scale: args.scale,
                location: 'topLeft'
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0)),
                scale: args.scale,
                location: 'topRight'
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight())),
                scale: args.scale,
                location: 'bottomLeft'
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight())),
                scale: args.scale,
                location: 'bottomRight'
            })
        };

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.TEXTBOX;
    }

    public getTarget(): TextboxRenderer {
        return this._textbox;
    }

    // TODO: Account for shift, alt, and snapping
    public move(origin: Vector): void {
        // Update rendering
        this._textbox.setOrigin(origin);

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._textbox.getOrigin());
        this._helpers.topRight.setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight())));
        this._helpers.bottomRight.setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight())));
    }

    // TODO: Account for shift, alt, ctrl, and snapping
    public setDimensions(dimensions: Vector): void {
        // Update rendering
        this._textbox.setWidth(dimensions.x);
        this._textbox.setHeight(dimensions.y);

        // Update helper graphics
        this._helpers.topRight.setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight())));
        this._helpers.bottomRight.setCenter(this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight())));
    }

    // TODO: Account for shift, alt, and snapping
    public getVertexHandlers(): { [index: string]: () => (position: Vector) => void } {
        const makeHandler = (oppositeCorner: Vector): (position: Vector) => void => {
            return position => {
                const offset = oppositeCorner.towards(position);
                const dimensions = offset.abs;
                const origin = oppositeCorner.add(offset.scale(0.5).add(dimensions.scale(-0.5)));

                // Update rendering
                this._textbox.setOrigin(origin);
                this._textbox.setWidth(dimensions.x);
                this._textbox.setHeight(dimensions.y);

                // Update helper graphics
                this._helpers.topLeft.setCenter(origin);
                this._helpers.topRight.setCenter(origin.add(new Vector(dimensions.x, 0)));
                this._helpers.bottomLeft.setCenter(origin.add(new Vector(0, dimensions.y)));
                this._helpers.bottomRight.setCenter(origin.add(dimensions));
            };
        };

        return {
            'topLeft': () => {
                const oppositeCorner = this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), this._textbox.getHeight()));
                return makeHandler(oppositeCorner);
            },
            'topRight': () => {
                const oppositeCorner = this._textbox.getOrigin().add(new Vector(0, this._textbox.getHeight()));
                return makeHandler(oppositeCorner);
            },
            'bottomLeft': () => {
                const oppositeCorner = this._textbox.getOrigin().add(new Vector(this._textbox.getWidth(), 0));
                return makeHandler(oppositeCorner);
            },
            'bottomRight': () => {
                const oppositeCorner = this._textbox.getOrigin();
                return makeHandler(oppositeCorner);
            }
        };
    }

    // TODO: Include methods for other mutations

    public complete(): void {
        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }

    public setScale(scale: number): void {
        this._helpers.topLeft.setScale(scale);
        this._helpers.topRight.setScale(scale);
        this._helpers.bottomLeft.setScale(scale);
        this._helpers.bottomRight.setScale(scale);
    }
}

export default TextboxMutator;
