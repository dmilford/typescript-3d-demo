export interface AppState {
    controlBottom: number,
    controlTop: number,
    controlLeft: number,
    controlRight: number,
    canvasHeight: number,
    canvasWidth: number,
    mouse_x: number,
    mouse_y: number,
    mouse_down: boolean,
    rotation_x_axis: number,
    rotation_y_axis: number,
}

export const UNLOADED_APP_STATE: AppState = {
    controlBottom: 0,
    controlTop: 0,
    controlLeft: 0,
    controlRight: 0,
    canvasHeight: 1,
    canvasWidth: 1,
    mouse_x: -1,
    mouse_y: -1,
    mouse_down: false,
    rotation_x_axis: 0.5,
    rotation_y_axis: 0.5,
}

export function getUpdatedAppStateFromCanvasResize(currState: AppState, canvasHeight: number, canvasWidth: number): AppState {
    const min_height_width = Math.min(canvasHeight, canvasWidth);
    const display_size = 0.9 * min_height_width;
    const half_display_size = display_size / 2;
    const half_canvas_height = canvasHeight / 2;
    const half_canvas_width = canvasWidth / 2;

    return {
        ...currState,
        canvasHeight: canvasHeight,
        canvasWidth: canvasWidth,

        controlBottom: half_canvas_height - half_display_size,
        controlTop: half_canvas_height + half_display_size,
        controlLeft: half_canvas_width - half_display_size,
        controlRight: half_canvas_width + half_display_size,
    };
}

export function getUpdatedStateFromMouseMove(currState: AppState, x: number, y: number, mouse_down: boolean): AppState {
    const inverted_y = currState.canvasHeight - y;
    const x_delta = x - currState.mouse_x;
    const y_delta = inverted_y - currState.mouse_y;
    const rotation_x_delta = mouse_down 
        ? Math.PI * y_delta / currState.canvasHeight
        : 0;
    const rotation_y_delta = mouse_down 
        ? Math.PI * x_delta / currState.canvasWidth
        : 0;

    return {
        ...currState,
        mouse_down: mouse_down,
        mouse_x: x,
        mouse_y: inverted_y,
        rotation_x_axis: currState.rotation_x_axis - rotation_x_delta,
        rotation_y_axis: currState.rotation_y_axis + rotation_y_delta,
    };
}