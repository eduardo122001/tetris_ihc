import * as glm from './gl-matrix/index.js';
import { Shader } from './Shader.js';
import { Camera } from './Camera.js';
import { KeyboardInteraction } from './KeyboardInteraction.js';
import { MouseInteraction } from './MouseInteraction.js';
import { ShapeGenerator } from './ShapeGenerator.js';
import { OBJParser } from './OBJParser.js';
import { GameLogic } from './GameLogic.js';
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

    /* --------- Create tetrisshapes --------- */

    objects.push(shapeGenerator.createShapeI(vaoManager));
    objects.push(shapeGenerator.createShapeL(vaoManager));
    objects.push(shapeGenerator.createShapeN(vaoManager));
    objects.push(shapeGenerator.createShapeO(vaoManager));
    objects.push(shapeGenerator.createShapeT(vaoManager));
    objects.push(shapeGenerator.createShapeTowerLeft(vaoManager));
    objects.push(shapeGenerator.createShapeTowerRight(vaoManager));
    objects.push(shapeGenerator.createShapeTripod(vaoManager));

    /* --------- Initialize color values --------- */

    const colors = [
        glm.vec4.fromValues(253.0, 63.0, 89.0, 1.0),   // Salmon
        glm.vec4.fromValues(254.0, 72.0, 25.0, 1.0),   // Dark orange
        glm.vec4.fromValues(57.0, 137.0, 47.0, 1.0),   // Dark green
        glm.vec4.fromValues(0.0, 119.0, 211.0, 1.0),   // Blue
        glm.vec4.fromValues(120.0, 37.0, 111.0, 1.0),  // Dark purple
        glm.vec4.fromValues(254.0, 251.0, 52.0, 1.0),  // Yellow
        glm.vec4.fromValues(1.0, 237.0, 250.0, 1.0),   // Cyan
        glm.vec4.fromValues(46.0, 63.0, 132.0, 1.0)    // Navy
    ];

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

    /* --------- Prepare textures for shapes --------- */

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = (error) => reject(error);
            image.src = src;
        });
    };

    const loadTexture = (gl, image) => {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    };

    const loadTextures = async (gl, imageSrcs) => {
        const textures = [];

        for (const src of imageSrcs) {
            const image = await loadImage(src);
            const texture = loadTexture(gl, image);
            textures.push(texture);
        }

        return textures;
    };

    const imageSrcs = [
        "textures/texture.jpg",
        "textures/texture2.jpg",
        "textures/texture3.jpg",
        "textures/texture4.png",
        "textures/texture5.jpg",
        "textures/texture6.jpg",
        "textures/texture7.jpg",
        "textures/texture8.jpg",
    ];

    const textures = await loadTextures(gl, imageSrcs);

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
    const grid = createGrid(vaoManager);
    const plane = shapeGenerator.generateGroundPlane(vaoManager);

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

    let gameLogic = new GameLogic(colors, textures);

    /* --------- Build VAOs for all objects with base shader --------- */

    vaoManager.initializeVAOs(gl, sBaseGS);

    window.tetrisGamePrepared = true;
    window.dispatchEvent(new Event('tetris-game-prepared'));
    if (!window.tetrisSensorsReady) {
        await new Promise(resolve => window.addEventListener('tetris-sensors-ready', resolve, { once: true }));
    }

    /* --------- Start game --------- */

    gameLogic.startGame(objects);
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

    /* --------- Draw --------- */

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

        boundingBox.drawVisibleLines(gl, shader, updatedViewMatrix, offsets);

        if(keyboardInteraction.gridEnabled) {
            grid.drawLines(gl, shader, updatedViewMatrix);
        }

        // Bind the shader program and set the projection and view matrices as uniforms
        shader = keyboardInteraction.selectedShader();
        shader.bind(gl);
        shader.uniformMatrices(gl, camera.getProjectionMatrix(), updatedViewMatrix);

        // Draw all the objects in the scene
        gameLogic.tetraCubes.forEach(eachObject => {
            shader.lightingUniforms(gl, camera.viewMatrix);
            shader.updateShadingCoefficients(gl, ambientProduct, diffuseProduct, specularProduct);
            shader.setShadingUniforms(gl, ambientProduct, diffuseProduct, specularProduct, shininess);
            shader.shadowingUniforms(gl, lightMatrix, shadowTexture);
            eachObject.draw(gl, shader, updatedViewMatrix);
        });

        shader.setColorUniform(gl, glm.vec4.fromValues(235., 236., 240., 1.), null);
        shader.setTransparency(gl, glm.vec2.fromValues(1., 0.));
        plane.draw(gl, shader, updatedViewMatrix);
        shader.setTransparency(gl, glm.vec2.fromValues(0., 0.));

        gameLogic.gameProcedure(objects);
        window.requestAnimationFrame(draw);
    };

    /* --------- Restart game --------- */

    const restartGame = () => {
        if (confirm("Game Over! If you want to restart the game click OK")) {
            gameLogic = new GameLogic(colors, textures);
            vaoManager.setTetrisShapeVAO(vaos.VAO_CUBE);
            gameLogic.startGame(objects);
            keyboardInteraction.deleteEvents(camera, gameLogic, shaders, vaoManager);
            keyboardInteraction.registerEvents(camera, gameLogic, shaders, vaoManager);
            mouseInteraction.deleteEvents(canvas, camera);
            mouseInteraction.registerEvents(canvas, camera);
            camera.resetCamera();
        } else {

        }
    }

    document.querySelector('#clickMe').onclick = restartGame;

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
