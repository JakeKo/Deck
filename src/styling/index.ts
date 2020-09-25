import themes from './themes';
import { BaseStyles, Theme } from './types';

const getBaseStyles = (theme: Theme): BaseStyles => ({
    flexRow: {
        display: 'flex',
        flexDirection: 'row'
    },
    flexCol: {
        display: 'flex',
        flexDirection: 'column'
    },
    flexRowTL: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    flexRowTC: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    flexRowTR: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
    },
    flexRowCL: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    flexRowCC: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    flexRowCR: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    flexRowBL: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end'
    },
    flexRowBC: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    flexRowBR: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    flexColTL: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    flexColTC: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    flexColTR: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end'
    },
    flexColCL: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    flexColCC: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    flexColCR: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    flexColBL: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
    },
    flexColBC: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    flexColBR: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    fullScreen: {
        width: '100vw',
        height: '100vh'
    },
    fontTitle: {
        fontFamily: theme.text.title.font,
        fontWeight: theme.text.title.weight,
        fontSize: theme.text.title.size
    },
    fontHeader: {
        fontFamily: theme.text.header.font,
        fontWeight: theme.text.header.weight,
        fontSize: theme.text.header.size
    },
    fontBody: {
        fontFamily: theme.text.body.font,
        fontWeight: theme.text.body.weight,
        fontSize: theme.text.body.size
    },
    fontLabel: {
        fontFamily: theme.text.label.font,
        fontWeight: theme.text.label.weight,
        fontSize: theme.text.label.size
    },
    fontInput: {
        fontFamily: theme.text.input.font,
        fontWeight: theme.text.input.weight,
        fontSize: theme.text.input.size
    }
});

export {
    getBaseStyles,
    themes
};
