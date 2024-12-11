// Space-time Distortion Shader
// Implements:
// - Non-linear perspective distortion
// - Gravitational lensing
// - Color shift based on distortion intensity

uniform float time;
uniform float distortionStrength;
uniform vec2 resolution;
uniform sampler2D tDiffuse;

varying vec2 vUv;

const float PI = 3.14159265359;

// Distortion function based on polar coordinates
vec2 distort(vec2 uv) {
    vec2 center = vec2(0.5);
    vec2 delta = uv - center;
    float r = length(delta);
    float angle = atan(delta.y, delta.x);
    
    // Non-linear radial distortion
    float distortedR = r / (1.0 - distortionStrength * r);
    
    // Add time-based spiral effect
    angle += distortionStrength * (1.0 - r) * sin(time * 0.5);
    
    // Convert back to Cartesian coordinates
    return center + vec2(
        distortedR * cos(angle),
        distortedR * sin(angle)
    );
}

void main() {
    vec2 uv = vUv;
    
    // Apply space-time distortion
    vec2 distortedUv = distort(uv);
    
    // Sample the scene texture with distorted coordinates
    vec4 color = texture2D(tDiffuse, distortedUv);
    
    // Add chromatic aberration based on distortion intensity
    float aberrationStrength = distortionStrength * 0.02;
    vec4 colorR = texture2D(tDiffuse, distortedUv + vec2(aberrationStrength, 0.0));
    vec4 colorB = texture2D(tDiffuse, distortedUv - vec2(aberrationStrength, 0.0));
    
    // Combine color channels with chromatic aberration
    color.r = colorR.r;
    color.b = colorB.b;
    
    // Add subtle blue shift towards the center
    float centerDist = length(uv - 0.5);
    color.b += (1.0 - centerDist) * distortionStrength * 0.2;
    
    gl_FragColor = color;
}
