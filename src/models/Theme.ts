export default class Theme {
    public name: string;
    public primary: string;
    public secondary: string;
    public tertiary: string;
    public information: string;
    public success: string;
    public warning: string;
    public failure: string;

    constructor(name: string, primary: string, secondary: string, tertiary: string, information: string, success: string, warning: string, failure: string) {
        this.name = name;
        this.primary = primary;
        this.secondary = secondary;
        this.tertiary = tertiary;
        this.information = information;
        this.success = success;
        this.warning = warning;
        this.failure = failure;
    }
}
