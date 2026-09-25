precision mediump float;

attribute vec4 a_coords;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

uniform mat4 u_transform;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat3 u_normal;
uniform mat4 u_lightViewProj;

varying vec3 v_viewPosition;
varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec4 v_shadowCoord;

void main() {
    // Transform vertex position and normal vector to view space
    vec4 viewPosition = u_view * u_transform * a_coords;

    v_shadowCoord = u_lightViewProj * u_transform * a_coords;

    v_viewPosition = viewPosition.xyz;
    v_normal = u_normal * a_normal;
    v_texcoord = a_texcoord;

    gl_Position = u_projection * viewPosition;
}
