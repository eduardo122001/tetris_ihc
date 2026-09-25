attribute vec4 a_coords;

uniform mat4 u_transform;
uniform mat4 u_projection;
uniform mat4 u_view;

void main() {
    gl_Position = u_projection * u_view * u_transform * a_coords;
}
