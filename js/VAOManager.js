const VAO_CUBE = 0;
const VAO_CYLINDER = 1;
const VAO_GRID = 2;
const VAO_BOUNDINGBOX = 3;
const VAO_AMONGUS = 4;
const VAO_PLANE = 5;
const VAO_FLOOR_GRID = 6;
const VAO_PERSPECTIVE_FLOOR_GRID = 7;
const VAO_CUBE_WIREFRAME = 8;

class VAOManager {
    #vaos = new Map()
    #currentTetrisShapeVAO = -1;

    /* -------- Add a new VAO to the manager -------- */

    addVAO(vao, vaoId) {
        this.#vaos.set(vaoId, vao);
    }

    /* -------- Get VAO by ID ------- */

    getVAO(vaoId) {
        if (vaoId < 0)
            return this.#vaos.get(this.#currentTetrisShapeVAO);

        return this.#vaos.get(vaoId);
    }

    /* -------- Initialize all the VAOs -------- */

    initializeVAOs(gl, shader) {
        this.#vaos.forEach(vao => vao.initBuffersAndVAO(gl, shader));
    }

    /* -------- Set the current VAO used for tetris shapes  ------- */

    setTetrisShapeVAO(vaoId) {
        this.#currentTetrisShapeVAO = vaoId;
    }
}

export {
    VAOManager,
    VAO_CUBE,
    VAO_CYLINDER,
    VAO_GRID,
    VAO_BOUNDINGBOX,
    VAO_AMONGUS,
    VAO_PLANE,
    VAO_FLOOR_GRID,
    VAO_PERSPECTIVE_FLOOR_GRID,
    VAO_CUBE_WIREFRAME
}
