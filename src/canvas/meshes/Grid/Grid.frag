precision highp float;

// Varyings from the vertex shader
in vec4 v_uv;

#include <common>
// Uniforms
uniform float u_majorLineWidth, u_minorLineWidth, u_axisLineWidth, u_axisDashScale;
uniform vec3 u_majorLineColor, u_minorLineColor, u_baseColor, u_xAxisColor, u_xAxisDashColor, u_yAxisColor, u_yAxisDashColor, u_zAxisColor, u_zAxisDashColor, u_centerColor;
uniform float u_majorGridDiv, u_baseAlpha;

// Output color
out vec4 gColor;

void main() {
    vec2 dFdxUV = vec2(dFdx(v_uv.x), dFdx(v_uv.y));
    vec2 dFdyUV = vec2(dFdy(v_uv.x), dFdy(v_uv.y));
    // Now you can use dFdxUV and dFdyUV as needed
    // For example, calculating the length of derivatives for each component
    vec2 uvDeriv = vec2(length(dFdxUV), length(dFdyUV));
    
    float axisLineWidth = max(u_majorLineWidth, u_axisLineWidth);
    vec2 axisDrawWidth = max(vec2(axisLineWidth), uvDeriv);
    vec2 axisLineAA = uvDeriv * 1.5;
    vec2 axisLines2 = smoothstep(axisDrawWidth + axisLineAA, axisDrawWidth - axisLineAA, abs(v_uv.zw * 2.0));
    axisLines2 *= saturate(axisLineWidth / axisDrawWidth);

    float div = max(2.0, round(u_majorGridDiv));
    vec2 majorUVDeriv = uvDeriv / div;
    float majorLineWidth = u_majorLineWidth / div;
    vec2 majorDrawWidth = clamp(vec2(majorLineWidth), majorUVDeriv, vec2(0.5));
    vec2 majorLineAA = majorUVDeriv * 1.5;
    vec2 majorGridUV = 1.0 - abs(fract(v_uv.xy / div) * 2.0 - 1.0);
    vec2 majorAxisOffset = (1.0 - saturate(abs(v_uv.zw / div * 2.0))) * 2.0;
    majorGridUV += majorAxisOffset;
    vec2 majorGrid2 = smoothstep(majorDrawWidth + majorLineAA, majorDrawWidth - majorLineAA, majorGridUV);
    majorGrid2 *= saturate(majorLineWidth / majorDrawWidth);
    majorGrid2 = saturate(majorGrid2 - axisLines2);
    majorGrid2 = mix(majorGrid2, vec2(majorLineWidth), saturate(majorUVDeriv * 2.0 - 1.0));

    float minorLineWidth = min(u_minorLineWidth, u_majorLineWidth);
    bool minorInvertLine = minorLineWidth > 0.5;
    float minorTargetWidth = minorInvertLine ? 1.0 - minorLineWidth : minorLineWidth;
    vec2 minorDrawWidth = clamp(vec2(minorTargetWidth), uvDeriv, vec2(0.5));
    vec2 minorLineAA = uvDeriv * 1.5;
    vec2 minorGridUV = abs(fract(v_uv.xy) * 2.0 - 1.0);
    minorGridUV = minorInvertLine ? minorGridUV : 1.0 - minorGridUV;
    vec2 minorMajorOffset = (1.0 - saturate((1.0 - abs(fract(v_uv.zw / div) * 2.0 - 1.0)) * div)) * 2.0;
    minorGridUV += minorMajorOffset;
    vec2 minorGrid2 = smoothstep(minorDrawWidth + minorLineAA, minorDrawWidth - minorLineAA, minorGridUV);
    minorGrid2 *= saturate(minorTargetWidth / minorDrawWidth);
    minorGrid2 = saturate(minorGrid2 - axisLines2);
    minorGrid2 = mix(minorGrid2, vec2(minorTargetWidth), saturate(uvDeriv * 2.0 - 1.0));
    minorGrid2 = minorInvertLine ? 1.0 - minorGrid2 : minorGrid2;
    // Check if any component of v_uv.zw is greater than 0.5
    if (any(greaterThan(abs(v_uv.zw), vec2(0.5)))) {
        minorGrid2 = minorGrid2;
    } else {
        minorGrid2 = vec2(0.0);
    }

    float minorGrid = mix(minorGrid2.x, 1.0, minorGrid2.y);
    float majorGrid = mix(majorGrid2.x, 1.0, majorGrid2.y);

    // Axis dash pattern calculation
    vec2 axisDashUV = abs(fract((v_uv.zw + axisLineWidth * 0.5) * u_axisDashScale) * 2.0 - 1.0) - 0.5;
    vec2 axisDashDeriv = uvDeriv * u_axisDashScale * 1.5;
    vec2 axisDash = smoothstep(-axisDashDeriv, axisDashDeriv, axisDashUV);
    // Apply the condition to each component of axisDash
    axisDash.x = v_uv.z < 0.0 ? axisDash.x : 1.0;
    axisDash.y = v_uv.w < 0.0 ? axisDash.y : 1.0;

    // Color calculations (Gamma correction part is omitted)
    vec3 xAxisColor = u_xAxisColor.rgb;
    vec3 yAxisColor = u_yAxisColor.rgb;
    vec3 zAxisColor = u_zAxisColor.rgb;
    vec3 xAxisDashColor = u_xAxisDashColor.rgb;
    vec3 yAxisDashColor = u_yAxisDashColor.rgb;
    vec3 zAxisDashColor = u_zAxisDashColor.rgb;
    vec3 centerColor = u_centerColor.rgb;

    vec3 aAxisColor = yAxisColor;
    vec3 bAxisColor = zAxisColor;
    vec3 aAxisDashColor = yAxisDashColor;
    vec3 bAxisDashColor = zAxisDashColor;

    aAxisColor = mix(aAxisDashColor, aAxisColor, axisDash.y);
    bAxisColor = mix(bAxisDashColor, bAxisColor, axisDash.x);
    aAxisColor = mix(aAxisColor, centerColor, axisLines2.y);

    vec3 axisLines = mix(bAxisColor * axisLines2.y, aAxisColor, axisLines2.x);

    // Base color with alpha
    vec4 baseColorWithAlpha = vec4(u_baseColor, u_baseAlpha);
    float baseAlpha = u_baseAlpha;

    // Apply minor grid lines on top of the base color
    vec3 col = mix(baseColorWithAlpha.rgb, u_minorLineColor, minorGrid);

    // Overlay axis lines
    col = col + axisLines * (1.0 - minorGrid);

    // Overlay major grid lines, ensuring they remain fully opaque
    // Note: major grid lines are not affected by base color's alpha
    col = mix(col, u_majorLineColor, majorGrid );
    // Overlay minor grid lines, ensuring they remain fully opaque
    // Note: minor grid lines are not affected by base color's alpha
    col = mix(col, u_minorLineColor, minorGrid);
    
    if (minorGrid > 0.) {
      // patch for minor grid lines inheriting base color with baseAlpha 0
      if (baseAlpha == 0.0) {
          col = vec3(1.) * minorGrid;
      }
      baseAlpha = mix(baseAlpha, 1.0, minorGrid);
      col = mix(col, u_minorLineColor, minorGrid);
    }

    if (majorGrid > 0.) {
      // patch for minor grid lines inheriting base color with baseAlpha 0
      if (baseAlpha == 0.0) {
          col = vec3(1.) * majorGrid;
      }
      baseAlpha = mix(baseAlpha, 1.0, majorGrid);
      col = mix(col, u_majorLineColor, majorGrid);
    }

    if (length(axisLines) > 0.) {
      // patch for minor grid lines inheriting base color with baseAlpha 0
      if (baseAlpha == 0.0) {
          col = vec3(1.) * length(axisLines);
      }
      baseAlpha = mix(baseAlpha, 1.0, length(axisLines));
      col = mix(col, axisLines, length(axisLines));
    }

    // Set the final fragment color
    // The final baseAlpha value is derived from the base color's baseAlpha
    gColor = vec4(col, baseAlpha);
}
