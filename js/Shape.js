import * as glm from './gl-matrix/index.js'
const epsilon = 0.001;

class Shape {
    // Fields
    #translationMatrix;
    #rotationMatrix;
    #vaoManager;
    #fixedVaoIndex = -1;

    constructor(vaoManager, fixedVaoIndex = -1) {
        this.#translationMatrix = glm.mat4.create();
        this.#rotationMatrix = glm.mat4.create();
        this.translateToBuildShapeMatrix = glm.mat4.create();
        this.#fixedVaoIndex = fixedVaoIndex;
        this.#vaoManager = vaoManager;
    }

    /* -------- Create deep copy of the shape ------- */

    clone() {
        let shape = new Shape(this.#vaoManager, this.#fixedVaoIndex);
        shape.#translationMatrix = glm.mat4.clone(this.#translationMatrix);
        shape.#rotationMatrix = glm.mat4.clone(this.#rotationMatrix);
        shape.translateToBuildShapeMatrix = glm.mat4.clone(this.translateToBuildShapeMatrix);
        return shape;
    }

    /* -------- Update the scene after changes -------- */

    update(gl, shader, viewMatrix) {
        const modelMatrix = glm.mat4.create();

        // Matrix transformations are read from right to left:
        glm.mat4.multiply(modelMatrix, this.translateToBuildShapeMatrix, modelMatrix);
        glm.mat4.multiply(modelMatrix, this.#rotationMatrix, modelMatrix);
        glm.mat4.multiply(modelMatrix, this.#translationMatrix, modelMatrix);

        const modelViewMatrix = glm.mat4.create();
        glm.mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

        const normalMatrix = glm.mat3.create();
        glm.mat3.normalFromMat4(normalMatrix, modelViewMatrix);

        gl.uniformMatrix4fv(
            shader.locUTransform,
            false,
            modelMatrix
        );

        gl.uniformMatrix3fv(
            shader.locNTransform,
            false,
            normalMatrix
        );

        return normalMatrix;
    }

    /* -------- Rotate method for shapes -------- */

    rotate(axis, angle) {
        const rotationMatrix = glm.mat4.create();
        switch (axis) {
            case 'x':
            glm.mat4.rotateX(rotationMatrix, rotationMatrix, angle);
            break;
            case 'y':
            glm.mat4.rotateY(rotationMatrix, rotationMatrix, angle);
            break;
            case 'z':
            glm.mat4.rotateZ(rotationMatrix, rotationMatrix, angle);
            break;
        }

        // Apply rotation matrix to the object
        glm.mat4.multiply(this.#rotationMatrix, rotationMatrix, this.#rotationMatrix);
    }

    /* -------- Translate method for shapes -------- */
    
    translate(translationVector) {
        glm.mat4.translate(this.#translationMatrix, this.#translationMatrix, translationVector);
    }

    /* -------- Get cube position ------- */

    getPosition() {
        const modelMatrix = glm.mat4.create();
        glm.mat4.multiply(modelMatrix, this.translateToBuildShapeMatrix, modelMatrix);
        glm.mat4.multiply(modelMatrix, this.#rotationMatrix, modelMatrix);
        glm.mat4.multiply(modelMatrix, this.#translationMatrix, modelMatrix);

        const position = glm.vec4.create();
        glm.vec4.transformMat4(position, glm.vec4.fromValues(0, 0, 0, 1), modelMatrix);

        return { x: position[0], y: position[1], z: position[2] };
    }

    /* -------- Draw shape -------- */

    draw(gl, shader, viewMatrix) {
        this.update(gl, shader, viewMatrix);

        const vao = this.#vaoManager.getVAO(this.#fixedVaoIndex);
        vao.bind(gl);
        vao.draw(gl);
    }

    /* -------- Draw lines for the full boudingbox/grid -------- */

    drawLines(gl, shader, viewMatrix) {
        this.update(gl, shader, viewMatrix);

        const vao = this.#vaoManager.getVAO(this.#fixedVaoIndex);
        vao.bind(gl);
        vao.drawLines(gl);
    }

    /* -------- Draw lines for the boudingbox if its not obstructing the view of the tetracubes -------- */

    drawVisibleLines(gl, shader, viewMatrix, offsets) {
        const cameraDirection = glm.vec3.create()
        const normalMatrix = this.update(gl, shader, viewMatrix);
        const vao = this.#vaoManager.getVAO(this.#fixedVaoIndex);
        vao.bind(gl);

        // Calculate the camera direction for normal vector comparison
        glm.vec3.transformMat4(cameraDirection, cameraDirection, viewMatrix);

        for (const offset of offsets) {
            const transformedNormal = glm.vec3.create();
            glm.vec3.transformMat3(
                transformedNormal,
                offset.normalVector,
                normalMatrix
            );

            // Dot product of normal and camera direction, hide the
            // faces if the vectors are pointing into opposite
            // directions
            if (glm.vec3.dot(cameraDirection, transformedNormal) < 0)
                continue;

            vao.drawLinesIndexed(gl, offset.indexCount, offset.indexOffset);
        }
    }
}

export { Shape }
