import { Shape } from './Shape.js';
import { VAO } from './VAO.js';
import * as vaos from './VAOManager.js';
import * as glm from './gl-matrix/index.js';

const cellSize = 0.15;
const halfWidth = (5 * cellSize) / 2;
const bottom = -0.9;
const top = 0.9;
const heightDivisions = Math.round((top - bottom) / cellSize);

const offsets = [];
const vertices = [];
const indices = [];

const gridCoordinates = (min, divisions) =>
    Array.from({ length: divisions + 1 }, (_, index) => min + index * cellSize);

const xCoordinates = gridCoordinates(-halfWidth, 5);
const zCoordinates = gridCoordinates(-halfWidth, 5);
const yCoordinates = gridCoordinates(bottom, heightDivisions);

const addLine = (start, end) => {
    const firstIndex = vertices.length / 3;
    vertices.push(...start, ...end);
    indices.push(firstIndex, firstIndex + 1);
};

const addFace = (normal, lines) => {
    const indexOffset = indices.length;
    for (const [start, end] of lines) {
        addLine(start, end);
    }
    offsets.push({
        indexCount: indices.length - indexOffset,
        indexOffset,
        normalVector: glm.vec3.fromValues(...normal)
    });
};

const horizontalFace = (y, normal) => {
    const lines = [];
    for (const z of zCoordinates) {
        lines.push([[-halfWidth, y, z], [halfWidth, y, z]]);
    }
    for (const x of xCoordinates) {
        lines.push([[x, y, -halfWidth], [x, y, halfWidth]]);
    }
    addFace(normal, lines);
};

const xWall = (x, normal) => {
    const lines = [];
    for (const y of yCoordinates) {
        lines.push([[x, y, -halfWidth], [x, y, halfWidth]]);
    }
    for (const z of zCoordinates) {
        lines.push([[x, bottom, z], [x, top, z]]);
    }
    addFace(normal, lines);
};

const zWall = (z, normal) => {
    const lines = [];
    for (const y of yCoordinates) {
        lines.push([[-halfWidth, y, z], [halfWidth, y, z]]);
    }
    for (const x of xCoordinates) {
        lines.push([[x, bottom, z], [x, top, z]]);
    }
    addFace(normal, lines);
};

horizontalFace(bottom, [0, -1, 0]);
xWall(-halfWidth, [-1, 0, 0]);
zWall(-halfWidth, [0, 0, -1]);
horizontalFace(top, [0, 1, 0]);
xWall(halfWidth, [1, 0, 0]);
zWall(halfWidth, [0, 0, 1]);

const createBoundingBox = (vaoManager) => {
    const index = vaos.VAO_BOUNDINGBOX;
    const vao = new VAO(vertices, null, indices, null);

    vaoManager.addVAO(vao, index);
    return new Shape(vaoManager, index);
};

export { createBoundingBox, offsets };
