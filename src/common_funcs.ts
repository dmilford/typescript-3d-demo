import { GRID_SIZE, FIELD_OF_VIEW, Z_NEAR, Z_FAR, Z_PLANE } from './constants';
import { mat4 } from 'gl-matrix';

export interface PositionAndIndices {
    positions: number[],
    indices: number[]
}

export function get_position_grid_n_by_n(n: number): PositionAndIndices {
    const n_plus_one = n + 1;
    const positions = new Array(3 * n_plus_one * n_plus_one); //This is much faster than creating an array by [] and then pushing into it.  https://jsperf.com/array-init-kk/19
    const indices = new Array(6 * n * n); //This is much faster than creating an array by [] and then pushing into it.  https://jsperf.com/array-init-kk/19
    const square_size = 1 / n;

    for (let z = 0; z < n_plus_one; z++) {
        for (let x = 0; x < n_plus_one; x++) {
            const start_pos_i = 3 * (z * n_plus_one + x);
            positions[start_pos_i + 0] = x * square_size;
            positions[start_pos_i + 1] = 0.;
            positions[start_pos_i + 2] = z * square_size;

            if (z < n && x < n) {
                const start_index_i = 6 * (z * n + x);
                const vertex_index_top_left = (z * n_plus_one + x);
                const vertex_index_bottom_left = vertex_index_top_left + n_plus_one;
                const vertex_index_top_right = vertex_index_top_left + 1;
                const vertex_index_bottom_right = vertex_index_bottom_left + 1;

                indices[start_index_i + 0] = vertex_index_top_left;
                indices[start_index_i + 1] = vertex_index_bottom_left;
                indices[start_index_i + 2] = vertex_index_bottom_right;
                indices[start_index_i + 3] = vertex_index_top_left;
                indices[start_index_i + 4] = vertex_index_bottom_right;
                indices[start_index_i + 5] = vertex_index_top_right;
            }
        }
    }
    return {
        positions: positions,
        indices: indices
    };
}


export function get_grid_normals(n: number, y_vals: number[]): number[] {
    const points_per_row = n + 1;
    const graph_layout_width = 2;
    const square_size = graph_layout_width / n;
    const return_var = new Array(3 * points_per_row * points_per_row); //This is much faster than creating an array by [] and then pushing into it.  https://jsperf.com/array-init-kk/19

    for (let z = 0; z < points_per_row; z++) {
        for (let x = 0; x < points_per_row; x++) {
            const y_val_index_a = z * points_per_row + x;
            const return_var_start_index = 3 * y_val_index_a;

            if (z === n || x === n) {
                return_var[return_var_start_index + 1] = 1.; //default
            } else {
                const y_val_index_b = y_val_index_a + points_per_row;
                const y_val_index_c = y_val_index_a + 1;
                
                const x_val_1 = square_size * x;
                const x_val_2 = x_val_1 + square_size;

                const z_val_1 = square_size * z;
                const z_val_2 = z_val_1 + square_size;

                const normals = get_normal_vec(
                    x_val_1,
                    y_vals[y_val_index_a],
                    z_val_1,
                    x_val_1,
                    y_vals[y_val_index_b],
                    z_val_2,
                    x_val_2,
                    y_vals[y_val_index_c],
                    z_val_2,
                );

                return_var[return_var_start_index + 0] = normals.x;
                return_var[return_var_start_index + 1] = normals.y;
                return_var[return_var_start_index + 2] = normals.z;
            }
        }
    }

    return return_var;
}

export interface XYZ {
    x: number,
    y: number,
    z: number,
}

export function get_normal_vec(
    point_a_x: number,
    point_a_y: number,
    point_a_z: number,
    point_b_x: number,
    point_b_y: number,
    point_b_z: number,
    point_c_x: number,
    point_c_y: number,
    point_c_z: number,
): XYZ {
    const u_x = point_b_x - point_a_x;
    const u_y = point_b_y - point_a_y;
    const u_z = point_b_z - point_a_z;

    const v_x = point_c_x - point_a_x;
    const v_y = point_c_y - point_a_y;
    const v_z = point_c_z - point_a_z;

    const normal_x = u_y * v_z - v_y * u_z;
    const normal_y = -1. * (u_x * v_z - v_x * u_z);
    const normal_z = u_x * v_y - v_x * u_y;

    const normal_size = Math.sqrt(normal_x * normal_x + normal_y * normal_y + normal_z * normal_z);

    return {
        x: normal_x / normal_size,
        y: normal_y / normal_size,
        z: normal_z / normal_size,
    }
}

export function linkProgramToShaders(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


export function get_updated_3d_y_values(curr_time: number): number[] {
    const point_count_per_row = GRID_SIZE + 1;
    const y_vals: number[] = new Array(point_count_per_row * point_count_per_row); //This is much faster than creating an array by [] and then pushing into it.  https://jsperf.com/array-init-kk/19  vec![0.; point_count_per_row * point_count_per_row];
    const half_grid: number = point_count_per_row / 2;
    const frequency_scale = 3. * Math.PI;
    const y_scale = 0.15;
    const sin_offset = curr_time / 1000.; //speed

    for (let z = 0; z < point_count_per_row; z++) {
        for (let x = 0; x < point_count_per_row; x++) {
            const use_y_index = z * point_count_per_row + x;
            const scaled_x = frequency_scale * (x - half_grid) / half_grid;
            const scaled_z = frequency_scale * (z - half_grid) / half_grid;
            y_vals[use_y_index] = 0.5 + 0.5 * y_scale * Math.sin((Math.sqrt(scaled_x * scaled_x + scaled_z * scaled_z) + sin_offset));
        }
    }

    return y_vals;
}

export interface ProjectionAndRotationNormal {
    projection: number[],
    rotationNormal: number[],
}

export function get_projection_2d(
    bottom: number,
    top: number,
    left: number,
    right: number,
    canvas_height: number,
    canvas_width: number,
): number[] {
    const translation_mat = translation(
        2. * left / canvas_width - 1.,
        2. * bottom / canvas_height - 1.,
        0,
    );
    const scaling_mat = scaling(
        2. * (right - left) / canvas_width,
        2. * (top - bottom) / canvas_height,
        0,
    );

    return multiply(translation_mat, scaling_mat);
}

export function get_projection_and_rotation_normal_for_3d_in_2d_layout(
    bottom: number,
    top: number,
    left: number,
    right: number,
    canvas_height: number,
    canvas_width: number,
    rotation_angle_x_axis: number,
    rotation_angle_y_axis: number,
): ProjectionAndRotationNormal {    
    const aspect = canvas_width / canvas_height;
    const perspective_matrix = perspective(FIELD_OF_VIEW, aspect, Z_NEAR, Z_FAR);
    const modelViewMatrix = get_3d_model_view_matrix(bottom, top, left, right, canvas_height, canvas_width, rotation_angle_x_axis, rotation_angle_y_axis);
    return { 
        projection: multiply(perspective_matrix, modelViewMatrix),
        rotationNormal: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]// transpose(inverse_4x4(modelViewMatrix))
    };
}

export function get_3d_model_view_matrix(
    bottom: number,
    top: number,
    left: number,
    right: number,
    canvas_height: number,
    canvas_width: number,
    rotation_angle_x_axis: number,
    rotation_angle_y_axis: number,
): number[] {
    const aspect = canvas_width / canvas_height;
    const use_scale = 2 * (top - bottom) / canvas_height;
    let modelViewMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    modelViewMatrix = translate(modelViewMatrix, 
        -aspect + (use_scale / 2) + aspect * 2 * (left / canvas_width),
        -1 + (use_scale / 2) + 2 * (bottom / canvas_height),
        Z_PLANE,
    );
    modelViewMatrix = xRotate(modelViewMatrix, rotation_angle_x_axis);
    modelViewMatrix = yRotate(modelViewMatrix, rotation_angle_y_axis);
    modelViewMatrix = scale(modelViewMatrix, use_scale ,use_scale, use_scale);
    modelViewMatrix = translate(modelViewMatrix, -0.5, -0.5, -0.5);

    return modelViewMatrix;
}

export function perspective(fieldOfViewInRadians: number, aspect: number, near: number, far: number) {
    const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    const rangeInv = 1.0 / (near - far);

    const return_var = [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];

    return return_var;
}

export function multiply(a: number[], b: number[]): number[] {
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
}
 
export function translation(tx: number, ty: number, tz: number): number[] {
    return [
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1,
    ];
}

export function transpose(m: number[]) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15],
    ];
  }

export function xRotation(angleInRadians: number): number[] {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);

    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
}

export function yRotation(angleInRadians: number): number[] {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);

    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
}

export function zRotation(angleInRadians: number): number[] {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);

    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

export function scaling(sx: number, sy: number, sz: number): number[] {
    return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
    ];
}

export function translate(m: number[], tx: number, ty: number, tz: number): number[] {
    return multiply(m, translation(tx, ty, tz));
}

export function xRotate(m: number[], angleInRadians: number): number[] {
    return multiply(m, xRotation(angleInRadians));
}

export function yRotate(m: number[], angleInRadians: number): number[] {
    return multiply(m, yRotation(angleInRadians));
}

export function zRotate(m: number[], angleInRadians: number): number[] {
    return multiply(m, zRotation(angleInRadians));
}

export function scale(m: number[], sx: number, sy: number, sz: number): number[] {
    return multiply(m, scaling(sx, sy, sz));
}

function inverse_4x4(m: number[]): number[] {
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m03 = m[0 * 4 + 3];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m13 = m[1 * 4 + 3];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];
    const m23 = m[2 * 4 + 3];
    const m30 = m[3 * 4 + 0];
    const m31 = m[3 * 4 + 1];
    const m32 = m[3 * 4 + 2];
    const m33 = m[3 * 4 + 3];
    const tmp_0  = m22 * m33;
    const tmp_1  = m32 * m23;
    const tmp_2  = m12 * m33;
    const tmp_3  = m32 * m13;
    const tmp_4  = m12 * m23;
    const tmp_5  = m22 * m13;
    const tmp_6  = m02 * m33;
    const tmp_7  = m32 * m03;
    const tmp_8  = m02 * m23;
    const tmp_9  = m22 * m03;
    const tmp_10 = m02 * m13;
    const tmp_11 = m12 * m03;
    const tmp_12 = m20 * m31;
    const tmp_13 = m30 * m21;
    const tmp_14 = m10 * m31;
    const tmp_15 = m30 * m11;
    const tmp_16 = m10 * m21;
    const tmp_17 = m20 * m11;
    const tmp_18 = m00 * m31;
    const tmp_19 = m30 * m01;
    const tmp_20 = m00 * m21;
    const tmp_21 = m20 * m01;
    const tmp_22 = m00 * m11;
    const tmp_23 = m10 * m01;

    const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    dst[0] = d * t0;
    dst[1] = d * t1;
    dst[2] = d * t2;
    dst[3] = d * t3;
    dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

    return dst;
  }