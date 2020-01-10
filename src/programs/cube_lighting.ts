import { linkProgramToShaders, loadTexture } from '../common_funcs';
import * as vertex from '../shaders/vertex/cube_lighting';
import * as fragment from '../shaders/fragment/cube_lighting';
import { mat4 } from 'gl-matrix';

export class CubeLighting {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number,
        vertexNormal: number,
        textureCoord: number,
    };
    buffers: {
        indexBuffer: WebGLBuffer;
        positionBuffer: WebGLBuffer;
        normalsBuffer: WebGLBuffer;
        textureCoordBuffer: WebGLBuffer;
    };
    textures: {
        fox: WebGLTexture;
    };
    uniforms: {
        projectionMatrix: WebGLUniformLocation;
        modelViewMatrix: WebGLUniformLocation;
        normalMatrix: WebGLUniformLocation;
        uSampler: WebGLUniformLocation;
    };

    constructor(gl: WebGLRenderingContext) {
        this.program = linkProgramToShaders(gl, vertex.SHADER, fragment.SHADER);

        this.buffers = {
            indexBuffer: gl.createBuffer(),
            positionBuffer: gl.createBuffer(),
            normalsBuffer: gl.createBuffer(),
            textureCoordBuffer: gl.createBuffer(),
        };
        this.attribLocations = {
            vertexPosition: gl.getAttribLocation(this.program, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(this.program, 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(this.program, 'aTextureCoord'),
        };
        this.textures = {
            fox: loadTexture(gl, 'cubetexture.png'),
        };
        this.uniforms = {
            projectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(this.program, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(this.program, 'uNormalMatrix'),
            uSampler: gl.getUniformLocation(this.program, 'uSampler'),
        };

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positionBuffer);

        const positions = [
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalsBuffer);

        const vertexNormals = [
            // Front
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,

            // Back
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,

            // Top
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,

            // Bottom
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,

            // Right
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,

            // Left
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoordBuffer);

        const textureCoordinates = [
            // Front
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Back
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Top
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Bottom
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Right
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Left
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

        // Now send the element array to GL

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

    render = (
        gl: WebGLRenderingContext, 
        rotation_x: number,
        rotation_y: number,
        canvasHeight: number,
        canvasWidth: number,
    ) => {
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = canvasHeight / canvasWidth;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                    fieldOfView,
                    aspect,
                    zNear,
                    zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix,     // destination matrix
                    modelViewMatrix,     // matrix to translate
                    [-0.0, 0.0, -6.0]);  // amount to translate
    mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                rotation_x,     // amount to rotate in radians
                [1, 0, 0]);       // axis to rotate around (Z)
    mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                rotation_y,// amount to rotate in radians
                [0, 1, 0]);       // axis to rotate around (X)

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positionBuffer);
        gl.vertexAttribPointer(
            this.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(this.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoordBuffer);
        gl.vertexAttribPointer(
            this.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            this.attribLocations.textureCoord);
    }

    // Tell WebGL how to pull out the normals from
    // the normal buffer into the vertexNormal attribute.
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalsBuffer);
        gl.vertexAttribPointer(
            this.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            this.attribLocations.vertexNormal);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);

    // Tell WebGL to use our program when drawing

    gl.useProgram(this.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        this.uniforms.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        this.uniforms.modelViewMatrix,
        false,
        modelViewMatrix);
    gl.uniformMatrix4fv(
        this.uniforms.normalMatrix,
        false,
        normalMatrix);

    // Specify the texture to map onto the faces.

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, this.textures.fox);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(this.uniforms.uSampler, 0);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
    }
}

