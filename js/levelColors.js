export const GRID_HEIGHT = 12;
export const GRID_CELL_SIZE = 0.15;
export const GRID_BOTTOM_Y = -0.9;

export const LEVEL_COLORS = Object.freeze([
    Object.freeze([255, 48, 48]),
    Object.freeze([255, 103, 26]),
    Object.freeze([255, 214, 51]),
    Object.freeze([190, 255, 45]),
    Object.freeze([58, 255, 92]),
    Object.freeze([45, 255, 189]),
    Object.freeze([41, 225, 255]),
    Object.freeze([48, 132, 255]),
    Object.freeze([97, 71, 255]),
    Object.freeze([171, 62, 255]),
    Object.freeze([255, 54, 231]),
    Object.freeze([255, 62, 139])
]);

export function getHeightColorIndex(worldY) {
    const nearestCell = Math.round((worldY - GRID_BOTTOM_Y) / GRID_CELL_SIZE - 0.5);
    return Math.max(0, Math.min(GRID_HEIGHT - 1, nearestCell));
}
