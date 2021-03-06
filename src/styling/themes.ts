import { THEMES, Theme } from './types';

// Color Scheme Maker: https://noeldelgado.github.io/shadowlord
const lightTheme: Theme = {
    type: THEMES.LIGHT,
    color: {
        base: {
            highest: '#ffffff', // 100% tint
            higher: '#ededed', // 75% tint
            flush: '#dbdbdb', // 50% tint
            lower: '#c8c8c8', // 25% tint
            lowest: '#b6b6b6' // base
        },
        basecomp: {
            highest: '#494949', // base
            higher: '#373737', // 25% tint
            flush: '#252525', // 50% tint
            lower: '#121212', // 75% tint
            lowest: '#000000' // 100% tint
        },
        primary: {
            highest: '#8766b6', // 30% tint
            higher: '#643aa1', // 10% tint
            flush: '#532497', // base
            lower: '#4b2088', // 10% shade
            lowest: '#3a196a' // 30% shade
        }
    },
    text: {
        title: {
            size: '2rem',
            weight: '400',
            font: 'Roboto Slab, sans-serif'
        },
        header: {
            size: '1.25rem',
            weight: '400',
            font: 'Roboto Slab, sans-serif'
        },
        body: {
            size: '1rem',
            weight: '400',
            font: 'Open Sans, sans-serif'
        },
        label: {
            size: '0.75rem',
            weight: '700',
            font: 'Open Sans, sans-serif'
        },
        input: {
            size: '0.875rem',
            weight: '700',
            font: 'Open Sans, sans-serif'
        }
    }
};

export default {
    [THEMES.LIGHT]: lightTheme
};
