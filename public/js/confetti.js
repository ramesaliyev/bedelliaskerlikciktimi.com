// Credit: https://github.com/alexandermendes/vue-confetti

class Particle {
  /**
   * Setup the particle.
   * @param {options} opts
   *   The particle options
   */
  setup ({ ctx, W, H, colors, wind, windPosCoef, windSpeedMax, count, shape }) {
    this.ctx = ctx
    this.W = W
    this.H = H
    this.wind = wind
    this.shape = shape
    this.windPosCoef = windPosCoef
    this.windSpeedMax = windSpeedMax
    this.x = this.rand(-35, W + 35)
    this.y = this.rand(-30, -35)
    this.d = this.rand(150) + 10 // density
    this.r = this.rand(10, 30)
    this.color = colors.color // get the next color
    this.tilt = this.randI(10)
    this.tiltAngleIncremental = (
      (this.rand(0.08) + 0.04) * (this.rand() < 0.5 ? -1 : 1)
    )
    this.tiltAngle = 0
    this.angle = this.rand(Math.PI * 2)
    this.count = count++
    return this
  }

  /**
   * Return a random number.
   * @param {Number} min
   *   The minimum number.
   * @param {Number} max
   *   The maximum number.
   */
  randI (min, max = min + (min = 0)) {
    return (Math.random() * (max - min) + min) | 0
  }

  /**
   * Return a random number with a minimum of one.
   * @param {Number} min
   *   The minimum number.
   * @param {Number} max
   *   The maximum number.
   */
  rand (min = 1, max = min + (min = 0)) {
    return Math.random() * (max - min) + min
  }

  /**
   * Update the particle.
   */
  update () {
    this.tiltAngle += (this.tiltAngleIncremental * (
      Math.cos(this.wind + (this.d + this.x + this.y) * this.windPosCoef) *
      0.2 + 1
    ))
    this.y += (Math.cos(this.angle + this.d) + 3 + this.r / 2) / 2
    this.x += Math.sin(this.angle)
    this.x += Math.cos(
      this.wind + (this.d + this.x + this.y) * this.windPosCoef
    ) * this.windSpeedMax
    this.y += Math.sin(
      this.wind + (this.d + this.x + this.y) * this.windPosCoef
    ) * this.windSpeedMax
    this.tilt = (Math.sin(this.tiltAngle - (this.count / 3))) * 15
    return this.y > this.H // returns true if particle is past bottom
  }

  /**
   * Draw a round particle.
   */
  drawCircle () {
    this.ctx.arc(0, 0, (this.r / 2), 0, Math.PI * 2, false)
    this.ctx.fill()
  }

  /**
   * Draw a rectangular particle.
   */
  drawRect () {
    this.ctx.fillRect(0, 0, this.r, this.r / 2)
  }

  /**
   * Draw a heart-shaped particle.
   */
  drawHeart () {
    const curveTo = (cp1x, cp1y, cp2x, cp2y, x, y) => {
      this.ctx.bezierCurveTo(
        cp1x / this.r * 2,
        cp1y / this.r * 2,
        cp2x / this.r * 2,
        cp2y / this.r * 2,
        x / this.r * 2,
        y / this.r * 2
      )
    }
    this.ctx.moveTo(37.5 / this.r, 20 / this.r)
    curveTo(75, 37, 70, 25, 50, 25)
    curveTo(20, 25, 20, 62.5, 20, 62.5)
    curveTo(20, 80, 40, 102, 75, 120)
    curveTo(110, 102, 130, 80, 130, 62.5)
    curveTo(130, 62.5, 130, 25, 100, 25)
    curveTo(85, 25, 75, 37, 75, 40)
    this.ctx.fill()
  }

  /**
   * Draw a particle.
   */
  draw () {
    this.ctx.fillStyle = this.color
    this.ctx.beginPath()
    this.ctx.setTransform(
      Math.cos(this.tiltAngle), // set the x axis to the tilt angle
      Math.sin(this.tiltAngle),
      0, 1,
      this.x, this.y // set the origin
    )
    if (this.shape === 'circle') {
      this.drawCircle()
    } else if (this.shape === 'rect') {
      this.drawRect()
    } else if (this.shape === 'heart') {
      this.drawHeart()
    }
  }
}

class Particles {
  constructor (opts) {
    this.items = []
    this.pool = []
    this.opts = opts
  }

  /**
   * Move the particle back to the pool if it is past the bottom.
   */
  update () {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].update() === true) {
        this.pool.push(this.items.splice(i--, 1)[0])
      }
    }
  }

  /**
   * Draw the particles currently in view.
   */
  draw () {
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].draw()
    }
  }

  /**
   * Add an item to the view.
   */
  add () {
    if (this.pool.length > 0) {
      this.items.push(this.pool.pop().setup(this.opts))
    } else {
      this.items.push(new Particle().setup(this.opts))
    }
  }
}


class Confetti {
  constructor () {
    this.initialize()
    this.onResizeCallback = this.updateDimensions.bind(this)
  }

  /**
   * Initialize default.
   */
  initialize () {
    this.canvas = null
    this.ctx = null
    this.W = 0
    this.H = 0
    this.particles = {}
    this.droppedCount = 0
    this.particlesPerFrame = 1.5
    this.wind = 0
    this.windSpeed = 1
    this.windSpeedMax = 1
    this.windChange = 0.01
    this.windPosCoef = 0.002
    this.maxParticlesPerFrame = 2 // max particles dropped per frame
    this.animationId = null
  }

  /**
   * Create the confetti particles.
   * @param {Object} opts
   *   The particle options.
   */
  createParticles (opts = {}) {
    this.particles = new Particles({
      ctx: this.ctx,
      W: this.W,
      H: this.H,
      wind: this.wind,
      windPosCoef: this.windPosCoef,
      windSpeedMax: this.windSpeedMax,
      count: 0,
      shape: opts.shape || 'circle',
      colors: {
        opts: opts.colors || [
          'DodgerBlue',
          'OliveDrab',
          'Gold',
          'pink',
          'SlateBlue',
          'lightblue',
          'Violet',
          'PaleGreen',
          'SteelBlue',
          'SandyBrown',
          'Chocolate',
          'Crimson'
        ],
        idx: 0,
        step: 10,
        get color () {
          return this.opts[((this.idx++) / this.step | 0) % this.opts.length]
        }
      }
    })
  }

  /**
   * Add a fixed, full-screen canvas to the page.
   */
  createContext () {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.canvas.style.display = 'block'
    this.canvas.style.position = 'fixed'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.top = 0
    this.canvas.style.width = '100vw'
    this.canvas.style.height = '100vh'
    this.canvas.id = 'confetti-canvas'
    document.querySelector('body').appendChild(this.canvas)
  }

  /**
   * Start dropping confetti.
   * @param {Object} opts
   *   The particle options.
   */
  start (opts) {
    if (!this.ctx) {
      this.createContext()
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId) // Cancel any previous loop
    }
    this.createParticles(opts)
    this.updateDimensions()
    this.particlesPerFrame = this.maxParticlesPerFrame
    this.animationId = requestAnimationFrame(this.mainLoop.bind(this))
    window.addEventListener('resize', this.onResizeCallback)
  }

  /**
   * Stop dropping confetti.
   */
  stop () {
    this.particlesPerFrame = 0
    window.removeEventListener('resize', this.onResizeCallback)
  }

  /**
   * Remove confetti.
   */
  remove () {
    this.stop()
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.canvas) {
      document.body.removeChild(this.canvas)
    }
    this.initialize()
  }

  /**
   * Update the dimensions, if necessary.
   */
  updateDimensions () {
    if (this.W !== window.innerWidth || this.H !== window.innerHeight) {
      this.W = this.particles.opts.W = this.canvas.width = window.innerWidth
      this.H = this.particles.opts.H = this.canvas.height = window.innerHeight
    }
  }

  /**
   * Run the main animation loop.
   */
  mainLoop (time) {
    this.updateDimensions()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.W, this.H)
    this.windSpeed = Math.sin(time / 8000) * this.windSpeedMax
    this.wind = this.particles.opts.wind += this.windChange
    while (this.droppedCount < this.particlesPerFrame) {
      this.droppedCount += 1
      this.particles.add()
    }
    this.droppedCount -= this.particlesPerFrame
    this.particles.update()
    this.particles.draw()

    // Stop calling if no particles left in view (i.e. it's been stopped)
    if (this.particles.items.length) {
      this.animationId = requestAnimationFrame(this.mainLoop.bind(this))
    }
  }
}

const confetti = new Confetti();
confetti.start();
setTimeout(() => confetti.stop(), 5000);