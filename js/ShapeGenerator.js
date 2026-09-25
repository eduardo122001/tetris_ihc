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

    createShapeI(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [0, 0, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [1 * cubeLength, 0, 0]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [2 * cubeLength, 0, 0]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [3 * cubeLength, 0, 0]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([-0.225, 0.975, cubeLength/2]);
        return tetrisShape;
    }

    createShapeL(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [0, 0, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [0, 1 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [0, 2 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [0, 0, 1  * cubeLength]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([cubeLength / 2, cubeLength * 6.5, cubeLength /2]);
        return tetrisShape;
    }

    createShapeN(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [0, 0, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [0, 1 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [0, 1 * cubeLength, 1 * cubeLength]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [0, 2 * cubeLength, 1 * cubeLength]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([cubeLength / 2, cubeLength * 6.5, cubeLength /2]);
        return new TetrisShape(this.cubes);
    }

    createShapeO(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [0, 0, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [1 * cubeLength, 0, 0]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [0, (1 * cubeLength), 0]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [1 * cubeLength, (1 * cubeLength), 0]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([cubeLength / 2, cubeLength * 6.5, cubeLength /2]);
        return tetrisShape;
    }

    createShapeT(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [0, 0, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [0, 1 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [0, 2 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [0, 1 * cubeLength, 1 * cubeLength]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([cubeLength / 2, cubeLength * 6.5, cubeLength /2]);
        return tetrisShape;
    }

    createShapeTowerLeft(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [1 * cubeLength, 1 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [1 * cubeLength, 0, 1 * cubeLength]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [1 * cubeLength, 0, 0]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [0, 0, 1 * cubeLength]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([cubeLength / 2, cubeLength * 6.5, cubeLength /2]);
        return tetrisShape;
    }

    createShapeTowerRight(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [0, 0, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [1 * cubeLength, 0, 1 * cubeLength]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [0, 1 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [0, 0, 1 * cubeLength]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([cubeLength / 2, cubeLength * 6.5, cubeLength /2]);
        return tetrisShape;
    }

    createShapeTripod(vaoManager) {
        this.cubes = [];

        // Create the cubes
        for(let i = 0; i < 4; i++) {
            const shape = new Shape(vaoManager);
            this.cubes.push(shape);
        }

        glm.mat4.translate(this.cubes[0].translateToBuildShapeMatrix, this.cubes[0].translateToBuildShapeMatrix, [0, 0, 0]);
        glm.mat4.translate(this.cubes[1].translateToBuildShapeMatrix, this.cubes[1].translateToBuildShapeMatrix, [1 * cubeLength, 0, 0]);
        glm.mat4.translate(this.cubes[2].translateToBuildShapeMatrix, this.cubes[2].translateToBuildShapeMatrix, [0, 1 * cubeLength, 0]);
        glm.mat4.translate(this.cubes[3].translateToBuildShapeMatrix, this.cubes[3].translateToBuildShapeMatrix, [0, 0, 1 * cubeLength]);

        const tetrisShape = new TetrisShape(this.cubes);
        tetrisShape.translate([cubeLength / 2, cubeLength * 6.5, cubeLength /2]);
        return tetrisShape;
    }

    generateGroundPlane(vaoManager) {
        const vertices = [
            //-0.30, -0.90, -0.30
            -0.3, -0.9, -0.3,
            -0.3, -0.9, 0.3,
            0.3, -0.9, -0.3,
            0.3, -0.9, 0.3
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
