precision highp float;

// Varyings from the vertex shader
in vec2 v_uv;
in vec2 v_worldPos;

// Uniforms
uniform float u_majorLineWidth, u_minorLineWidth, u_axisLineWidth;
uniform vec3 u_majorLineColor, u_minorLineColor, u_baseColor;
uniform vec3 u_xAxisColor, u_yAxisColor, u_zAxisColor;
uniform float u_majorGridDiv, u_baseAlpha;
uniform vec2 u_resolution;

// Output color
out vec4 gColor;

float saturate(float value) {
    return clamp(value, 0.0, 1.0);
}

void main() {
    // Calculate derivatives for anti-aliasing
    vec4 uvDDXY = vec4(dFdx(v_uv), dFdy(v_uv));
    vec2 uvDeriv = vec2(length(uvDDXY.xz), length(uvDDXY.yw));

    vec4 worldPosDDXY = vec4(dFdx(v_worldPos), dFdy(v_worldPos));
    vec2 worldPosDeriv = vec2(length(worldPosDDXY.xz), length(worldPosDDXY.yw));

    // Axis lines calculation
    float axisLineWidth = max(u_majorLineWidth, u_axisLineWidth);
    
    vec2 axisDrawWidth = vec2(axisLineWidth) + worldPosDeriv * 0.5; // Adjust for AA
    vec2 axisLineAA = worldPosDeriv * 1.5;
    vec2 axisLines2 = smoothstep(axisDrawWidth + axisLineAA, axisDrawWidth - axisLineAA, abs(v_worldPos.xy * 2.0));
    axisLines2 *= (axisLineWidth / axisDrawWidth);

    // Major grid lines
    float div = max(2.0, round(u_majorGridDiv));
    vec2 majorUVDeriv = worldPosDeriv / div;
    float majorLineWidth = u_majorLineWidth / div;
    vec2 majorDrawWidth = clamp(vec2(majorLineWidth), majorUVDeriv, vec2(0.5));
    vec2 majorLineAA = majorUVDeriv * 1.5;
    vec2 majorGridUV = 1.0 - abs(fract(v_worldPos.xy / div) * 2.0 - 1.0);
    vec2 majorGrid2 = smoothstep(majorDrawWidth + majorLineAA, majorDrawWidth - majorLineAA, majorGridUV);
    majorGrid2 *= (majorLineWidth / majorDrawWidth);


    // Minor grid lines
    float minorLineWidth = min(u_minorLineWidth, u_majorLineWidth);
    bool minorInvertLine = minorLineWidth > 0.5;
    float minorTargetWidth = minorInvertLine ? 1.0 - minorLineWidth : minorLineWidth;
    vec2 minorDrawWidth = clamp(vec2(minorTargetWidth), uvDeriv, vec2(0.5));
    vec2 minorLineAA = uvDeriv * 1.5;
    vec2 minorGridUV = abs(fract(v_uv) * 2.0 - 1.0);
    minorGridUV = minorInvertLine ? minorGridUV : 1.0 - minorGridUV;
    vec2 minorGrid2 = smoothstep(minorDrawWidth + minorLineAA, minorDrawWidth - minorLineAA, minorGridUV);
    minorGrid2 *= (minorTargetWidth / minorDrawWidth);


    if ( max(axisLines2.x, axisLines2.y) > 0.) {
        // If we're drawing axis lines, don't draw grid lines on axis
        majorGrid2 = vec2(0.);
        minorGrid2 = vec2(0.);
    }

 // Combine minor and major grid lines
    float minorGrid = mix(minorGrid2.x, 1.0, minorGrid2.y);
    float majorGrid = mix(majorGrid2.x, 1.0, majorGrid2.y);

    // Final color calculations for grid
    vec3 gridColor = mix(u_baseColor, u_minorLineColor, minorGrid);
    gridColor = mix(gridColor, u_majorLineColor, majorGrid);
    float gridAlpha = u_baseAlpha;

    // Apply base alpha to the grid lines
    if (minorGrid > 0.0) {
        gridAlpha = saturate(mix(gridAlpha, 1.0, minorGrid));
    }
    if (majorGrid > 0.0) {
        gridAlpha = saturate(mix(gridAlpha, 1.0, majorGrid));
    }

    // Apply axis color to the axis lines
    vec3 axisColor = mix(u_yAxisColor, u_xAxisColor, step(0.5, abs(v_worldPos.x)));
    axisColor = mix(axisColor, u_zAxisColor, step(0.5, abs(v_worldPos.y)));
    vec3 finalColor = mix(gridColor, axisColor, max(axisLines2.x, axisLines2.y));

    if ( max(axisLines2.x, axisLines2.y) > 0.) {
        gridAlpha = saturate(mix(gridAlpha, 1.0, max(axisLines2.x, axisLines2.y)));
    }

    // Set the final fragment color
    gColor = vec4(finalColor, gridAlpha);
}