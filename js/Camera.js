import * as glm from './gl-matrix/index.js';

const ROTATION_ANGLE = Math.PI / 180 * 45; // Rotate 45 degrees

class Camera {
    #cameraPosition = glm.vec3.fromValues(0., 0., -2.);
    #globalRotationMatrix = glm.mat4.create();
    #scalingMatrix = glm.mat4.create();
    #orthogonalProjectionMatrix = glm.mat4.create();
    #perspectiveProjectionMatrix = glm.mat4.create();
    #isProjectionOrthogonal = true;

    constructor() {
        this.viewMatrix = this.#initViewMatrix(glm.mat4.create());
        this.#placeCameraView();
    }

    /* -------- Initialize camera's view matrix based on the eye position -------- */

    #initViewMatrix(rotationMatrix) {
        const viewMatrix = glm.mat4.create();
        const translationMatrix = glm.mat4.create();

        glm.mat4.translate(translationMatrix, translationMatrix, this.#cameraPosition);

        glm.mat4.multiply(viewMatrix, viewMatrix, translationMatrix);
        glm.mat4.multiply(viewMatrix, viewMatrix, this.#scalingMatrix);
        glm.mat4.multiply(viewMatrix, viewMatrix, rotationMatrix);
        glm.mat4.multiply(viewMatrix, viewMatrix, this.#globalRotationMatrix);

        return viewMatrix;
    }

    /* -------- Place camera -------- */

    #placeCameraView() {
        this.rotateCamera('y', -ROTATION_ANGLE);
        this.rotateCamera('x', ROTATION_ANGLE);

        this.zoom(glm.vec3.fromValues(1 - 0.35, 1 - 0.35, 1 - 0.35));
    }

    /* -------- Initialize both orthogonal and projection matrix -------- */

    initializeProjectionMatrices(aspectRatio) {
        glm.mat4.ortho(
            this.#orthogonalProjectionMatrix,
            -aspectRatio,
            aspectRatio,
            -1,
            1,
            0.1,
            100.0
        );

        glm.mat4.perspective(
            this.#perspectiveProjectionMatrix,
            (45 * Math.PI) / 180,
            aspectRatio,
            0.1,
            100.0
        );

    }

    /* -------- Rotate the camera based on the chosen axis and angle -------- */

    rotateCamera(axis, angle) {
        const rotationMatrix = glm.mat4.create();

        switch(axis) {
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

        glm.mat4.multiply(this.#globalRotationMatrix, rotationMatrix, this.#globalRotationMatrix);
        this.viewMatrix = this.#initViewMatrix(glm.mat4.create());
    }

    /* -------- Rotate without modifying the camera's original position -------- */

    rotateCameraForMouse(angle) {
        const rotationMatrix = glm.mat4.create();
        glm.mat4.rotateY(rotationMatrix, rotationMatrix, angle);
        this.viewMatrix = this.#initViewMatrix(rotationMatrix);
    }

    /* -------- Zoom the camera in/ out based on the chosen scaling vec -------- */

    zoom(scalingVector) {
        glm.mat4.scale(this.#scalingMatrix, this.#scalingMatrix, scalingVector);

        this.viewMatrix = this.#initViewMatrix(glm.mat4.create());
    }

    /* -------- Switch the perspective to orthogonal or projection -------- */

    switchView() {
        this.#isProjectionOrthogonal = !this.#isProjectionOrthogonal;
        if(this.#isProjectionOrthogonal) {
            return this.#orthogonalProjectionMatrix;
        }

        return this.#perspectiveProjectionMatrix;
    }

    /* -------- Return the current projection matrix -------- */

    getProjectionMatrix() {
        if(this.#isProjectionOrthogonal) {
            return this.#orthogonalProjectionMatrix;
        }

        return this.#perspectiveProjectionMatrix;
    }

    getIsProjectionOrthogonal() {
        return this.#isProjectionOrthogonal;
    }

    /* -------- Reset Camera -------- */

    /* -------- Camera Preset Views -------- */

    setTopDownView() {
        this.resetCamera();
        this.rotateCamera('x', Math.PI / 4);
        this.rotateCamera('z', 9 * Math.PI / 180 * 5);
    }

    setDefaultView() {
        this.resetCamera();
    }

    setVerticalView() {
        this.resetCamera();
        this.rotateCamera('z', Math.PI / 2);
    }

    resetCamera() {
        this.#globalRotationMatrix = glm.mat4.create();
        this.#scalingMatrix = glm.mat4.create();
        this.#isProjectionOrthogonal = true;
        this.#placeCameraView();
    }
}

export { Camera }
