import * as glm from './gl-matrix/index.js';
import { round } from './gl-matrix/vec3.js';
import { Shape } from './Shape.js';

const KEYBOARD_SENSITIVITY = 0.05; // Constant to represent the sensitivity of the keyboard input
const ROTATION_ANGLE = Math.PI / 180 * 90; // Rotate shape 90 degrees per key press
const CAMERA_ROTATION_ANGLE = Math.PI / 180 * 5; // Rotate camer 5 degrees per key press
const TRANSLATION_FACTOR = 0.15; // One Unit (cube length)

class KeyboardInteraction {
    #selectedShader = null;
    #isPhongShader = false;
    #isDrawCubes = true;
    #isAmogusMode = false;
    #handler;
    #clonedCubies = [];

    /* -------- Register keybord events for movement -------- */

    registerEvents(camera, gameLogic, shaders, vaoManager) {
        this.gridEnabled = false;
        this.#selectedShader = shaders.get("sBaseGS");
        this.#isPhongShader = false;
        this.#isDrawCubes = true;
        this.#isAmogusMode = false;
        this.#handler = (event) => this.#handleKeyDown(event, camera, gameLogic, shaders, vaoManager);
        document.addEventListener('keydown', this.#handler);
    }

    /* -------- Delete keybord events -------- */

    deleteEvents(camera, gameLogic, shaders, vaoManager) {
        this.gridEnabled = false;
        this.#selectedShader = shaders.get("sBaseGS");
        document.removeEventListener('keydown', this.#handler);
    }
    
    /* -------- Select shaders -------- */

    #selectShader(shaders) {
        this.#isPhongShader = !this.#isPhongShader;
        if(!this.#isPhongShader) {
            this.#selectedShader = shaders.get("sBaseGS");
        } else {      
            this.#selectedShader = shaders.get("sBasePS");
        }    
    }

    /* -------- Return current selected shader -------- */

    selectedShader() {
        return this.#selectedShader;
    }

    /* -------- Handle keyboard input -------- */

    #handleKeyDown(event, camera, gameLogic, shaders, vaoManager) {

        switch(event.key) {
            /* -------- Translate shape -------- */
            case 'd':
            case 'ArrowRight':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.translate([TRANSLATION_FACTOR, 0, 0]);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().translate([TRANSLATION_FACTOR, 0, 0]);
                    }
                }
                break;
            case 'a':
            case 'ArrowLeft':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.translate([-TRANSLATION_FACTOR, 0, 0]);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().translate([-TRANSLATION_FACTOR, 0, 0]);
                    }
                }
                break;
            case 'w':
            case 'ArrowUp':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.translate([0, 0, -TRANSLATION_FACTOR]);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().translate([0, 0, -TRANSLATION_FACTOR]);
                    }
                }
                break;
            case 's':
            case 'ArrowDown':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.translate([0, 0, TRANSLATION_FACTOR]);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().translate([0, 0, TRANSLATION_FACTOR]);
                    }
                }
                break;

            /* -------- Rotate shape -------- */
            case 'x':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.rotate('x', ROTATION_ANGLE);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().rotate('x', ROTATION_ANGLE);
                    }
                }
                break;
            case 'X':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.rotate('x', -ROTATION_ANGLE);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().rotate('x', -ROTATION_ANGLE);
                    }
                }
                break;
            case 'y':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.rotate('y', ROTATION_ANGLE);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().rotate('y', ROTATION_ANGLE);
                    }
                }
                break;
            case 'Y':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.rotate('y', -ROTATION_ANGLE);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().rotate('y', -ROTATION_ANGLE);
                    }
                }
                break;
            case 'z':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.rotate('z', ROTATION_ANGLE);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().rotate('z', ROTATION_ANGLE);
                    }
                }
                break;
            case 'Z':
                if(isCheatMode(gameLogic)) {
                    this.#clonedCubies = gameLogic.getTetraCubes().clone();
                    this.#clonedCubies.rotate('z', -ROTATION_ANGLE);

                    if(gameLogic.checkTransform(this.#clonedCubies)) {
                        gameLogic.getTetraCubes().rotate('z', -ROTATION_ANGLE);
                    }
                }
                break;

            /* -------- (Un)pause the game (stop/restart gravity) -------- */
            case 'p':
                if(!gameLogic.isGameOver) {
                    gameLogic.isGamePaused = !gameLogic.isGamePaused;

                    if(gameLogic.isGamePaused) {
                        gameLogic.deltaTime = performance.now() - gameLogic.last;
                    }
                    else {
                        gameLogic.last = performance.now() - gameLogic.deltaTime;
                    }
                }
                break;

            /* -------- Drop shape fast and release control -------- */
            case ' ':
                event.preventDefault();
                if(!gameLogic.isGamePaused && !gameLogic.isGameOver) {
                    gameLogic.setGravityFactor(-0.075 / 4);
                }
                break;

            /* -------- Rotate camera -------- */
            case 'j':
                camera.rotateCamera('y', CAMERA_ROTATION_ANGLE);
                break;
            case 'l':
                camera.rotateCamera('y', -CAMERA_ROTATION_ANGLE);
                break;
            case 'i':
                camera.rotateCamera('x', CAMERA_ROTATION_ANGLE);
                break;
            case 'k':
                camera.rotateCamera('x', -CAMERA_ROTATION_ANGLE);
                break;
            case 'u':
                camera.rotateCamera('z', CAMERA_ROTATION_ANGLE);
                break;
            case 'o':
                camera.rotateCamera('z', -CAMERA_ROTATION_ANGLE);
                break;

            /* -------- Zoom camera -------- */
            case '+':
                camera.zoom(glm.vec3.fromValues(1 + KEYBOARD_SENSITIVITY, 1 + KEYBOARD_SENSITIVITY, 1 + KEYBOARD_SENSITIVITY));
                break;
            case '-':
                camera.zoom(glm.vec3.fromValues(1 - KEYBOARD_SENSITIVITY, 1 - KEYBOARD_SENSITIVITY, 1 - KEYBOARD_SENSITIVITY));
                break;

            /* -------- Switch view -------- */
            case 'v':
                camera.switchView(camera.getIsProjectionOrthogonal());
                break;

            /* -------- Switch shader -------- */
            case 'f':
                this.#selectShader(shaders);
                console.log(this.#selectedShader);
                break;

            /* -------- Show underlying grid -------- */
            case 'g':
                this.gridEnabled = !this.gridEnabled;
                break;

            /* -------- Render objects as cylinders -------- */
            case 'b':
                this.#isDrawCubes = !this.#isDrawCubes;
                if(this.#isDrawCubes) {
                    vaoManager.setTetrisShapeVAO(0);
                } else {
                    vaoManager.setTetrisShapeVAO(1);
                }
                break;

            /* -------- Render objects as amogus -------- */
            case 'n':
                this.#isAmogusMode = !this.#isAmogusMode;
                if(this.#isAmogusMode) {
                    vaoManager.setTetrisShapeVAO(4);
                } else {
                    vaoManager.setTetrisShapeVAO(0);
                }
                break;
                /* -------- Change camera views -------- */
            case '1':
                // Vista 2D (desde arriba hacia abajo)
                if(typeof camera.setTopDownView === 'function') {
                    camera.setTopDownView();
                } else {
                    console.log("Falta implementar setTopDownView() en Camera.js");
                }
                break;
            case '2':
                // Vista por defecto
                if(typeof camera.setDefaultView === 'function') {
                    camera.setDefaultView();
                } else {
                    console.log("Falta implementar setDefaultView() en Camera.js");
                }
                break;
            case '3':
                // Vista vertical
                if(typeof camera.setVerticalView === 'function') {
                    camera.setVerticalView();
                } else {
                    console.log("Falta implementar setVerticalView() en Camera.js");
                }
                break;
        }
    }
}

/* -------- Activate cheatmode -------- */
//If this returns true, objects can be moved while the game is paused
const isCheatMode = (gameLogic) => {
    const checkBox = document.querySelector('#accept');

    if (checkBox.checked) {
        return true;
    } else {
        return (!gameLogic.isGamePaused  && !gameLogic.isGameOver);
    }
}

export { KeyboardInteraction }
