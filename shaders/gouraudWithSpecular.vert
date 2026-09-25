precision mediump float;

attribute vec4 a_coords;
attribute vec3 a_normal;
attribute vec2 a_texcoord;

uniform mat4 u_transform;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat3 u_normal;
uniform float u_shininess;
uniform mat4 u_lightViewProj;
uniform vec3 u_shadowLightDirection;

varying vec2 v_texcoord;
varying vec3 v_lighting;
varying vec4 v_shadowCoord;
varying float v_angle;

void main() {
    vec4 viewPosition = u_view * u_transform * a_coords;
    v_shadowCoord = u_lightViewProj * u_transform * a_coords;

    vec3 LShadow = normalize(u_shadowLightDirection);
    vec3 L = normalize(vec3(1., 1., 1.));
    vec3 N = normalize(u_normal * a_normal);
    vec3 E = normalize(-viewPosition.xyz);
    vec3 R = reflect(-L, N);

    // Calculate lighting components
    float diffuseIntensity = max(dot(L, N), 0.0);
    float specularIntensity = pow(max(dot(E, R), 0.0), u_shininess);

    v_texcoord = a_texcoord;
    v_lighting = vec3(1., diffuseIntensity, specularIntensity);
    v_angle = dot(LShadow, N);

    gl_Position = u_projection * viewPosition;
}
