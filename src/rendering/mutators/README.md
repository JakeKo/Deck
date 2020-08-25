# Graphic Mutators

Mutators provide an interface for editing graphics in an interactive way by rendering helper graphics, initializing listeners for different mouse events, and cleaning up when the interaction is complete.

![Mutating block gif](https://media.giphy.com/media/ffd0F6WNcRJMQ/giphy.gif)

Makers and mutators behave similarly in that they follow the same three-step process:
1. Initialize with a few necessary properties and render helper graphics
2. Expose a suite of interaction listeners (typically for mouse events), updating helper graphics as necessary
3. Wrap up with a completion operation that removes helpers graphics

Nearly all of the graphic mutators implement the generic mutator interface with no extensions. The exception to this is the curve mutator which also exposes a listener for handling interactions with curve anchors and control points.

## Type Structure
The generic `GraphicMutator` type and individual maker types are featured below.
```ts
type GraphicMutator = {
    type: GRAPHIC_TYPES;
    target: GraphicRenderer;
    scale: number;
    helpers: BoundingBoxMutatorHelpers;
    vertexListener: (role: VERTEX_ROLES) => (event: SlideMouseEvent) => void;
    rotateListener: () => (event: SlideMouseEvent) => void;
    moveListener: (initialPosition: Vector) => (event: SlideMouseEvent) => void;
    complete: () => void;
}

type CurveMutator = GraphicMutator & {
    anchorListener: (index: number, role: CURVE_ANCHOR_ROLES) => (event: SlideMouseEvent) => void;
};

type EllipseMutator = GraphicMutator;

type ImageMutator = GraphicMutator;

type RectangleMutator = GraphicMutator;

type TextboxMutator = GraphicMutator;

type VideoMutator = GraphicMutator;
```
