precision mediump float;

uniform vec3 u_ambientProduct;
uniform vec3 u_diffuseProduct;
uniform vec3 u_specularProduct;
uniform vec4 u_color;
uniform sampler2D u_texture;
uniform sampler2D u_shadowMap;
uniform vec2 u_isTransparent;

varying vec2 v_texcoord;
varying vec3 v_lighting;
varying vec4 v_shadowCoord;
varying float v_angle;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0 * 256.0), 1.0/(256.0 * 256.0 * 256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

void main() {
    vec4 textureColor = texture2D(u_texture, v_texcoord);
    vec3 shadowCoord = (v_shadowCoord.xyz / v_shadowCoord.w) * 0.5 + 0.5;
    float depth = unpackDepth(texture2D(u_shadowMap, shadowCoord.xy));

    // Combine the texture color with the lighting components
    vec3 ambientColor;
    vec3 diffuseColor;
    vec3 specularColor;
    vec4 finalColor;

    if(u_color.a > 0.5) {
        ambientColor = u_color.rgb / 255. * v_lighting.x * u_ambientProduct;
        diffuseColor = u_color.rgb / 255. * v_lighting.y * u_diffuseProduct;
        specularColor = v_lighting.z * u_specularProduct;
    } else {
        ambientColor = textureColor.rgb * v_lighting.x * u_ambientProduct;
        diffuseColor = textureColor.rgb * v_lighting.y * u_diffuseProduct;
        specularColor = v_lighting.z * u_specularProduct;
    }

    // Calculate the full phong term, no matter wether we're in a shadow
    finalColor = vec4(ambientColor + diffuseColor + specularColor, 1.);

    // Shadow case
    if((abs(v_angle) > 0.001) && (shadowCoord.z > depth + 0.00015)) {
        vec4 shadowColor = vec4(205. / 255., 205. / 255., 205. / 255., 1.);
        finalColor = mix(finalColor, shadowColor, 0.5);
    // No shadow
    } else {
        if(u_isTransparent[0] > 0.5) {
            finalColor.a = 0.;
        }

        if(u_isTransparent[1] > 0.5) {
            finalColor.a = 0.7;
        }
    }

    gl_FragColor = finalColor;
}
