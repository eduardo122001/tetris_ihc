import * as glm from './gl-matrix/index.js'
import { getHeightColorIndex, LEVEL_COLORS } from './levelColors.js';

class TetrisShape {
    constructor(cubes) {
        this.cubes = cubes;
        this.texture = null;
        this.color = null;
    }

    /* -------- Create deep copy of tetris shape ------- */

    clone() {
        const cubes = [];
        this.cubes.forEach((cube) => {
            cubes.push(cube.clone());
        });
        return new TetrisShape(cubes);
    }

    /* -------- Initialize & bind buffers -------- */

    initBuffersAndVAO(gl, shader) {
        this.cubes.forEach((cube) => {
            cube.initBuffersAndVAO(gl, shader);
        });
    }

    /* -------- Rotate method for shapes -------- */

    rotate(axis, angle) {
        const cubeLength = 0.15;
        const positions = this.cubes.map(cube => cube.getBuildPosition());
        const pivot = positions.reduce(
            (center, position) => [
                center[0] + position.x / positions.length,
                center[1] + position.y / positions.length,
                center[2] + position.z / positions.length
            ],
            [0, 0, 0]
        ).map(coordinate => Math.round(coordinate / cubeLength) * cubeLength);

        this.cubes.forEach((cube) => {
            cube.rotate(axis, angle, pivot);
        });
    }

    /* -------- Translate method for shapes -------- */

    translate(translationVector) {
        this.cubes.forEach((cube) => {
            cube.translate(translationVector);
        });
    }

    /* -------- Set color for shapes -------- */

    setColor(color) {
        this.color = color;
    }

    /* -------- Set texture for shapes -------- */

    setTexture(texture) {
        this.texture = texture;
    }

    /* -------- Get cube position ------- */

    getPosition() {
        const position = [];
        this.cubes.forEach((cube) => {
            position.push(cube.getPosition());
        });

        return position;
    }

    /* -------- Get cubes ------- */

    getCubes() {
        return this.cubes;
    }

    /* -------- Delete cube ------- */

    deleteCube(cube) {
        this.cubes.splice(this.cubes.indexOf(cube), 1);
    }

    /* -------- Draw shape -------- */

    draw(gl, shader, viewMatrix, isTransparent = false) {
        shader.setTransparency(gl, glm.vec2.fromValues(0., Number(isTransparent)));
        try {
            this.cubes.forEach((cube) => {
                const { y } = cube.getPosition();
                const [red, green, blue] = LEVEL_COLORS[getHeightColorIndex(y)];
                shader.setColorUniform(gl, glm.vec4.fromValues(red, green, blue, 1.), null);
                if(this.texture !== null) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                }
                cube.draw(gl, shader, viewMatrix);
            });
        } finally {
            shader.setTransparency(gl, glm.vec2.fromValues(0., 0.));
        }
    }

    drawOutline(gl, shader, viewMatrix, wireframeVaoIndex) {
        this.cubes.forEach(cube => {
            cube.drawLinesWithVAO(gl, shader, viewMatrix, wireframeVaoIndex);
        });
    }
}

export { TetrisShape }
