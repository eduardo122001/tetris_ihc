import { Shape } from './Shape.js';
import { VAO } from './VAO.js';
import {
    VAO_DIRECTION_UP,
    VAO_DIRECTION_DOWN,
    VAO_DIRECTION_LEFT,
    VAO_DIRECTION_RIGHT
} from './VAOManager.js';

const loadTexture = (gl, source) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        resolve(texture);
    };
    image.onerror = () => reject(new Error(`No se pudo cargar la guia: ${source}`));
    image.src = source;
});

const createHorizontalPlane = (centerX, centerZ, width, depth) => {
    const y = -0.887;
    const x0 = centerX - width / 2;
    const x1 = centerX + width / 2;
    const z0 = centerZ - depth / 2;
    const z1 = centerZ + depth / 2;

    return {
        vertices: new Float32Array([
            x0, y, z0,  x1, y, z0,  x1, y, z1,  x0, y, z1
        ]),
        normals: new Float32Array([
            0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0
        ]),
        textures: new Float32Array([0, 0,  1, 0,  1, 1,  0, 1]),
        indices: new Uint16Array([0, 2, 1,  0, 3, 2])
    };
};

export const createDirectionGuides = async (gl, vaoManager) => {
    const planes = [
        ['up', VAO_DIRECTION_UP, 'assets/direction-guides/neonarriba.png', 0, -0.57, 0.38, 0.21],
        ['down', VAO_DIRECTION_DOWN, 'assets/direction-guides/neonabajo.png', 0, 0.57, 0.38, 0.21],
        ['left', VAO_DIRECTION_LEFT, 'assets/direction-guides/neonizquierda.png', -0.57, 0, 0.38, 0.12],
        ['right', VAO_DIRECTION_RIGHT, 'assets/direction-guides/neonderecha.png', 0.57, 0, 0.38, 0.12]
    ];
    const guides = {};

    for(const [name, vaoId, source, x, z, width, depth] of planes) {
        const plane = createHorizontalPlane(x, z, width, depth);
        vaoManager.addVAO(new VAO(
            plane.vertices,
            plane.normals,
            plane.indices,
            plane.textures
        ), vaoId);

        const shape = new Shape(vaoManager, vaoId);
        shape.setTexture(await loadTexture(gl, source));
        guides[name] = shape;
    }

    return guides;
};
