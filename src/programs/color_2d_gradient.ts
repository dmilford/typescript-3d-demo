import { linkProgramToShaders, get_projection_2d } from '../common_funcs';
import * as vertex from '../shaders/vertex/color_2d_gradient';
import * as fragment from '../shaders/fragment/varying_color_from_vertex';

export class Color2DGradient {
    program: WebGLProgram;
    attribLocations: {
        color: number,
        position: number,
    };
    buffers: {
        color: WebGLBuffer;
        index: WebGLBuffer;
        position: WebGLBuffer;
    };
    index_count: number;
    uniforms: {
        u_opacity: WebGLUniformLocation;
        u_transform: WebGLUniformLocation;
    };

    constructor(gl: WebGLRenderingContext) {
        this.program = linkProgramToShaders(gl, vertex.SHADER, fragment.SHADER);
        this.attribLocations = {
            color: gl.getAttribLocation(this.program, 'aColor'),
            position: gl.getAttribLocation(this.program, 'aPosition'),
        };
        this.buffers = {
            color: gl.createBuffer(),
            index: gl.createBuffer(),
            position: gl.createBuffer(),
        }
        this.uniforms = {
            u_opacity: gl.getUniformLocation(this.program, "uOpacity"),
            u_transform: gl.getUniformLocation(this.program, "uTransform"),
        };

        const vertices_rect: number[] = [
            0., 1., // x, y
            0., 0., // x, y
            1., 1., // x, y
            1., 0., // x, y
        ];

        const indices_rect: number[] = [0, 1, 2, 2, 1, 3];

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_rect), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_rect), gl.STATIC_DRAW);

        this.index_count = indices_rect.length;
    }

    render = (
        gl: WebGLRenderingContext,
        bottom: number,
        top: number,
        left: number,
        right: number,
        canvas_height: number,
        canvas_width: number,
    ) => {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.vertexAttribPointer(this.attribLocations.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribLocations.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
        gl.vertexAttribPointer(this.attribLocations.color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribLocations.color);

        const colors: number[] = [
            1., 0., 0., 1.,
            0., 1., 0., 1., 
            0., 0., 1., 1.,
            1., 1., 1., 1.,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

        gl.uniform1f(this.uniforms.u_opacity, 1);

        gl.uniformMatrix4fv(this.uniforms.u_transform, false, get_projection_2d(bottom, top, left, right, canvas_height, canvas_width));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);

        gl.drawElements(gl.TRIANGLES, this.index_count, gl.UNSIGNED_SHORT, 0);
    }
}