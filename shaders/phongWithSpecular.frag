precision mediump float;

uniform vec3 u_ambientProduct;
uniform vec3 u_diffuseProduct;
uniform vec3 u_specularProduct;
uniform float u_shininess;
uniform vec4 u_color;
uniform sampler2D u_texture;
uniform sampler2D u_shadowMap;
uniform vec3 u_shadowLightDirection;
uniform vec2 u_isTransparent;

varying vec3 v_viewPosition;
varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec4 v_shadowCoord;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0 * 256.0), 1.0/(256.0 * 256.0 * 256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}

void main() {
    vec3 LShadow = normalize(u_shadowLightDirection);
    vec3 L = normalize(vec3(1., 1., 1.));
    vec3 E = normalize(-v_viewPosition);
    vec3 N = normalize(v_normal);
    vec3 R = reflect(-L, N);

    float diffuseIntensity = max(dot(L, N), 0.);
    float specularIntensity = pow(max(dot(E, R), 0.), u_shininess);

    vec3 ambientColor;
    vec3 diffuseColor;
    vec3 specularColor;
    vec4 finalColor;

    vec4 textureColor = texture2D(u_texture, v_texcoord);
    vec3 shadowCoord = (v_shadowCoord.xyz / v_shadowCoord.w) * 0.5 + 0.5;

    float angle = dot(LShadow, N);
    float bias = max(0.00015 * (1.0 - angle), 0.0);
    float depth = unpackDepth(texture2D(u_shadowMap, shadowCoord.xy));

    if(u_color.a > 0.5) {
        ambientColor = u_color.rgb / 255. * u_ambientProduct;
        diffuseColor = u_color.rgb / 255. * diffuseIntensity * u_diffuseProduct;
        specularColor = specularIntensity * u_specularProduct;
    } else {
        ambientColor = textureColor.rgb * u_ambientProduct;
        diffuseColor = textureColor.rgb * diffuseIntensity * u_diffuseProduct;
        specularColor = specularIntensity * u_specularProduct;
    }

    // Calculate the full phong term, no matter wether we're in a shadow
    finalColor = vec4(ambientColor + diffuseColor + specularColor, 1.);

    // Shadow case
    if((abs(angle) > 0.001) && (shadowCoord.z > depth + bias)) {
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

