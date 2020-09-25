type Palette = {
    highest: string;
    higher: string;
    flush: string;
    lower: string;
    lowest: string;
};

type Typeface = {
    size: string;
    weight: string;
    font: string;
    textTransform?: string;
};

export type Theme = {
    type: string;
    color: {
        base: Palette;
        basecomp: Palette;
        primary: Palette;
    };
    text: {
        title: Typeface;
        header: Typeface;
        body: Typeface;
        label: Typeface;
        input: Typeface;
    };
};

export type BaseStyles = {
    flexRow: {
        display: 'flex';
        flexDirection: 'row';
    };
    flexCol: {
        display: 'flex';
        flexDirection: 'column';
    };
    flexRowTL: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'flex-start';
        alignItems: 'flex-start';
    };
    flexRowTC: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'center';
        alignItems: 'flex-start';
    };
    flexRowTR: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'flex-end';
        alignItems: 'flex-start';
    };
    flexRowCL: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'flex-start';
        alignItems: 'center';
    };
    flexRowCC: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'center';
        alignItems: 'center';
    };
    flexRowCR: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'flex-end';
        alignItems: 'center';
    };
    flexRowBL: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'flex-start';
        alignItems: 'flex-end';
    };
    flexRowBC: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'center';
        alignItems: 'flex-end';
    };
    flexRowBR: {
        display: 'flex';
        flexDirection: 'row';
        justifyContent: 'flex-end';
        alignItems: 'flex-end';
    };
    flexColTL: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'flex-start';
        alignItems: 'flex-start';
    };
    flexColTC: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'flex-start';
        alignItems: 'center';
    };
    flexColTR: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'flex-start';
        alignItems: 'flex-end';
    };
    flexColCL: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'center';
        alignItems: 'flex-start';
    };
    flexColCC: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'center';
        alignItems: 'center';
    };
    flexColCR: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'center';
        alignItems: 'flex-end';
    };
    flexColBL: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'flex-end';
        alignItems: 'flex-start';
    };
    flexColBC: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'flex-end';
        alignItems: 'center';
    };
    flexColBR: {
        display: 'flex';
        flexDirection: 'column';
        justifyContent: 'flex-end';
        alignItems: 'flex-end';
    };
    fullScreen: {
        width: '100vw';
        height: '100vh';
    };
    fontTitle: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
    };
    fontHeader: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
    };
    fontBody: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
    };
    fontLabel: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
    };
    fontInput: {
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
    };
};

export enum THEMES {
    LIGHT = 'light',
    DARK = 'dark'
}

export type StyleCreator<T, U> = ({ theme, base, props }: { theme: Theme; base: BaseStyles; props: T }) => U;
