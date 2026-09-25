import * as glm from './gl-matrix/index.js';

const initialGravity = -0.0005 / 4;
const cubeHalfLength = 0.15 / 2;
const cubeLength = 0.15;
const gridCellSize = 0.15;
const girdCellSizeInverted = 1 / gridCellSize;
const gridBottomCorner = glm.vec3.fromValues(-0.3, -0.9, -0.3);
const fallSound = await new Audio("../audio/fall.mp3");
const clearSound = await new Audio("../audio/clear.mp3")

const epsilon = 0.001;
const offsets = [
    glm.vec3.fromValues(-cubeHalfLength + epsilon, 0, 0),
    glm.vec3.fromValues(cubeHalfLength - epsilon, 0, 0),
    glm.vec3.fromValues(0, -cubeHalfLength + epsilon, 0),
    glm.vec3.fromValues(0, cubeHalfLength - epsilon, 0),
    glm.vec3.fromValues(0, 0, -cubeHalfLength + epsilon),
    glm.vec3.fromValues(0, 0, cubeHalfLength - epsilon)
];
const gridSizes = [4, 12, 4];

class GameLogic {
    #currentTetracubeIndex = -1;
    #collisionMap;

    constructor(colors, textures) {
        this.tetraCubes = [];
        this.#collisionMap = new Map();
        this.isGameOver = false;
        this.isGamePaused = false;
        this.now;
        this.last = performance.now();
        this.deltaTime = 0;
        this.gravityFactor = initialGravity;
        this.colors = colors;
        this.textures = textures;
        this.currentObject;
    }

    startGame(tetrisObjects) {
        this.placeTetrisObject(tetrisObjects);
    }

    gameProcedure(tetrisObjects) {
        if(!this.isGamePaused && !this.isGameOver) {

            this.now = performance.now();
            this.deltaTime = this.now - this.last;
            this.last = this.now;

            const newPosition = [0, this.deltaTime * this.gravityFactor, 0];
            const positions = this.currentObject.getPosition(); // Array of cube positions

            if(this.checkGravity(newPosition)) {
                this.currentObject.translate(newPosition);
            } else {
                // New position should have been adjusted by checkGravity
                this.currentObject.translate(newPosition);
                this.changeFieldStates(this.currentObject);
                let numberOfLinesDeleted = null;
                while (numberOfLinesDeleted === null || numberOfLinesDeleted > 0) {
                    numberOfLinesDeleted = this.deleteFullHorizontalLines();
                    this.tetraCubes = this.tetraCubes.filter((tetraCube) => tetraCube.getCubes().length > 0);
                    this.moveShapesAfterSlice();
                }

                if(!this.checkIfGameOver()) {
                    fallSound.play();
                    this.currentObject.setColor(getRandomColor(this.colors));
                    this.placeTetrisObject(tetrisObjects);
                }
            }
        }
    }

    changeFieldStates(tetraCube) {
        const cubes = tetraCube.getCubes();

        cubes.forEach(cube => {
            const position = cube.getPosition();
            const floatPos = glm.vec3.fromValues(position.x, position.y, position.z);
            const gridPos = roundToGridCoordinates(floatPos);
            const addToMap = `${gridPos[0]}|${gridPos[1]}|${gridPos[2]}`;
            this.#collisionMap.set(addToMap, () => tetraCube.deleteCube(cube));
        });
    }

    deleteOldFieldStates(tetraCube) {
        const cubes = tetraCube.getCubes();

        cubes.forEach(cube => {
            const position = cube.getPosition();
            const floatPos = glm.vec3.fromValues(position.x, position.y, position.z);
            const gridPos = roundToGridCoordinates(floatPos);
            const addToMap = `${gridPos[0]}|${gridPos[1]}|${gridPos[2]}`;
            this.#collisionMap.delete(addToMap);
        });
    }

    checkGravity(deltaTranslate) {
        const coverNGridCellsY = Math.ceil(Math.abs(deltaTranslate[1]) / gridCellSize);
        let cubePositions = this.currentObject.getPosition();
        let translationMatrix = glm.mat4.create();
        glm.mat4.fromTranslation(translationMatrix, deltaTranslate);

        // Store the maximum length that we need to move an object
        // 'up' again if we collided, keep it 'null' if we don't
        // have a collision
        let maximumCollisionCorrection = null;

        for(let i = 0; i < cubePositions.length; i++) {
            let newPosition = glm.vec3.create();
            glm.vec3.add(newPosition, glm.vec3.fromValues(cubePositions[i].x, cubePositions[i].y, cubePositions[i].z), deltaTranslate);

            // Get the possible grids for all borders of the cube
            const gridCoordinates = findCubeBorderPoints(newPosition)
                .map(coordsToGridRelativeCoords)
                .map(cubeBorderPoint => {
                    return {
                        floatCoords: cubeBorderPoint,
                        gridCoords: roundGridRelativeCoords(cubeBorderPoint)
                    };
                });

            // Check grid coordinates for collision
            for (const coord of gridCoordinates) {
                // First case: Check y coordinate, if negative object is at bottom
                if (coord.gridCoords[1] < 0) {
                    const correction = -coord.floatCoords[1];
                    if (maximumCollisionCorrection === null || correction > maximumCollisionCorrection) {
                        maximumCollisionCorrection = correction;
                    }
                }

                // Second case: Collision with other objects
                for (let yTries = 0; yTries < coverNGridCellsY; yTries++) {
                    const yCell = coord.gridCoords[1] + yTries;
                    const lookup = `${coord.gridCoords[0]}|${yCell}|${coord.gridCoords[2]}`;
                    if (this.#collisionMap.has(lookup)) {
                        const upperBorder = (yCell + 1) * gridCellSize;
                        const correction = upperBorder - coord.floatCoords[1];
                        if (maximumCollisionCorrection === null || correction > maximumCollisionCorrection) {
                            maximumCollisionCorrection = correction;
                        }
                    }
                }
            }
        }

        // Update delta if we had a collision
        if (maximumCollisionCorrection !== null) {
            deltaTranslate[1] += maximumCollisionCorrection;
            return false;
        }

        return true;
    }

    checkTransformForMovingDown(tetracube) {
        let cubePositions = tetracube.getPosition();

        for(let i = 0; i < cubePositions.length; i++) {
            let newPosition = glm.vec3.fromValues(cubePositions[i].x, cubePositions[i].y, cubePositions[i].z);

            // Get the possible grids for all borders of the cube
            const gridCoordinate = roundToGridCoordinates(newPosition)

            // Check if any component is out of grid bounds
            for (let c = 0; c < 3; c++) {
                 if (gridCoordinate[c] < 0)
                     return false;

                 // Don't check positive y, because shapes fall from above
                 if (gridCoordinate[c] >= gridSizes[c] && c != 1)
                     return false;
             }

            // Check y coordinate, if negative object is at bottom
            if (this.#collisionMap.has(`${gridCoordinate[0]}|${gridCoordinate[1]}|${gridCoordinate[2]}`)) {
                return false;
            }
        }

        return true;
    }

    checkTransform(tetracube) {
        let cubePositions = tetracube.getPosition();

        for(let i = 0; i < cubePositions.length; i++) {
            let newPosition = glm.vec3.fromValues(cubePositions[i].x, cubePositions[i].y, cubePositions[i].z);

            // Get the possible grids for all borders of the cube
            const cubeCenterPosition = newPosition.subarray(0, 3);
            const gridCoordinates = offsets.map(offset => {
                const cubeBorderPoint = glm.vec3.create();
                glm.vec3.add(cubeBorderPoint, newPosition, offset);
                return cubeBorderPoint;
            }).map(roundToGridCoordinates);

            // Check grid coordinates for collision
            for (const gridCoordinate of gridCoordinates) {

                // // Check if any component is out of grid bounds
                 for (let c = 0; c < 3; c++) {
                     if (gridCoordinate[c] < 0) {
                         return false;
                     }

                     // Don't check positive y, because shapes fall from above
                     if (gridCoordinate[c] >= gridSizes[c] && c != 1) {
                         return false;
                     }
                 }

                // Check y coordinate, if negative object is at bottom
                if (this.#collisionMap.has(`${gridCoordinate[0]}|${gridCoordinate[1]}|${gridCoordinate[2]}`)) {
                    return false;
                }
            }
        }

        return true;
    }

    deleteFullHorizontalLines() {
        let numberOfLinesDeleted = 0;
        for (let y = 0; y < gridSizes[1]; y++) {
            let rowFull = true;

            outer:
            for (let x = 0; x < gridSizes[0]; x++) {
                for (let z = 0; z < gridSizes[2]; z++) {
                    if (!this.#collisionMap.has(`${x}|${y}|${z}`)) {
                        rowFull = false;
                        break outer;
                    }
                }
            }

            if (rowFull) {
                for (let x = 0; x < gridSizes[0]; x++) {
                    for (let z = 0; z < gridSizes[2]; z++) {
                        const key = `${x}|${y}|${z}`;
                        const cubeDeletion = this.#collisionMap.get(key);
                        this.#collisionMap.delete(key);
                        cubeDeletion();
                        numberOfLinesDeleted++;
                    }
                }
                clearSound.play();
            }
        }
        return numberOfLinesDeleted;
    }

    moveShapesAfterSlice() {
       let tetraCubesChanged = null;

       while(tetraCubesChanged === null || tetraCubesChanged > 0) {
           tetraCubesChanged = 0;

            for(let i = 0; i < this.tetraCubes.length; i++) {
                const tetraCube = this.tetraCubes[i];
                tetraCube.getPosition();
                const clone = tetraCube.clone();
                clone.getPosition();
                clone.translate([0, -cubeLength, 0]);

                // We need to remove the tetracube from the collision
                // map before checking for collision, otherwise it
                // will collide with itself
                this.deleteOldFieldStates(tetraCube);

                if(this.checkTransformForMovingDown(clone)) {
                    tetraCube.translate([0, -cubeLength, 0]);
                    tetraCubesChanged++;
                }

                // Either the tetracube has moved, or not, but we need
                // to add it back to the collision map either way.
                this.changeFieldStates(tetraCube);
            }
        }
    }

    placeTetrisObject(tetrisObjects) {
        const tetrisObject = tetrisObjects[Math.floor(Math.random() * tetrisObjects.length)];
        const clone = tetrisObject.clone();
        clone.setColor(getRandomColor(this.colors));

        if(Math.random() < 0.27) {
            clone.setTexture(getRandomTexture(this.textures));
        }

        if(Math.random() < 0.2) {
            clone.setTransparency(glm.vec2.fromValues(0., 1.));
        }

        this.tetraCubes.push(clone);
        this.currentObject = clone;
        this.gravityFactor = initialGravity;
    }

    getTetraCubes() {
        return this.currentObject
    }

    checkIfGameOver() {
        if(this.tetraCubes.length > 0) {
            const cubePositions = this.currentObject.getPosition();

            for(let i = 0; i < cubePositions.length; i++) {
                if(cubePositions[i].y > 0.9) {
                    this.isGameOver = true;
                }
            }
        }

        return this.isGameOver;
    }

    setGravityFactor(gravityFactor) {
        this.gravityFactor = gravityFactor;
    }
}

const coordsToGridRelativeCoords = (posVec) => {
    // Make sure that coordinates are relative to the grid corner
    const gridCornerAsOrigin = glm.vec3.create();
    glm.vec3.sub(gridCornerAsOrigin, posVec, gridBottomCorner);
    return gridCornerAsOrigin;
}

const roundGridRelativeCoords = (posVec) => {
    // Divide through gridCellSize, to get grid coordinates
    const gridCornerAsOrigin = glm.vec3.clone(posVec);
    glm.vec3.scale(gridCornerAsOrigin, gridCornerAsOrigin, girdCellSizeInverted);
    return gridCornerAsOrigin.map(Math.floor);
}

const roundToGridCoordinates = (posVec) => {
    const gridCornerAsOrigin = coordsToGridRelativeCoords(posVec);
    return roundGridRelativeCoords(gridCornerAsOrigin);
};

const findCubeBorderPoints = (cubeCenter) => {
    return offsets.map(offset => {
        const cubeBorderPoint = glm.vec3.create();
        glm.vec3.add(cubeBorderPoint, cubeCenter, offset);
        return cubeBorderPoint;
    })
};

const getRandomColor = (colors) => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const getRandomTexture = (textures) => {
    const randomIndex = Math.floor(Math.random() * textures.length);
    return textures[randomIndex];
};

export { GameLogic };
