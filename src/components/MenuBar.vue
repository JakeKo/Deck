<template>
<div id="menu-bar">
    <label for="presentation-upload">Upload: </label>
    <input type="file" id="presentation-upload" name="presentation-upload" accept="application/json" @change="uploadPresentation">
</div>
</template>

<script lang="ts">
import Vue from "vue";

export default class MenuBar extends Vue {
    private uploadPresentation(event: Event): void {
        // Fetch the uploaded file and abort if no file was selected
        const presentationFile: File = (event.target as HTMLInputElement).files![0];
        if (presentationFile === undefined) {
            return;
        }

        // Create the file reader and set the event handler after reading is complete
        const fileReader: FileReader = new FileReader();
        fileReader.onloadend = (event: FileReaderProgressEvent): void => {
            console.log(JSON.parse(event.target!.result));
        };

        // Asynchronously read the uploaded presentation as text
        fileReader.readAsText(presentationFile);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/colors";

#menu-bar {
    height: 32px;
    flex-shrink: 0;
    box-sizing: border-box;
    border-bottom: 1px solid $color-tertiary;
}
</style>

