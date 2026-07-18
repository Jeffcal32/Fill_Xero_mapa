const canvas = document.getElementById('shader-canvas');
    const gl = canvas.getContext('webgl');

    if (gl) {
        // Vertex Shader
        const vsSource = `
            attribute vec4 a_position;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = a_position;
                v_texCoord = a_position.xy * 0.5 + 0.5;
            }
        `;

        // Hexagonal grid shader
        const fsSource = `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            varying vec2 v_texCoord;

            // Hexagon distance function
            float hexDist(vec2 p) {
                p = abs(p);
                float c = dot(p, normalize(vec2(1.0, 1.73)));
                c = max(c, p.x);
                return c;
            }

            void main() {
                vec2 uv = (v_texCoord - 0.5) * u_resolution / min(u_resolution.x, u_resolution.y);
                uv *= 10.0; // Scale grid

                // Hex grid coordinates
                vec2 r = vec2(1.0, 1.73);
                vec2 h = r * 0.5;
                vec2 a = mod(uv, r) - h;
                vec2 b = mod(uv - h, r) - h;
                vec2 gv = dot(a, a) < dot(b, b) ? a : b;

                float d = hexDist(gv);
                float edge = smoothstep(0.45, 0.5, d);
                
                vec2 mouse = (u_mouse / u_resolution - 0.5) * u_resolution / min(u_resolution.x, u_resolution.y) * 10.0;
                vec2 cellCenter = uv - gv;
                float distToMouse = distance(cellCenter, mouse);
                
                float pulse = smoothstep(3.0, 0.0, distToMouse) * (sin(u_time * 2.0 - distToMouse) * 0.5 + 0.5);

                vec3 baseColor = vec3(0.04, 0.04, 0.04);
                vec3 neonColor = vec3(0.83, 1.0, 0.27); // #D4FF45 Neon Lime
                
                vec3 finalColor = mix(baseColor, neonColor * (0.1 + pulse * 0.5), edge);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const timeLocation = gl.getUniformLocation(program, "u_time");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const mouseLocation = gl.getUniformLocation(program, "u_mouse");

        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = window.innerHeight - e.clientY; // Invert Y for WebGL
        });

        function resizeCanvasToDisplaySize(canvas) {
            const displayWidth  = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width  = displayWidth;
                canvas.height = displayHeight;
                return true;
            }
            return false;
        }

        function render(time) {
            time *= 0.001; // Convert to seconds

            resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.uniform1f(timeLocation, time);
            gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(mouseLocation, mouseX, mouseY);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }
