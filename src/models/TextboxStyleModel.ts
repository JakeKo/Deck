export default class TextboxStyleModel {
    [key:string]: string;
    public fill: string;

    constructor(
        { fill }:
        { fill?: string } = {}
    ) {
        this.fill = fill || "grey";
    }
}
