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
                
                const x_val_1 = 0;
                const x_val_2 = square_size;

                const z_val_1 = 0
                const z_val_2 = square_size;

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

export interface ProjectionAndRotationNormal {
    projection: number[],
    normals: mat4,
}

export function get_projection_and_normals_for_3d_in_2d_layout(
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
    
    let normals = mat4.fromValues(
        modelViewMatrix[0],
        modelViewMatrix[1],
        modelViewMatrix[2],
        modelViewMatrix[3],
        modelViewMatrix[4],
        modelViewMatrix[5],
        modelViewMatrix[6],
        modelViewMatrix[7],
        modelViewMatrix[8],
        modelViewMatrix[9],
        modelViewMatrix[10],
        modelViewMatrix[11],
        modelViewMatrix[12],
        modelViewMatrix[13],
        modelViewMatrix[14],
        modelViewMatrix[15],
    );

    mat4.invert(normals, normals);
    mat4.transpose(normals, normals);

    return { 
        projection: multiply(perspective_matrix, modelViewMatrix),
        normals: normals //transpose(inverse_4x4(modelViewMatrix))
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

export function loadTexture(gl: WebGLRenderingContext, url: string) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}