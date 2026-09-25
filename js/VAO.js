class VAO {
    #vaoIndex = -1; // Index of vertex array object
    #indexCount = -1; // Number of indices for drawing

    constructor(vertices, normals, indices, textures) {
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.textures = textures;
        this.#indexCount = indices.length;
    }

    /* -------- Initialize & bind buffers -------- */

    initBuffersAndVAO(gl, shader) {
        this.#createAndBindVAO(gl);

        this.#createAndBindVertexBuffer(gl);
        this.#enableAndBindVertexAttribs(gl, shader);

        if(this.normals !== null) {
            this.#createAndBindNormalBuffer(gl);
            this.#enableAndBindNormalAttribs(gl, shader);
        }

        if(this.textures !== null) {
            this.#createAndBindTextureBuffer(gl);
            this.#enableAndBindTextureAttribs(gl, shader);
        }

        this.#createAndBindIndexBuffer(gl);
    }

    /* -------- Create & bind VAO -------- */

    #createAndBindVAO(gl) {
        this.#vaoIndex = gl.createVertexArray();
        gl.bindVertexArray(this.#vaoIndex);
    }

    /* -------- Create & bind vertex buffer -------- */

    #createAndBindVertexBuffer(gl) {
        const vertexBuffer = gl.createBuffer();
         // We use ARRAY_BUFFER for coordinates
         gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
         // Store the data in the buffer
         gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.vertices),
            gl.STATIC_DRAW
         );
    }

    /* -------- Create & bind normal buffer -------- */

    #createAndBindNormalBuffer(gl) {
        const normalBuffer = gl.createBuffer();
        // We use ARRAY_BUFFER for normals
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        // Store the data in the buffer
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.normals),
            gl.STATIC_DRAW
        );
    }

    /* -------- Create & bind texture buffer -------- */

    #createAndBindTextureBuffer(gl) {
        const textureBuffer = gl.createBuffer();
        // We use ARRAY_BUFFER for colors
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        // Store the data in the buffer
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.textures),
            gl.STATIC_DRAW
        );
    }

    /* -------- Create & bind index buffer -------- */

    #createAndBindIndexBuffer(gl) {
        const indexBuffer = gl.createBuffer();
        // We use ELEMENT_ARRAY_BUFFER for indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        // Store the data in the buffer
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.indices),
            gl.STATIC_DRAW
        );
    }

    /* -------- Enable & bind vertex attributes -------- */

    #enableAndBindVertexAttribs(gl, shader) {
        gl.enableVertexAttribArray(shader.locACoord);

        // Specify coordinate formate for vertex shader attribute
        gl.vertexAttribPointer(
            shader.locACoord,
            3, // size for one coordinate, vec3
            gl.FLOAT, // specify the data type of our coords
            false,
            0, // stride * sizeof float
            0 // offset
        );
    }

    /* -------- Enable & bind normal attributes -------- */

    #enableAndBindNormalAttribs(gl, shader) {
        gl.enableVertexAttribArray(shader.locANormal);

        gl.vertexAttribPointer(
            shader.locANormal,
            3, // size for one normal, vec3
            gl.FLOAT, // specify the data type of our normals
            false,
            0, // stride * sizeof float
            0 // offset
        );
    }

    /* -------- Enable & bind texture attributes -------- */

    #enableAndBindTextureAttribs(gl, shader) {
        gl.enableVertexAttribArray(shader.locATexture);

        gl.vertexAttribPointer(
            shader.locATexture,
            2, // size for one texture, vec2
            gl.FLOAT, // specify the data type of our color
            false,
            0, // stride * sizeof float
            0 // offset * sizeof float
        );
    }

    /* -------- Bind VAO -------- */

    bind(gl) {
        gl.bindVertexArray(this.#vaoIndex);
    }

    /* -------- Draw triangles -------- */

    draw(gl) {
        gl.drawElements(
            gl.TRIANGLES, // <- indexBuffer contains TRIANGLES
            this.#indexCount,
            gl.UNSIGNED_SHORT, // <- Uint16Array
            0 // Offset, 0 means we don't skip anything
        );
    }

    /* -------- Draw lines -------- */

    drawLines(gl) {
        gl.drawElements(
            gl.LINES, // <- indexBuffer contains TRIANGLES
            this.#indexCount,
            gl.UNSIGNED_SHORT, // <- Uint16Array
            0 // Offset, 0 means we don't skip anything
        );
    }

    /* -------- Draw lines indexed -------- */

    drawLinesIndexed(gl, indexCount, indexOffset) {
        gl.drawElements(
            gl.LINES, // <- indexBuffer contains TRIANGLES
            indexCount,
            gl.UNSIGNED_SHORT, // <- Uint16Array
            indexOffset * 2 // Offset, 0 means we don't skip anything
        );
    }
}

export { VAO }
