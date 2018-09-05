export default class Theme {
    public name: string;
    public primary: string;
    public secondary: string;
    public information: string;
    public success: string;
    public warning: string;
    public failure: string;

    constructor(name: string, primary: string, secondary: string, information: string, success: string, warning: string, failure: string) {
        this.name = name;
        this.primary = primary;
        this.secondary = secondary;
        this.information = information;
        this.success = success;
        this.warning = warning;
        this.failure = failure;
    }
}
