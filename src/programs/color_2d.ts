import { linkProgramToShaders } from '../common_funcs';
import * as vertex from '../shaders/vertex/color_2d';
import * as fragment from '../shaders/fragment/color_2d';
import { mat4 } from 'gl-matrix';

export class Color2D {
    program: WebGLProgram;
    attribLocations: {
        vertexPosition: number,
    };
    buffers: {
        rect_vertice_buffer: WebGLBuffer;
    };
    rect_vertice_ary_length: number;
    uniforms: {
        u_color: WebGLUniformLocation;
        u_opacity: WebGLUniformLocation;
        u_transform: WebGLUniformLocation;
    };
    
    constructor(gl: WebGLRenderingContext) {
        this.program = linkProgramToShaders(gl, vertex.SHADER, fragment.SHADER);
        this.buffers = {
            rect_vertice_buffer: gl.createBuffer(),
        };
        this.attribLocations = {
            vertexPosition: gl.getAttribLocation(this.program, 'aPosition'),
        };
        this.uniforms = {
            u_color:  gl.getUniformLocation(this.program, 'uColor'),
            u_opacity:  gl.getUniformLocation(this.program, 'uOpacity'),
            u_transform:  gl.getUniformLocation(this.program, 'uTransform'),
        }

        const vertices_rect: number[] = [
            0., 1., // x, y
            0., 0., // x, y
            1., 1., // x, y
            1., 1., // x, y
            0., 0., // x, y
            1., 0., // x, y
        ];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.rect_vertice_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_rect), gl.STATIC_DRAW);

        this.rect_vertice_ary_length = vertices_rect.length;
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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.rect_vertice_buffer);
        gl.vertexAttribPointer(this.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribLocations.vertexPosition);

        gl.uniform4f(this.uniforms.u_color,
            0., //r
            0.5,//g
            0.5,//b
            1.0,//a
        );

        gl.uniform1f(this.uniforms.u_opacity, 1);

        const transform_mat = mat4.create();
        mat4.translate(transform_mat, transform_mat, [
            2. * left / canvas_width - 1.,
            2. * bottom / canvas_height - 1.,
            0,
        ]);
        mat4.scale(transform_mat, transform_mat, [
            2. * (right - left) / canvas_width,
            2. * (top - bottom) / canvas_height,
            0,
        ]);
        gl.uniformMatrix4fv(this.uniforms.u_transform, false, transform_mat);

        gl.drawArrays(gl.TRIANGLES, 0, this.rect_vertice_ary_length / 2);
    }
}