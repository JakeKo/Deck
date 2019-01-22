<template>
<div id="style-editor">
    <div class="stretcher-horizontal left" @mousedown="stretch"></div>
    <textarea id="style-editor-content" v-model="content" @keydown="$event.stopPropagation()"></textarea>
    <div id="submit-button-container">
        <button id="submit-button" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Utilities from "../utilities/general";
import IGraphic from "../models/IGraphic";
import Sketch from "../models/Sketch";
import Curve from "../models/Curve";
import Point from "../models/Point";

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
            json.points = (this.object as Sketch).points.map<Array<any>>((point: Point): any => ({ x: point.x, y: point.y }));
        }

        const graphic: IGraphic = Utilities.parseGraphic(json);
        graphic.boundingBoxId = this.object.boundingBoxId;
        this.$store.commit("updateGraphic", graphic);
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
    width: 256px;
    min-width: 96px;
}

#style-editor-content {
    font-family: monospace;
    border: none;
    outline: none;
    flex-grow: 1;
    width: 100%;
    resize: none;
    box-sizing: border-box;
    padding: 8px;
}

#submit-button-container {
    height: 96px;
    display: flex;
    justify-content: center;
    align-items: center;
}

#submit-button {
    height: 48px;
    width: 80%;
    cursor: pointer;
    border: none;
    outline: none;
    background: $color-tertiary;
}
</style>
