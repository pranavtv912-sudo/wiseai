import { useEffect, useRef } from 'react'

const VS = `
  attribute vec2 position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FS = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i); float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)); float d = hash(i + vec2(1.0,1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(p); p = rot * p * 2.0 + shift; a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_texCoord;
    vec2 p = (v_texCoord - 0.5) * 2.0;
    p.x *= u_resolution.x / u_resolution.y;
    float t = u_time * 0.15;
    vec2 m = (u_mouse / u_resolution) - 0.5;
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(1.0,1.0) + t));
    vec2 r = vec2(fbm(p + 1.0*q + vec2(1.7,9.2) + 0.15*t), fbm(p + 1.0*q + vec2(8.3,2.8) + 0.126*t));
    float f = fbm(p + r);
    vec3 color = vec3(0.015, 0.015, 0.015);
    vec3 emerald = vec3(0.0, 0.5, 0.3);
    vec3 violet = vec3(0.4, 0.1, 0.6);
    color = mix(color, emerald, clamp(f*f*4.0,0.0,1.0));
    color = mix(color, violet, clamp(length(q),0.0,1.0)*0.3);
    color = mix(color, vec3(0.1,0.2,0.2), clamp(length(r.x),0.0,1.0)*0.2);
    float mouseLight = smoothstep(0.8, 0.0, length(p - m*2.0));
    color += emerald * mouseLight * 0.1;
    color += (hash(uv + u_time) - 0.5) * 0.02;
    gl_FragColor = vec4(color, 1.0);
  }
`

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

export default function WebGLBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const program = gl.createProgram()
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, VS))
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'position')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')

    let mouse = { x: 0, y: 0 }
    const onMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = window.innerHeight - e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    let rafId
    function render(time) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(program)
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
      gl.uniform1f(timeLoc, time * 0.001)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.uniform2f(mouseLoc, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: -1, pointerEvents: 'none',
      }}
    />
  )
}
