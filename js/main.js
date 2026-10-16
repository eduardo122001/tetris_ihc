import * as glm from './gl-matrix/index.js';
import { Shader } from './Shader.js';
import { Camera } from './Camera.js';
import { KeyboardInteraction } from './KeyboardInteraction.js';
import { MouseInteraction } from './MouseInteraction.js';
import { ShapeGenerator } from './ShapeGenerator.js';
import { OBJParser } from './OBJParser.js';
import { GameLogic } from './GameLogic.js';
import { LEVEL_COLORS } from './levelColors.js';
import { createBoundingBox, offsets } from './boundingBox.js';
import { createGrid } from './grid.js';
import * as vaos from './VAOManager.js';

const main = async () => {

    /* -------- Instantiation -------- */

    const sBase = new Shader("basic", "basic");
    const sBaseS = new Shader("basicShadow", "basicShadow");
    const sBaseGS = new Shader("gouraudWithSpecular", "gouraud");
    const sBasePS = new Shader("phong", "phongWithSpecular");
    const camera = new Camera();
    const objParser = new OBJParser();
    const shapeGenerator = new ShapeGenerator();
    const keyboardInteraction = new KeyboardInteraction();
    const mouseInteraction = new MouseInteraction();
    const vaoManager = new vaos.VAOManager();

    /* --------- Initialize shading values --------- */ 

    let ambientProduct = glm.vec3.fromValues(0.4, 0.4, 0.4);
    let diffuseProduct = glm.vec3.fromValues(0.7, 0.7, 0.7);
    let specularProduct = glm.vec3.fromValues(1.0, 1.0, 1.0);
    const shininess = 42.0;

    let sliderAmbient;
    let sliderDiffuse;
    let sliderSpecular;

    const lightViewMatrix = glm.mat4.create();
    const target = glm.vec3.create();
    glm.mat4.lookAt(lightViewMatrix, [0., 10., 0.], target, [0, 0, -1]);
   
    /* --------- Initialize matrices and objects --------- */

    const projectionMatrixFromLight = glm.mat4.create();
    const updatedViewMatrix = glm.mat4.create();
    const objects = []; // Array to store generated objects
    const shaders = new Map(); // Array to store loaded shaders

    /* --------- Create flat tetrisshapes --------- */

    objects.push(shapeGenerator.createShapeMonomino(vaoManager));
    objects.push(shapeGenerator.createShapeDomino(vaoManager));
    objects.push(shapeGenerator.createShapeTrominoStraight(vaoManager));
    objects.push(shapeGenerator.createShapeTrominoL(vaoManager));
    const squareShape = shapeGenerator.createShapeTetrominoO(vaoManager);
    objects.push(squareShape);
    objects.push(shapeGenerator.createShapeTetrominoT(vaoManager));
    objects.push(shapeGenerator.createShapeTetrominoS(vaoManager));
    objects.push(shapeGenerator.createShapeTetrominoZ(vaoManager));
    const tutorialObjects = objects.filter(shape => shape !== squareShape);
    const getAvailableObjects = () => window.tetrisTutorialMode ? tutorialObjects : objects;

    /* --------- Initialize color values --------- */

    /* --------- Basic setup --------- */

    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: false,
    });

    // Check if WebGL is available in the browser
    if (gl === null) {
        console.log("WebGL is not available in this browser");
        return;
    }

    console.log(canvas);

    /* --------- Update shader values if slider moves --------- */

    sliderAmbient = document.querySelector("#ambientProduct");
    sliderDiffuse = document.querySelector("#diffuseProduct");
    sliderSpecular = document.querySelector("#specularProduct");

    sliderAmbient.oninput = function() {
        ambientProduct = glm.vec3.fromValues(sliderAmbient.value / 100, sliderAmbient.value / 100, sliderAmbient.value / 100);
    }
    sliderDiffuse.oninput = function() {
        diffuseProduct = glm.vec3.fromValues(sliderDiffuse.value / 100, sliderDiffuse.value / 100, sliderDiffuse.value / 100);
    }
    sliderSpecular.oninput = function() {
        specularProduct = glm.vec3.fromValues(sliderSpecular.value / 100, sliderSpecular.value / 100, sliderSpecular.value / 100);
    }

    /* --------- Load shader --------- */

    await sBase.loadAndCompile(gl);
    shaders.set('sBase', sBase);

    await sBaseS.loadAndCompile(gl);
    shaders.set('sBaseS', sBaseS);

    await sBaseGS.loadAndCompile(gl);
    shaders.set('sBaseGS', sBaseGS);

    await sBasePS.loadAndCompile(gl);
    shaders.set('sBasePS', sBasePS);

    /* --------- Initialize the tetris shapes to be drawn --------- */

    const boundingBox = createBoundingBox(vaoManager);
    const { lines: grid, floor: floorGrid, perspectiveFloor } = createGrid(vaoManager);
    const plane = shapeGenerator.generateGroundPlane(vaoManager);
    const floorSurface = plane.clone();
    floorSurface.translate([0., -0.002, 0.]);

    const cube = await fetch('/objects/cube.obj')
        .then(response => response.text());
    const cylinder = await fetch('/objects/cylinder.obj')
        .then(response => response.text());
    const amongus = await fetch('/objects/widemogus.obj')
        .then(response => response.text());

    const cubeData = objParser.parse(cube);
    const cylinderData = objParser.parse(cylinder);
    const amongusData = objParser.parse(amongus);

    const vaoCube = shapeGenerator.createVAOFromOBJFile(cubeData);
    vaoManager.addVAO(vaoCube, vaos.VAO_CUBE);
    shapeGenerator.createCubeWireframeVAO(vaoManager);
    const vaoCylinder = shapeGenerator.createVAOFromOBJFile(cylinderData);
    vaoManager.addVAO(vaoCylinder, vaos.VAO_CYLINDER);
    const vaoAmongus = shapeGenerator.createVAOFromOBJFile(amongusData);
    vaoManager.addVAO(vaoAmongus, vaos.VAO_AMONGUS);

    /* --------- Set default tetris shape VAO --------- */

    vaoManager.setTetrisShapeVAO(vaos.VAO_CUBE);

    /* --------- Initializes projection matrix --------- */

    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    camera.initializeProjectionMatrices(aspectRatio);

    glm.mat4.ortho(
        projectionMatrixFromLight,
        -aspectRatio,
        aspectRatio,
        -1,
        1,
        0.1,
        100.0
    );

    const updateLightViewMatrix = () => {
        glm.mat4.multiply(updatedViewMatrix, lightViewMatrix, glm.mat4.create());
        glm.mat4.multiply(lightMatrix, projectionMatrixFromLight, updatedViewMatrix);
    }

    /* --------- Updating view matrix --------- */

    const updateCameraViewMatrix = () => {
        glm.mat4.multiply(updatedViewMatrix, camera.viewMatrix, glm.mat4.create());
    }

    /* --------- Initialize gamelogic --------- */

    let gameLogic = new GameLogic();

    /* --------- Build VAOs for all objects with base shader --------- */

    vaoManager.initializeVAOs(gl, sBaseGS);

    window.tetrisGamePrepared = true;
    window.dispatchEvent(new Event('tetris-game-prepared'));
    if (!window.tetrisSensorsReady) {
        await new Promise(resolve => window.addEventListener('tetris-sensors-ready', resolve, { once: true }));
    }

    /* --------- Start game --------- */

    gameLogic.startGame(getAvailableObjects());
    if (window.tetrisTutorialMode) {
        gameLogic.isGamePaused = true;
        window.addEventListener('tetris-tutorial-finished', () => {
            gameLogic.isGamePaused = false;
            gameLogic.last = performance.now() - gameLogic.deltaTime;
        }, { once: true });
    }
    window.tetrisGameStarted = true;

    /* --------- Register keyboard and mouse events --------- */

    keyboardInteraction.registerEvents(camera, gameLogic, shaders, vaoManager);
    mouseInteraction.registerEvents(canvas, camera);
    window.dispatchEvent(new Event('tetris-started'));

    playBackgroundMusic();

    /* -------- Create & bind FBO -------- */

    const shadowFBO = gl.createFramebuffer();

    /* -------- Create & bind texture -------- */

    const shadowTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

     /* -------- Attach texture to shadow -------- */

    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowTexture, 0);

    const renderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1024, 1024);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const lightMatrix = glm.mat4.create();
    glm.mat4.multiply(lightMatrix, projectionMatrixFromLight, lightViewMatrix);

    const gameLevel = document.querySelector('#gameLevel');
    const levelColors = document.querySelector('#levelColors');
    const piecesPlaced = document.querySelector('#piecesPlaced');
    const linesCleared = document.querySelector('#linesCleared');
    LEVEL_COLORS.forEach(([red, green, blue], index) => {
        const element = document.createElement('span');
        element.className = 'level-color';
        element.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
        element.dataset.height = `Y${index}`;
        element.title = `Altura Y ${index}`;
        element.setAttribute('aria-label', `Color de la altura Y ${index}`);
        levelColors.prepend(element);
    });
    let renderedStats = '';

    const updateGameStats = () => {
        const stats = gameLogic.getStats();
        const statsKey = `${stats.level}:${stats.piecesPlaced}:${stats.linesCleared}`;
        if (statsKey === renderedStats) return;
        renderedStats = statsKey;
        gameLevel.textContent = String(stats.level);
        piecesPlaced.textContent = String(stats.piecesPlaced);
        linesCleared.textContent = String(stats.linesCleared);
    };

    /* --------- Draw --------- */

    let gameOverNotified = false;
    const draw = () => {
        // Clear the screen with color
        gl.clearColor(1.0, 1.0, 1.0, 1.0);

        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFBO);
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, 1024, 1024);

        // Clear the color and depth buffers
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.cullFace(gl.FRONT);

        // Update the view matrix based on camera position and orientation
        updateLightViewMatrix();

        // Bind the shader program and set the projection and view matrices as uniforms
        let shader = shaders.get('sBaseS');
        shader.bind(gl);
        shader.uniformMatrices(gl, projectionMatrixFromLight, updatedViewMatrix);

        // Draw shadow
        gameLogic.currentObject.draw(gl, shader, updatedViewMatrix);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0., 0., 0., 1.0);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.cullFace(gl.BACK);

        // Update the view matrix based on camera position and orientation
        updateCameraViewMatrix();

        shader = shaders.get('sBase');
        shader.bind(gl);
        shader.uniformMatrices(gl, camera.getProjectionMatrix(), updatedViewMatrix);

        const isPerspectiveView = camera.getIsPerspectiveView();
        shader.setColorUniform(gl, glm.vec4.fromValues(255., 255., 255., 1.), null);
        if(isPerspectiveView) {
            boundingBox.drawLinesExcludingFace(
                gl,
                shader,
                updatedViewMatrix,
                offsets,
                [0, 1, 0]
            );
        } else {
            boundingBox.drawVisibleLines(gl, shader, updatedViewMatrix, offsets);
        }

        if(keyboardInteraction.gridEnabled) {
            shader.setColorUniform(gl, glm.vec4.fromValues(255., 255., 255., 1.), null);
            grid.drawLines(gl, shader, updatedViewMatrix);
        }
        if(!isPerspectiveView) {
            const [floorRed, floorGreen, floorBlue] = LEVEL_COLORS[0];
            shader.setColorUniform(gl, glm.vec4.fromValues(floorRed, floorGreen, floorBlue, 1.), null);
            floorGrid.drawLines(gl, shader, updatedViewMatrix);
        }

        // Bind the shader program and set the projection and view matrices as uniforms
        shader = keyboardInteraction.selectedShader();
        shader.bind(gl);
        shader.uniformMatrices(gl, camera.getProjectionMatrix(), updatedViewMatrix);

        // Draw all the objects in the scene
        gameLogic.tetraCubes.forEach(eachObject => {
            if(eachObject === gameLogic.currentObject) return;
            shader.lightingUniforms(gl, camera.viewMatrix);
            shader.updateShadingCoefficients(gl, ambientProduct, diffuseProduct, specularProduct);
            shader.setShadingUniforms(gl, ambientProduct, diffuseProduct, specularProduct, shininess);
            shader.shadowingUniforms(gl, lightMatrix, shadowTexture);
            eachObject.draw(gl, shader, updatedViewMatrix);
        });

        shader.setColorUniform(gl, glm.vec4.fromValues(38., 92., 122., 1.), null);
        shader.setTransparency(gl, glm.vec2.fromValues(0., 0.));
        floorSurface.draw(gl, shader, updatedViewMatrix);
        shader.setColorUniform(gl, glm.vec4.fromValues(255., 210., 45., 1.), null);
        shader.setTransparency(gl, glm.vec2.fromValues(1., 0.));
        plane.draw(gl, shader, updatedViewMatrix);
        shader.setTransparency(gl, glm.vec2.fromValues(0., 0.));
        if(isPerspectiveView) {
            shader = shaders.get('sBase');
            shader.bind(gl);
            shader.uniformMatrices(gl, camera.getProjectionMatrix(), updatedViewMatrix);
            shader.setColorUniform(gl, glm.vec4.fromValues(220., 235., 245., 1.), null);
            perspectiveFloor.drawLines(gl, shader, updatedViewMatrix);

            shader = keyboardInteraction.selectedShader();
            shader.bind(gl);
            shader.uniformMatrices(gl, camera.getProjectionMatrix(), updatedViewMatrix);
        }
        if(isPerspectiveView) {
            shader = shaders.get('sBase');
            shader.bind(gl);
            shader.uniformMatrices(gl, camera.getProjectionMatrix(), updatedViewMatrix);
            shader.setColorUniform(gl, glm.vec4.fromValues(1., 0.92, 0.12, 1.), null);
            gameLogic.currentObject.drawOutline(
                gl,
                shader,
                updatedViewMatrix,
                vaos.VAO_CUBE_WIREFRAME
            );
        } else {
            shader.lightingUniforms(gl, camera.viewMatrix);
            shader.updateShadingCoefficients(gl, ambientProduct, diffuseProduct, specularProduct);
            shader.setShadingUniforms(gl, ambientProduct, diffuseProduct, specularProduct, shininess);
            shader.shadowingUniforms(gl, lightMatrix, shadowTexture);
            gameLogic.currentObject.draw(
                gl,
                shader,
                updatedViewMatrix,
                false
            );
        }

        gameLogic.gameProcedure(getAvailableObjects());
        updateGameStats();
        document.querySelector('#gameOverScreen').hidden = !gameLogic.isGameOver;
        if (gameLogic.isGameOver && !gameOverNotified) {
            gameOverNotified = true;
            window.dispatchEvent(new Event('tetris-game-over'));
        }
        window.requestAnimationFrame(draw);
    };

    /* --------- Restart game --------- */

    const resetGame = () => {
        gameLogic = new GameLogic();
        gameOverNotified = false;
        vaoManager.setTetrisShapeVAO(vaos.VAO_CUBE);
        gameLogic.startGame(getAvailableObjects());
        keyboardInteraction.deleteEvents(camera, gameLogic, shaders, vaoManager);
        keyboardInteraction.registerEvents(camera, gameLogic, shaders, vaoManager);
        mouseInteraction.deleteEvents(canvas, camera);
        mouseInteraction.registerEvents(canvas, camera);
        camera.resetCamera();
        window.dispatchEvent(new Event('tetris-game-restarted'));
    }

    const restartGame = () => {
        if (confirm("¿Quieres reiniciar la partida?")) resetGame();
    };

    window.addEventListener('tetris-restart-game', resetGame);
    document.querySelector('#gameOverRestartButton').addEventListener('click', resetGame);
    document.querySelector('#clickMe').onclick = restartGame;

    if (window.tetrisFreshStartRequested) {
        window.tetrisFreshStartRequested = false;
        resetGame();
    }

    window.requestAnimationFrame(draw);
}

const playBackgroundMusic = () => {
    const playButton = document.querySelector('#playButton');
    const stopButton = document.querySelector('#stopButton');
    const audioPlayer = document.querySelector('#audioPlayer');

    playButton.addEventListener('click', function() {
        audioPlayer.play();
    });

    stopButton.addEventListener('click', function() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    });
}

main();
