import { THEMES, Theme } from "./types";

// Color Scheme Maker: https://noeldelgado.github.io/shadowlord
// TODO: Figure out how to encode font colors
const lightTheme: Theme = {
    color: {
        achro: {
            highest: '#ffffff', // 100% tint
            higher: '#ededed',  // 75% tint
            flush: '#dbdbdb',   // 50% tint
            lower: '#c8c8c8',   // 25% tint
            lowest: '#b6b6b6'   // base
        },
        achrocomp: {
            highest: '#494949', // base
            higher: '#373737',  // 25% tint
            flush: '#252525',   // 50% tint
            lower: '#121212',   // 75% tint
            lowest: '#000000'   // 100% tint
        },
        primary: {
            highest: '#7955ae', // 30% tint
            higher: '#532497',  // 10% tint
            flush: '#400c8b',   // base
            lower: '#3a0b7d',   // 10% shade
            lowest: '#2d0861'   // 30% shade
        }
    },
    text: {
        body: {
            size: '1rem',
            weight: '400',
            font: 'sans-serif'
        },
        label: {
            size: '0.75rem',
            weight: '400',
            font: 'sans-serif'
        }
    }
};

export default {
    [THEMES.LIGHT]: lightTheme
};
