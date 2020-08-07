# Graphic Makers

Makers and mutators behave similarly in that they follow the same three step process:
1. Initialize with a few necessary properties and render helper graphics
2. Expose a suite of interaction listeners (typically for mouse events), updating helper graphics as necessary
3. Wrap up with a completion operation that removes helpers graphics

While the current makers look pretty similar, there are some slight distinctions in what listeners they expose and how they make their respective graphic. A quick summary of the ways in which makers differ is below.

### `CurveMaker`
* It does not expose a resize listener
* It exposes an add anchor listener which will create anchors on mousedown
* The add anchor listener implements more involed logic to support click-and-drag action for setting curve anchors and control points

### `EllipseMaker`
* It exposes a resize listener, but implements unique logic to set the center of the ellipse instead of the origin
* Width and height can be set to arbitrary non-negative values

### `ImageMaker`
* It exposes a rectangle-based resize listener that sets the origin, width, and height
* Resizing an image upon creation is constrained to the aspect ratio of the image - the width and height cannot be set arbitrarily

### `RectangleMaker`
* It exposes a rectangle-based resize listener that sets the origin, width, and height
* Width and height can be set to arbitrary non-negative values

### `TextboxMaker`
* It exposes a rectangle-based resize listener that sets the origin, width, and height
* Width and height can be set to arbitrary non-negative values

### `VideoMaker`
* It exposes a rectangle-based resize listener that sets the origin, width, and height
* Resizing a video upon creation is constrained to the aspect ratio of the image - the width and height cannot be set arbitrarily

## Type Structure
The generic `GraphicMaker` type and individual maker types are featured below.
```ts
type GraphicMaker = {
    getTarget: () => GraphicRenderer;
    setScale: (scale: number) => void;
    complete: () => void;
}

type CurveMaker = {
    addAnchorListener: () => {
        setPoint: (event: SlideMouseEvent) => void;
        setHandles: (event: SlideMouseEvent) => void;
    };
} & GraphicMaker;

type EllipseMaker = {
    resizeListener: () => (event: SlideMouseEvent) => void;
} & GraphicMaker;

type ImageMaker = {
    resizeListener: () => (event: SlideMouseEvent) => void;
} & GraphicMaker;

type RectangleMaker = {
    resizeListener: () => (event: SlideMouseEvent) => void;
} & GraphicMaker;

type TextboxMaker = {
    resizeListener: () => (event: SlideMouseEvent) => void;
} & GraphicMaker;

type VideoMaker = {
    resizeListener: () => (event: SlideMouseEvent) => void;
} & GraphicMaker;
```
