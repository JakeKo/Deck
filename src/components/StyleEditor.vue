<template>
<div id="style-editor">
    <div class="stretcher-horizontal left" @mousedown="stretch"></div>
    <div id="style-editor-header">Style Editor</div>
    <div id="style-editor-interaction-message" v-show="$store.getters.focusedGraphic === undefined">Click on a graphic to edit its properties.</div>
    <form id="style-editor-form" v-show="$store.getters.focusedGraphic !== undefined">
        <textarea id="style-editor-content" v-model="content" @keydown="$event.stopPropagation()"></textarea>
        <button id="submit-button" @click="submit">Update Graphic</button>
    </form>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Utilities from "../utilities/general";
import IGraphic from "../models/graphics/IGraphic";
import Sketch from "../models/graphics/Sketch";
import Curve from "../models/graphics/Curve";
import Image from "../models/graphics/Image";
import Point from "../models/Point";
import Video from "../models/graphics/Video";

function toPrettyString(object: any, indentDepth: number): string {
    const properties: Array<string> = [];
    for (const property in object) {
        const value: any = object[property];
        const prefix: string = Array.isArray(object) ? space(indentDepth) : `${space(indentDepth)}"${property}": `;

        if (typeof value === "number" || typeof value === "boolean") {
            properties.push(`${prefix}${value}`);
        } else if (typeof value === "string") {
            properties.push(`${prefix}${JSON.stringify(value)}`);
        } else if (Array.isArray(value) || typeof value === "object") {
            properties.push(`${prefix}${toPrettyString(value, indentDepth + 1)}`);
        }
    }

    const prettyString: string = `\n${properties.join(",\n")}\n${space(indentDepth - 1)}`;
    return Array.isArray(object) ? `[${prettyString}]` : `{${prettyString}}`;

    function space(indentDepth: number): string {
        return new Array(indentDepth * 4).fill(" ").join("");
    }
}

@Component
export default class StyleEditor extends Vue {
    private content: string = "";

    @Watch("object") private onObjectChanged(): void {
        // Set immutable properties to undefined
        const json: any = JSON.parse(JSON.stringify(this.object || {}));
        json.id = undefined;
        json.boundingBox = undefined;
        json.boundingBoxId = undefined;
        json.points = undefined;
        json.type = undefined;
        json.source = undefined;
        json.metadataLoaded = undefined;

        this.content = toPrettyString(json, 1);
    }

    // Watch for changes to the style editor object
    get object(): IGraphic {
        return this.$store.getters.styleEditorObject;
    }

    private stretch(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("mousemove", preview);
        document.addEventListener("mouseup", end);

        const self = this;
        function preview(event: MouseEvent): void {
            (self.$el as HTMLElement).style.width = `${window.innerWidth - event.pageX}px`;
        }

        function end(): void {
            document.removeEventListener("mousemove", preview);
            document.removeEventListener("mouseup", end);
        }
    }

    private submit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        // TODO: Style editor content validation
        const json: any = JSON.parse(this.content);
        json.id = this.object.id;
        json.type = this.object.type;

        if (this.object instanceof Sketch || this.object instanceof Curve) {
            json.points = this.object.points.map<Array<any>>((point: Point): any => ({ x: point.x, y: point.y }));
        }

        if (this.object instanceof Image || this.object instanceof Video) {
            json.source = this.object.source;
        }

        const graphic: IGraphic = Utilities.parseGraphic(json);
        graphic.boundingBoxId = this.object.boundingBoxId;
        this.$store.commit("updateGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: graphic.id, graphic: graphic });
        this.$store.commit("focusGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: graphic.id });
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#style-editor {
    position: relative;
    display: flex;
    flex-direction: column;
    background: $color-primary;
    border-left: 1px solid $color-tertiary;
    flex-shrink: 0;
    width: 350px;
    min-width: 96px;
}

#style-editor-header {
    font-family: "Roboto Slab";
    font-size: 16px;
    font-weight: 700;
    padding: 8px;
    box-sizing: border-box;
    border-bottom: 1px solid $color-tertiary;
}

#style-editor-interaction-message {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    padding: 36px;
    box-sizing: border-box;
    font-family: "Roboto Mono";
    color: $color-dark;
    font-size: 14px;
    text-align: center;
}

#style-editor-form {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

#style-editor-content {
    font-family: "Roboto Mono";
    font-size: 14px;
    border: none;
    outline: none;
    flex-grow: 1;
    width: 100%;
    resize: none;
    box-sizing: border-box;
    padding: 8px;
}

#submit-button {
    height: 48px;
    cursor: pointer;
    border: none;
    outline: none;
    background: $color-secondary;
    color: $color-dark;
    font-family: "Roboto Slab";
}
</style>
