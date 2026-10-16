import * as glm from './gl-matrix/index.js'
import { Shape } from './Shape.js';
import { VAO } from './VAO.js';
import { TetrisShape } from './TetrisShape.js';
import * as vaos from './VAOManager.js';

const cubeLength = 0.15;

class ShapeGenerator {
    createVAOFromOBJFile(objFile) {
        return new VAO(
            objFile.vertices,
            objFile.normals,
            objFile.indices,
            objFile.textures
        );
    }

    createFlatShape(vaoManager, cells) {
        this.cubes = [];

        const maxX = Math.max(...cells.map(([x]) => x));
        const maxZ = Math.max(...cells.map(([, z]) => z));

        for (const [x, z] of cells) {
            const shape = new Shape(vaoManager);
            glm.mat4.translate(shape.translateToBuildShapeMatrix, shape.translateToBuildShapeMatrix, [x * cubeLength, 0, z * cubeLength]);
            this.cubes.push(shape);
        }

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([
            -Math.floor(maxX / 2) * cubeLength,
            cubeLength * 6.5,
            -Math.floor(maxZ / 2) * cubeLength
        ]);
        return tetrisShape;
    }

    createShapeMonomino(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0]]);
    }

    createShapeDomino(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0]]);
    }

    createShapeTrominoStraight(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [2, 0]]);
    }

    createShapeTrominoL(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [0, 1]]);
    }

    createShapeTetrominoI(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [2, 0], [3, 0]]);
    }

    createShapeTetrominoO(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [0, 1], [1, 1]]);
    }

    createShapeTetrominoT(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [2, 0], [1, 1]]);
    }

    createShapeTetrominoL(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [2, 0], [2, 1]]);
    }

    createShapeTetrominoJ(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [2, 0], [0, 1]]);
    }

    createShapeTetrominoS(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 0], [1, 0], [1, 1], [2, 1]]);
    }

    createShapeTetrominoZ(vaoManager) {
        return this.createFlatShape(vaoManager, [[0, 1], [1, 1], [1, 0], [2, 0]]);
    }

    generateGroundPlane(vaoManager) {
        const vertices = [
            -0.375, -0.9, -0.375,
            -0.375, -0.9, 0.375,
            0.375, -0.9, -0.375,
            0.375, -0.9, 0.375
        ];

        const indices = [
            0, 1, 2,
            1, 3, 2
        ];

        const normals = [
            0, 1, 0,   // normal 0
            0, 1, 0,   // normal 1
            0, 1, 0,   // normal 2
            0, 1, 0    // normal 3
        ];

        const index = vaos.VAO_PLANE;
        const vao = new VAO(
            vertices,
            normals,
            indices,
            null
        );

        vaoManager.addVAO(vao, index);
        return new Shape(vaoManager, index);
}
}
export { ShapeGenerator };
