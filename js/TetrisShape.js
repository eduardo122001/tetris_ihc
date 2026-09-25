import * as glm from './gl-matrix/index.js'

class TetrisShape {
    constructor(cubes) {
        this.cubes = cubes;
        this.texture = null;
        this.color = null;
        this.transparency = null;
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
        this.cubes.forEach((cube) => {
            cube.rotate(axis, angle);
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

    draw(gl, shader, viewMatrix) {
        shader.setTransparency(gl, glm.vec2.fromValues(0., 0.));
        this.cubes.forEach((cube) => {
            if(this.texture !== null) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
            }
            if(this.color !== null) {
                shader.setColorUniform(gl, this.color, this.texture);
            }
            if(this.transparency !== null) {
                shader.setTransparency(gl, this.transparency);
            }
            cube.draw(gl, shader, viewMatrix);
        });
    }

    /* -------- Set transparency -------- */

    setTransparency(transparency) {
        this.transparency = transparency;
    }
}

export { TetrisShape }
