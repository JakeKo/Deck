import { GraphicSerialized, Keyed } from '@/types';

export function jsonToSlides(json: string): { id: string; graphics: Keyed<GraphicSerialized> }[] {
    try {
        return JSON.parse(json);
    } catch (error) {
        throw new Error(`Schema violation when parsing json into slides: ${json}`);
    }
}
