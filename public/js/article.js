class Grain {
    constructor(el) {
      /**
       * Options
       * Increase the pattern size if visible pattern
       */
      this.patternSize = 100;
      this.patternScaleX = 1;
      this.patternScaleY = 1;
      this.patternRefreshInterval = 3;
      this.patternAlpha = 255; // Maximum alpha value to make grains as dark as possible
  
      /**
       * Create canvas
       */
      this.canvas = el;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.scale(this.patternScaleX, this.patternScaleY);
  
      /**
       * Create a canvas that will be used to generate grain and used as a
       * pattern on the main canvas.
       */
      this.patternCanvas = document.createElement('canvas');
      this.patternCanvas.width = this.patternSize;
      this.patternCanvas.height = this.patternSize;
      this.patternCtx = this.patternCanvas.getContext('2d');
      this.patternData = this.patternCtx.createImageData(this.patternSize, this.patternSize);
      this.patternPixelDataLength = this.patternSize * this.patternSize * 4; // rgba = 4
  
      /**
       * Prebind prototype function, so later its easier to user
       */
      this.resize = this.resize.bind(this);
      this.loop = this.loop.bind(this);
  
      this.frame = 0;
  
      window.addEventListener('resize', this.resize);
      this.resize();
  
      window.requestAnimationFrame(this.loop);
    }
  
    resize() {
      this.canvas.width = window.innerWidth * devicePixelRatio;
      this.canvas.height = window.innerHeight * devicePixelRatio;
    }
  
    update() {
      const { patternPixelDataLength, patternData, patternAlpha, patternCtx } = this;
      // put a random shade of gray into every pixel of the pattern
      for (let i = 0; i < patternPixelDataLength; i += 4) {
      const value = Math.random() * 20; // Extremely dark grains

      patternData.data[i] = value;
      patternData.data[i + 1] = value;
      patternData.data[i + 2] = value;
      patternData.data[i + 3] = patternAlpha;
      }
          
      patternCtx.putImageData(patternData, 0, 0);
    }
  
    draw() {
      const { ctx, patternCanvas, canvas } = this;
      const { width, height } = canvas;
  
      // clear canvas
      ctx.clearRect(0, 0, width, height);
  
      // fill the canvas using the pattern
      ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat');
      ctx.fillRect(0, 0, width, height);
    }
  
    loop() {
      // only update grain every n frames
      const shouldDraw = ++this.frame % this.patternRefreshInterval === 0;
      if (shouldDraw) {
        this.update();
        this.draw();
      }
  
      window.requestAnimationFrame(this.loop);
    }
  }
  
  /**
   * Initiate Grain
   */
  const el = document.querySelector('.grain');
  const grain = new Grain(el);
  
  (function() {
    var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, context, resizeWindow;
  
    NUM_CONFETTI = 350;
  
    COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];
  
    PI_2 = 2 * Math.PI;
  
    canvas = document.getElementById("world");
  
    context = canvas.getContext("2d");
  
    window.w = 0;
  
    window.h = 0;
  
    canvasResize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
  
    resizeWindow = function() {
      canvasResize();
      window.h = canvas.height = window.innerHeight;
    };
  
    window.addEventListener('resize', resizeWindow, false);
  
    window.onload = function() {
      return setTimeout(resizeWindow, 0);
    };
  }).call(this);