import * as vertex from '../shaders/vertex/cube';
import * as fragment from '../shaders/fragment/cube';
import { linkProgramToShaders, get_projection_and_normals_for_3d_in_2d_layout } from '../common_funcs';
import { FIELD_OF_VIEW_Y, Z_FAR, Z_NEAR } from '../constants';
import { mat4 } from 'gl-matrix';

export class Cube {
    program: WebGLProgram;
    attribLocations: {
      vertexPosition: number,
      vertexColor: number,
    };
    buffers: {
        color: WebGLBuffer,
        index: WebGLBuffer,
        position: WebGLBuffer,
    };
    uniformLocations: {
      projectionMatrix: WebGLUniformLocation,
    };

    constructor(gl: WebGLRenderingContext) {
        this.program = linkProgramToShaders(gl, vertex.SHADER, fragment.SHADER);
        this.attribLocations = {
            vertexPosition: gl.getAttribLocation(this.program, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(this.program, 'aVertexColor'),
        };
        this.buffers = {
            color: gl.createBuffer(),
            index: gl.createBuffer(),
            position: gl.createBuffer(),
        }
        this.uniformLocations = {
            projectionMatrix: gl.getUniformLocation(this.program, 'uProjectionMatrix'),
        };
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);

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

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);

        const indices = [
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ];

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


        const faceColors = [
            [1.0,  1.0,  1.0,  1.0],    // Front face: white
            [1.0,  0.0,  0.0,  1.0],    // Back face: red
            [0.0,  1.0,  0.0,  1.0],    // Top face: green
            [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
            [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
            [1.0,  0.0,  1.0,  1.0],    // Left face: purple
        ];

        // Convert the array of colors into a table for all the vertices.

        let colors: number[] = [];

        for (let j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];

            // Repeat each color four times for the four vertices of the face
            colors = colors.concat(c, c, c, c);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    }

    render = (gl: WebGLRenderingContext, cubeRotation: number, canvasHeight: number, canvasWidth: number) => {
        const projAndNormal = get_projection_and_normals_for_3d_in_2d_layout(400, 500, 400, 500, canvasHeight, canvasWidth, cubeRotation, 0.7 * cubeRotation);
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
            gl.vertexAttribPointer(
                this.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.attribLocations.vertexPosition);
        }

        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
            gl.vertexAttribPointer(
                this.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.attribLocations.vertexColor);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.useProgram(this.program);

        gl.uniformMatrix4fv(
            this.uniformLocations.projectionMatrix,
            false,
            projAndNormal.projection);

        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }

    }
}