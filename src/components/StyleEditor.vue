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
        const tab = this.span("    "), colon = this.span(": "), comma = this.span(",");

        if (styleModel === undefined) {
            document.getElementById("style-editor-content")!.innerHTML = "";
        }

        document.appendChild(this.line(lineCount, [this.span("{")]));
        lineCount++;

        for (const property in styleModel) {
            if (styleModel.hasOwnProperty(property)) {
                const line = this.line(lineCount, [tab, this.span(property), colon, this.span(styleModel[property]), comma]);
                document.appendChild(line);
                lineCount++;
            }
        }

        document.appendChild(this.line(lineCount, [this.span("}")]));

        document.getElementById("style-editor-content")!.innerHTML = html.outerHTML;
    }

    private span(innerText: string): HTMLSpanElement {
        const element = document.createElement("span");
        element.innerText = innerText;
        return element;
    }

    private line(number: number, elements: HTMLSpanElement[]): HTMLDivElement {
        const line = document.createElement("div");
        const numberString: String = number.toString();
        line.appendChild(this.span(numberString.padStart(4, " ")));

        elements.forEach((element) => {
            line.appendChild(element);
        });

        return line;
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

#editor {
    flex-grow: 1;
    border: none;
    outline: none;
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
