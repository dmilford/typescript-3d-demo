import { 
    linkProgramToShaders, 
    get_position_grid_n_by_n, 
    get_grid_normals,
    projection_and_rotation_normal_for_3d_in_2d_layout
} from '../common_funcs';
import * as vertex from '../shaders/vertex/graph_3d';
import * as fragment from '../shaders/fragment/varying_color_from_vertex';
import { GRID_SIZE} from '../constants';

export class Graph3D {
    program: WebGLProgram;
    attribLocations: {
        position: number;
        vertexNormal: number;
        y: number;
    };
    buffers: {
        indices: WebGLBuffer;
        position: WebGLBuffer;
        vertexNormal: WebGLBuffer;
        y: WebGLBuffer;
    };
    index_count: number;
    uniforms: {
        u_normals_rotation: WebGLUniformLocation;
        u_projection: WebGLUniformLocation;
        u_opacity: WebGLUniformLocation;
    };
    
    constructor(gl: WebGLRenderingContext) {
        this.program = linkProgramToShaders(gl, vertex.SHADER, fragment.SHADER);
        this.attribLocations = {
            position: gl.getAttribLocation(this.program, 'aPosition'),
            vertexNormal: gl.getAttribLocation(this.program, 'aVertexNormal'),
            y: gl.getAttribLocation(this.program, 'aY'),
        }
        this.buffers = {
            indices: gl.createBuffer(),
            position: gl.createBuffer(),
            vertexNormal: gl.createBuffer(),
            y: gl.createBuffer(),
        };
        this.uniforms = {
            u_normals_rotation: gl.getUniformLocation(this.program, "uNormalsRotation"),
            u_projection: gl.getUniformLocation(this.program, "uProjection"),
            u_opacity: gl.getUniformLocation(this.program, "uOpacity"),
        }

        let positions_and_indices = get_position_grid_n_by_n(GRID_SIZE);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions_and_indices.positions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(positions_and_indices.indices), gl.STATIC_DRAW);

        this.uniforms.u_normals_rotation = gl.getUniformLocation(this.program, "uNormalsRotation");
        this.uniforms.u_opacity = gl.getUniformLocation(this.program, "uOpacity");
        this.uniforms.u_projection = gl.getUniformLocation(this.program, "uProjection");

        this.index_count = positions_and_indices.indices.length;
    }

    render = (
        gl: WebGLRenderingContext,
        bottom: number,
        top: number,
        left: number,
        right: number,
        canvas_height: number,
        canvas_width: number,
        rotation_angle_x_axis: number,
        rotation_angle_y_axis: number,
        y_vals: number[],
    ) => {
        gl.useProgram(this.program);

        let pAndRN = projection_and_rotation_normal_for_3d_in_2d_layout(bottom, top, left, right, canvas_height, canvas_width, rotation_angle_x_axis, rotation_angle_y_axis);

        gl.uniformMatrix4fv(this.uniforms.u_projection, false, new Float32Array(pAndRN.projection));
        gl.uniformMatrix4fv(this.uniforms.u_normals_rotation, false, new Float32Array(pAndRN.rotationNormal));
        gl.uniform1f(this.uniforms.u_opacity, 1.0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.vertexAttribPointer(this.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribLocations.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.y);
        gl.vertexAttribPointer(this.attribLocations.y, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribLocations.y);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(y_vals), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexNormal);
        gl.vertexAttribPointer(this.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribLocations.vertexNormal);

        let normals_vals = get_grid_normals(GRID_SIZE, y_vals);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals_vals), gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

        gl.drawElements(gl.TRIANGLES, this.index_count, gl.UNSIGNED_SHORT, 0);
    }
}