import { Shape } from './Shape.js';
import { VAO } from './VAO.js';
import * as vaos from './VAOManager.js';

const cellSize = 0.15;
const halfWidth = (5 * cellSize) / 2;
const bottom = -0.9;
const top = 0.9;
const height = top - bottom;
const heightDivisions = Math.round(height / cellSize);

const createGridGeometry = () => {
    const vertices = [];
    const indices = [];
    const floorVertices = [];
    const floorIndices = [];
    const gridCoordinates = (min, max, divisions) =>
        Array.from({ length: divisions + 1 }, (_, index) => min + index * cellSize);
    const xCoordinates = gridCoordinates(-halfWidth, halfWidth, 5);
    const zCoordinates = gridCoordinates(-halfWidth, halfWidth, 5);
    const yCoordinates = gridCoordinates(bottom, top, heightDivisions);

    const addLine = (targetVertices, targetIndices, start, end) => {
        const firstIndex = targetVertices.length / 3;
        targetVertices.push(...start, ...end);
        targetIndices.push(firstIndex, firstIndex + 1);
    };

    for (const y of yCoordinates) {
        const isFloor = y === bottom;
        const targetVertices = isFloor ? floorVertices : vertices;
        const targetIndices = isFloor ? floorIndices : indices;
        const lineY = isFloor ? bottom + 0.002 : y;
        for (const z of zCoordinates) {
            addLine(targetVertices, targetIndices, [-halfWidth, lineY, z], [halfWidth, lineY, z]);
        }
        for (const x of xCoordinates) {
            addLine(targetVertices, targetIndices, [x, lineY, -halfWidth], [x, lineY, halfWidth]);
        }
    }

    for (const x of xCoordinates) {
        for (const z of zCoordinates) {
            addLine(vertices, indices, [x, bottom, z], [x, top, z]);
        }
    }

    return { vertices, indices, floorVertices, floorIndices };
};

const createGrid = (vaoManager) => {
    const { vertices, indices, floorVertices, floorIndices } = createGridGeometry();
    const gridIndex = vaos.VAO_GRID;
    const floorIndex = vaos.VAO_FLOOR_GRID;
    const vao = new VAO(vertices, null, indices, null);
    const floorVao = new VAO(floorVertices, null, floorIndices, null);

    vaoManager.addVAO(vao, gridIndex);
    vaoManager.addVAO(floorVao, floorIndex);
    return {
        lines: new Shape(vaoManager, gridIndex),
        floor: new Shape(vaoManager, floorIndex)
    };
};

export { createGrid };
