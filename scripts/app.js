const app = Vue.createApp({
    template: `
    <div class="container">
        <canvas id="noise"></canvas>
        <div class="top">
            <h1>It is a cold, dark universe...</h1>
            <h2>Will you be it's luminary?</h2>
            <canvas id="sphere" width="1000" height="500" style="border:1px solid #000000;"/>
        </div>
        <div class="center">
            <div class="btn">
                <h5 @click="powerBtn();">Add Energy</h5>
            </div>
            <div class="btn">
                <h5 @click="willBtn();">Add Pressure</h5>
            </div>
            <div class="btn">
                <h5 @click="unleashBtn();">Undo Pressure</h5>
            </div>
            <div class="btn">
                <h5 @click="playMusic();">Play Music</h5>
            </btn>
        </div>
        <div class="bottom">
        </div>
        <div>
            <div>
                <h4>Core Temperature: {{this.getTemperature().toFixed(2)}} Kelvin</h4>
                <h4>Power Emission: {{this.getLoss().toFixed(2)}} Kilowatt</h4>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            sphere: {
                width: 1000,
                height: 500,
                context: null,
                canvas: null
            },
            noise: {
                context: null,
                canvas: null
            },
            model: {
                dt: 0.000000001,
                mass: 1.0,
                kineticEnergy: 1.0,
                imposedPressure: 1.0,
                sigmaBlackbody: 5.67*Math.pow(10, -8)
            },
            audio: {}
        }
    },
    methods: {
        kelvinToRGB(tempKelvin) {
            let temp = tempKelvin / 100;
            let red, green, blue;
            if (temp <= 66) {
                red = 255;
                green = temp;
                green = 99.4708025861 * Math.log(green) - 161.1195681661;
                if (temp <= 19) {
                    blue = 0;
                } else {
                    blue = temp - 10;
                    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
                }
            } else {
                red = temp - 60;
                red = 329.698727446 * Math.pow(red, -0.1332047592);
                green = temp - 60;
                green = 288.1221695283 * Math.pow(green, -0.0755148492);
                blue = 255;
            }
            let lum = Math.min(tempKelvin/2200.0, 1.0)
            red = Math.min(255, Math.max(0, red))*lum;
            green = Math.min(255, Math.max(0, green))*lum;
            blue = Math.min(255, Math.max(0, blue))*lum;
            return `rgb(${red}, ${green}, ${blue})`;
        },        
        powerBtn() {
            this.model.kineticEnergy += 100.0;
        },
        willBtn() {
            this.model.imposedPressure *= Math.exp(0.5);
        },
        unleashBtn() {
            this.model.imposedPressure = 1.0;
        },
        playMusic() {
            this.playButtonSound("music");
        },
        playButtonSound(type) {
            switch (type) {
                case "music":
                    this.audio.music.play();
                    break;
                default:
                    break;
            }
        },
        getTemperature() {
            return this.model.kineticEnergy/this.model.mass;
        },
        getRadius() {
            return Math.pow((4.0*this.getTemperature()/this.model.imposedPressure*Math.PI), 0.33) + 10.0;
        },
        getLoss(){
            return this.model.dt*this.model.sigmaBlackbody*Math.pow(this.getTemperature(), 4)*Math.pow(this.getRadius(), 2);
        },
        updateSphere() {
            this.clearSphere();
            /* Update variables. */
            let radius = this.getRadius();
            let temperature = this.getTemperature();
            this.model.kineticEnergy -= this.getLoss();
            
            /* Retrieve variables. */
            radius = this.getRadius();
            temperature = this.getTemperature();

            /* Calculate shading. */
            const grd1 = this.sphere.context.createRadialGradient(500,300,0,500,300, radius);
            grd1.addColorStop('0', this.kelvinToRGB(temperature));
            grd1.addColorStop('0.7', "rgb(0, 0, 0, 0.0)");
            this.sphere.context.fillStyle = grd1;
            this.sphere.context.beginPath();
            this.sphere.context.arc(500, 300, radius, 0, 2*Math.PI);
            this.sphere.context.fill();
            this.sphere.context.closePath();
        },
        updateNoise() {
            let ctx = this.noise.context;
            const w = ctx.canvas.width,
            h = ctx.canvas.height,
            iData = ctx.createImageData(w, h),
            buffer32 = new Uint32Array(iData.data.buffer),
            len = buffer32.length
            let i = 0
            for(; i < len;i++)
                if (Math.random() < 0.01) buffer32[i] = 0xffffffff;
                ctx.putImageData(iData, 0, 0);
        },
        resize() {
            this.noise.canvas.width = window.innerWidth * window.devicePixelRatio;
            this.noise.canvas.height = window.innerHeight * window.devicePixelRatio;
            this.noise.canvas.style.width = window.innerWidth + 'px';
            this.noise.canvas.style.height = window.innerHeight + 'px';
        },
        loop() {
            this.updateSphere();
            this.updateNoise();
            window.requestAnimationFrame(this.loop);
        },
        clearSphere() {
            this.sphere.context.clearRect(0, 0, this.sphere.width, this.sphere.height);
        }
    },
    mounted() {
        var c = document.getElementById("sphere");
        var ctx = c.getContext("2d");
        this.sphere.context = ctx;
        this.sphere.canvas = c;
        c = document.getElementById("noise");
        ctx = c.getContext("2d");
        this.noise.context = ctx;
        this.noise.canvas = c;
        this.resize();
        window.requestAnimationFrame(this.loop);
        window.addEventListener('resize', this.resize, false);
        var music = new Audio('sounds/music.mp3');
        var ambience = new Audio('sounds/ambience.mp3');
        this.audio.music = music;
        this.audio.music.volume = 0.4;
        this.audio.ambience = ambience;
        this.audio.ambience.addEventListener('ended', ()=> {
            this.audio.ambience.play();
        })
        this.audio.music.play();
        this.audio.ambience.play();
    }
})

app.mount('#app')