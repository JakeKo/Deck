/* tslint:disable */
<template>
<div id="style-editor" :style="styleEditorStyle">
    <div class="stretcher-horizontal left" :style="stretcherStyle" @mousedown="startStretch"></div>
    <div id="style-editor-content"> </div>
    <div id="submit-button-container">
        <button id="submit-button" :style="submitButtonStyle" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import StyleModel from "../models/StyleModel";
import TextboxStyleModel from "../models/TextboxStyleModel";

function span(innerText: string): HTMLDivElement {
    const element = document.createElement("div");
    element.innerText = innerText;
    return element;
}

function space(): HTMLDivElement {
    const element: HTMLDivElement = document.createElement("div");
    element.style.width = "7px";
    return element;
}

function lineNumber(number: number): HTMLDivElement[] {
    const elements: HTMLDivElement[] = [];
    const lineNumberWidth = 2;
    const padSize = lineNumberWidth - number.toString().length;
    
    for (let i = 0; i < padSize; i++) {
        elements.push(space());
    }

    elements.push(span(number.toString()));
    elements.push(span("|"));
    elements.push(space());

    return elements;
}

function line(number: number, indentDepth: number, elements: HTMLSpanElement[]): HTMLDivElement {
    const line = document.createElement("div");
    line.style.display = "flex";
    
    lineNumber(number).forEach((element: HTMLDivElement) => {
        line.appendChild(element);
    });

    for (let i = 0; i < 4 * indentDepth; i++) {
        line.appendChild(space());
    }

    elements.forEach((element) => {
        line.appendChild(element);
    });

    return line;
}

// padStart polyfill
function padStart(base: string, targetLength: number, padString: string): string {
    if (base.length >= targetLength) {
        return base;
    }

    targetLength -= base.length;

    if (targetLength > padString.length) {
         for (let i = 0; i < targetLength / padString.length; i++) {
             padString += padString;
         }
    }

    return padString.slice(0, targetLength) + base;
};

@Component
export default class StyleEditor extends Vue {
    private content: string = "";
    private width: number = this.$store.getters.styleEditorWidth;
    private stretcherWidth: number = 6;

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

    public resetStyleEditor(content: string): void {
        this.jsonToHtml(JSON.parse(content));
    }

    private jsonToHtml(styleModel: StyleModel | TextboxStyleModel): void {
        const html: HTMLDivElement = document.createElement("div");

        // Yes, we zero-index our line numbers
        let lineCount: number = 0;

        // Convenient constants
        const colon = span(": "), comma = span(",");

        if (styleModel === undefined) {
            document.getElementById("style-editor-content")!.innerHTML = "";
        }

        html.appendChild(line(lineCount, 0, [span("{")]));
        lineCount++;

        for (const property in styleModel) {
            const elements: HTMLDivElement[] = [span(property), colon, space(), span(styleModel[property]), comma];
            const lineElement = line(lineCount, 1, elements);
            html.appendChild(lineElement);
            lineCount++;
        }

        html.appendChild(line(lineCount, 0, [span("}")]));

        document.getElementById("style-editor-content")!.innerHTML = html.outerHTML;
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
