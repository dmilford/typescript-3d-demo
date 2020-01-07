export const SHADER = `
    attribute vec4 aPosition;
    uniform mat4 uTransform;

    void main() {
        gl_Position = uTransform * aPosition;
    }
`;