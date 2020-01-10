import { Cube } from './programs/cube';
import { Color2D } from './programs/color_2d';
import { Color2DGradient } from './programs/color_2d_gradient';
import { Graph3D } from './programs/graph_3d';
import { CubeLighting } from './programs/cube_lighting';
import { AppState, UNLOADED_APP_STATE, getUpdatedAppStateFromCanvasResize, getUpdatedStateFromMouseMove } from './models/app_state';
import { get_updated_3d_y_values } from './common_funcs';
import './img/cubetexture.png';

main();

function main() {
  const canvas = document.getElementById('dougsCanvas') as HTMLCanvasElement;
  const gl = canvas.getContext('webgl', { antialias: true });

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  let currAppState: AppState = UNLOADED_APP_STATE;

  canvas.addEventListener('mousedown', mouse_down_handler);
  canvas.addEventListener('mouseup', mouse_up_handler);
  canvas.addEventListener('mousemove', mouse_move_handler);
  canvas.addEventListener('mouseleave', mouse_up_handler);

  const FPS_THROTTLE = 1000.0 / 30.0; // milliseconds / frames
  const initialTime = Date.now();
  const allowSemiTransparent = true;
  let lastDrawTime = -1;// In milliseconds

  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  if (allowSemiTransparent) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  else {
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  }

  const cube1 = new Cube(gl);
  const cube2 = new Cube(gl);
  const color1 = new Color2D(gl);
  const colorGradient = new Color2DGradient(gl);
  const graph3D = new Graph3D(gl);
  const cubeLightingAndTexture = new CubeLighting(gl);

  function render() {
    const currTime = Date.now();
    
    if (currTime >= lastDrawTime + FPS_THROTTLE) {
      lastDrawTime = currTime;
      if (window.innerHeight !== canvas.height || window.innerWidth !== canvas.width) {
        canvas.height = window.innerHeight;
        canvas.style.height = window.innerHeight.toString();

        canvas.width = window.innerWidth;
        canvas.style.width = window.innerWidth.toString();

        gl.viewport(0, 0, window.innerWidth, window.innerHeight);

        currAppState = getUpdatedAppStateFromCanvasResize(currAppState, window.innerHeight, window.innerWidth);
      }
      const elapsedTime = Date.now() - initialTime;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const cubeRotation = elapsedTime / 1000;

      // color1.render(gl, 
      //   currAppState.controlBottom, 
      //   currAppState.controlTop, 
      //   currAppState.controlLeft, 
      //   currAppState.controlRight, 
      //   currAppState.canvasHeight, 
      //   currAppState.canvasWidth
      // );
      // colorGradient.render(gl, 
      //   currAppState.controlBottom + 20, 
      //   currAppState.controlTop - 20, 
      //   currAppState.controlLeft + 20, 
      //   currAppState.controlRight - 20, 
      //   currAppState.canvasHeight, 
      //   currAppState.canvasWidth
      // );
      graph3D.render(gl,
        currAppState.controlBottom, 
        currAppState.controlTop, 
        currAppState.controlLeft, 
        currAppState.controlRight, 
        currAppState.canvasHeight, 
        currAppState.canvasWidth,
        currAppState.rotation_x_axis,
        currAppState.rotation_y_axis,
        get_updated_3d_y_values(currTime)
      );
      // cube1.render(gl, cubeRotation, currAppState.canvasHeight, currAppState.canvasWidth);
      // cube2.render(gl, 1.5 * cubeRotation, currAppState.canvasHeight, currAppState.canvasWidth);

      //cubeLightingAndTexture.render(gl, currAppState.rotation_x_axis, currAppState.rotation_y_axis, currAppState.canvasHeight, currAppState.canvasWidth);
    }

    requestAnimationFrame(render);
  }

  function mouse_move_handler(event: MouseEvent) {
    currAppState = getUpdatedStateFromMouseMove(currAppState, event.clientX, event.clientY, currAppState.mouse_down);
  }

  function mouse_down_handler(event: MouseEvent) {
    currAppState = getUpdatedStateFromMouseMove(currAppState, event.clientX, event.clientY, true);
  }

  function mouse_up_handler(event: MouseEvent) {
    currAppState = getUpdatedStateFromMouseMove(currAppState, event.clientX, event.clientY, false);
  }

  requestAnimationFrame(render);
}
