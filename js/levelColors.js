export const GRID_HEIGHT = 12;
export const GRID_CELL_SIZE = 0.15;
export const GRID_BOTTOM_Y = -0.9;

export const LEVEL_COLORS = Object.freeze([
    Object.freeze([44, 115, 204]),
    Object.freeze([54, 174, 235]),
    Object.freeze([51, 205, 190]),
    Object.freeze([68, 205, 104]),
    Object.freeze([145, 220, 73]),
    Object.freeze([221, 226, 62]),
    Object.freeze([255, 202, 58]),
    Object.freeze([255, 143, 58]),
    Object.freeze([246, 91, 68]),
    Object.freeze([239, 61, 103]),
    Object.freeze([212, 57, 172]),
    Object.freeze([145, 61, 190])
]);

export function getHeightColorIndex(worldY) {
    const nearestCell = Math.round((worldY - GRID_BOTTOM_Y) / GRID_CELL_SIZE - 0.5);
    return Math.max(0, Math.min(GRID_HEIGHT - 1, nearestCell));
}
