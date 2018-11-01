/* tslint:disable */
<template>
<div id="style-editor" :style="styleEditorStyle">
    <div class="stretcher-horizontal left" :style="stretcherStyle" @mousedown="startStretch"></div>
    <div id="style-editor-content">
        <editor-line
            v-for="editorLineModel in editorLineModels"
            :editorBlocks="editorLineModel.editorBlocks"
            :key="editorLineModel.id">
        </editor-line>
    </div>
    <div id="submit-button-container">
        <button id="submit-button" :style="submitButtonStyle" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import TextboxModel from "../models/TextboxModel";
import ShapeModel from "../models/ShapeModel";
import EditorLineModel from "../models/EditorLineModel";
import EditorBlockModel from "../models/EditorBlockModel";
import EditorLine from "./EditorLine.vue";

function span(innerText: string): EditorBlockModel {
    return new EditorBlockModel({ content: innerText });
}

function space(): EditorBlockModel {
    return new EditorBlockModel({ style: { width: "7px" }});
}

function lineNumber(number: number): EditorBlockModel[] {
    const elements: EditorBlockModel[] = [];
    const padSize = 4 - number.toString().length;

    for (let i = 0; i < padSize; i++) {
        elements.push(space());
    }

    elements.push(span(number.toString()));
    elements.push(span("|"));
    elements.push(space());

    return elements;
}

// Wraps a collection of blocks into a line, complete with a line number
function line(number: number, indentDepth: number, elements: EditorBlockModel[]): EditorLineModel {
    const line: EditorLineModel = new EditorLineModel();

    // Add the line number, indent, then append elements
    lineNumber(number).forEach((element: EditorBlockModel) => line.addBlock(element));

    for (let i = 0; i < indentDepth * 2; i++) {
        line.addBlock(space());
    }

    elements.forEach((element: EditorBlockModel) => line.addBlock(element));

    return line;
}

function objectToHtml(object: any, lineCount: number, indentDepth: number): EditorLineModel[] {
    const lines: EditorLineModel[] = [];
    const actualPropertyCount = Object.keys(object).length - 1;
    let propertyCount = 0;

    for (const property in object) {
        const value = object[property];

        if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
            const elements: EditorBlockModel[] = [span(property), span(":"), space(), span(value.toString())];
            if (propertyCount < actualPropertyCount) {
                elements.push(span(","));
            }

            lines.push(line(lineCount, indentDepth, elements));
            lineCount++;
        } else if (typeof value === "object") {
            lines.push(line(lineCount, indentDepth, [span(property), span(":"), space(), span("{")]));
            lineCount++;

            // Recursively cast child objects to html
            const propertyLines: EditorLineModel[] = objectToHtml(value, lineCount, indentDepth + 1);
            propertyLines.forEach((line: EditorLineModel) => lines.push(line));
            lineCount += propertyLines.length;

            const elements = [span("}")];
            if (propertyCount < actualPropertyCount) {
                elements.push(span(","));
            }

            lines.push(line(lineCount, indentDepth, elements));
            lineCount++;
        }

        propertyCount++;
    }

    return lines;
}

@Component({
    components: {
        EditorLine
    }
})
export default class StyleEditor extends Vue {
    private content: string = "";
    private width: number = this.$store.getters.styleEditorWidth;
    private stretcherWidth: number = 6;
    private editorLineModels: EditorLineModel[] = [];

    get styleEditorStyle(): any {
        return {
            background: this.$store.getters.theme.primary,
            borderLeft: `1px solid ${this.$store.getters.theme.tertiary}`,
            minWidth: `${this.width}px`
        };
    }

    get submitButtonStyle(): any {
        return {
            background: this.$store.getters.theme.tertiary
        };
    }

    get stretcherStyle(): any {
        return {
            width: `${this.stretcherWidth}px`
        };
    }

    private startStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget!.addEventListener("mousemove", this.previewStretch);
        event.currentTarget!.addEventListener("mouseup", this.endStretch);

        this.stretcherWidth = window.innerWidth * 2;
    }

    private previewStretch(event: any): void {
        event.preventDefault();
        event.stopPropagation();
        this.width = window.innerWidth - event.pageX;
    }

    private endStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget!.removeEventListener("mousemove", this.previewStretch);
        event.currentTarget!.removeEventListener("mouseup", this.endStretch);

        this.stretcherWidth = 6;
        this.$store.commit("setStyleEditorWidth", this.width);
    }

    private submit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        const focusedElement = this.$store.getters.focusedElement;
        focusedElement.fromJson(this.content);
    }

    public resetStyleEditor(json: ShapeModel | TextboxModel): void {
        this.editorLineModels = objectToHtml({ shape: json }, 0, 0);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
@import "../styles/components";

#style-editor {
    position: relative;
    display: flex;
    flex-direction: column;
}

#style-editor-content {
    flex-grow: 1;
    border: none;
    outline: none;
    font-family: monospace;
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
}
</style>
