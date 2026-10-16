precision mediump float;

uniform vec4 u_color;

varying vec4 v_vertexColor;

void main() {
    gl_FragColor = u_color.a > 0.5 ? u_color : vec4(1.0, 1.0, 1.0, 1.0);
}
