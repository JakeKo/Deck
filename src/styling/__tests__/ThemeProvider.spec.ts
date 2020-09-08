import { getBaseStyles, themes } from '../index';
import { THEMES } from '../types';

describe('ThemeProvider', () => {
    it('provides a light theme', () => {
        // Arrange

        // Act
        const theme = themes[THEMES.LIGHT];

        // Assert
        expect(theme.type).toEqual(THEMES.LIGHT);
    });

    it('provides base styles', () => {
        // Arrange

        // Act
        const style = getBaseStyles(themes[THEMES.LIGHT]);

        // Assert
        expect(style.flexCol.display).toEqual('flex');
    });
});
