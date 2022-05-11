/*global fabric Promise devicePixelRatio document*/

class App {
  constructor(d = {}) {
    d.gdH = d.rulerH.getContext('2d')
    d.gdV = d.rulerV.getContext('2d')

    d.rulerH.width = d.rulerH.offsetWidth
    d.rulerH.height = d.rulerH.offsetHeight

    d.rulerV.width = d.rulerV.offsetWidth
    d.rulerV.height = d.rulerV.offsetHeight

    d.sceneCanvas.width = d.sceneCanvas.offsetWidth
    d.sceneCanvas.height = d.sceneCanvas.offsetHeight

    d.canvas = new fabric.Canvas(d.sceneCanvas)
    d.isMouseDown = false

    d.scale = 1
    d.fontSize = 12
    d.virtualSizes = Array(10).fill().map((_, idx) => {
      const plusNum = Math.pow(10, idx)
      return [2, 5, 10].map(n => n * plusNum)
    }).flat()
    d.virtualSize = -1
    d.pixelSize = -1
    d.lenH = 0
    d.lenV = 0

    this.d = d
    this.init()
  }
  async init() {
    const me = this

    await me.loadImg()
    await me.initEvents()
    await me.render()
  }
  async loadImg() {
    const me = this
    const d = me.d

    return new Promise((next) => {
      fabric.Image.fromURL('demo.jpg', (img) => {
        img.hasControls  = false
        // img.lockRotation = true
        // img.lockScalingX = true
        // img.lockScalingY = true

        img.set({
          left: 100,
          top: 100,
        })

        d.img = img
        d.canvas.add(img)
        next()
      })
    })
  }
  async initEvents() {
    const me = this
    const d = me.d

    d.img.on('mousewheel', (e) => {
      const isUp = e.e.deltaY < 0
      
      const originOffsetX = d.img.left
      const originOffsetY = d.img.top

      const originWidth = d.img.width * d.scale
      const originHeight = d.img.height * d.scale

      const scalePosX = (e.e.offsetX - d.img.left) / originWidth
      const scalePosY = (e.e.offsetY - d.img.top) / originHeight

      isUp ? (d.scale *= 1.2) : (d.scale /= 1.2)

      d.img.set({
        left: -(d.img.width * d.scale - originWidth) * scalePosX + originOffsetX,
        top: -(d.img.height * d.scale - originHeight) * scalePosY + originOffsetY,
      })

      d.img.scale(d.scale)
      me.render()
    })

    d.img.on('mousedown', () => {
      d.img.on('mousemove', () => {
        me.render()
      })

      d.img.on('mouseup', () => {
        d.img.off('mousemove')
        d.img.off('mouseup')
      })
    })
  }
  renderRulerH() {
    const me = this
    const d = me.d
    const {rulerH: canvas, gdH: gd} = d
    const canvasHeight = canvas.height
    const offsetX = d.img.left % d.pixelSize
    const startIndex = -Number(((d.img.left - offsetX) / d.pixelSize).toFixed(1))

    gd.clearRect(0, 0, canvas.width, canvas.height)
    gd.font = d.fontSize + 'px Arial'
    gd.beginPath()

    for (let i = 0, len = d.lenH; i < len; i++) {
      const _i = i + startIndex
      const x1 = i * d.pixelSize + offsetX
      const y1 = canvasHeight

      const x2 = x1
      const y2 = y1 - canvasHeight / (_i % 10 === 0 ? 1 : (_i % 5 === 0 ? 2 : 4))

      gd.moveTo(x1, y1)
      gd.lineTo(x2, y2)
    }

    gd.fillStyle = '#a00'
    gd.strokeStyle = '#a00'
    gd.stroke()

    gd.textAlign = 'left'
    gd.textBaseline = 'middle'

    for (let i = 0, len = d.lenH; i < len; i++) {
      const _i = i + startIndex
      const x1 = i * d.pixelSize + offsetX + 5
      const y1 = canvasHeight / 2

      if (_i % 10 === 0) {
        gd.fillText(_i * (d.virtualSize / 10), x1, y1)
      }
    }
  }
  renderRulerV() {
    const me = this
    const d = me.d
    const {rulerV: canvas, gdV: gd} = d
    const canvasWidth = canvas.width
    const offsetY = d.img.top % d.pixelSize
    const startIndex = -Number(((d.img.top - offsetY) / d.pixelSize).toFixed(1))

    gd.clearRect(0, 0, canvas.width, canvas.height)
    gd.font = d.fontSize + 'px Arial'
    gd.beginPath()

    for (let i = 0, len = d.lenV; i < len; i++) {
      const _i = i + startIndex
      const x1 = canvasWidth
      const y1 = i * d.pixelSize + offsetY

      const x2 = x1 - canvasWidth / (_i % 10 === 0 ? 1 : (_i % 5 === 0 ? 2 : 4))
      const y2 = y1

      gd.moveTo(x1, y1)
      gd.lineTo(x2, y2)
    }

    gd.fillStyle = '#a00'
    gd.strokeStyle = '#a00'
    gd.stroke()

    gd.textAlign = 'center'
    gd.textBaseline = 'top'

    for (let i = 0, len = d.lenV; i < len; i++) {
      const _i = i + startIndex
      const x1 = canvasWidth / 2 - 2
      const y1 = i * d.pixelSize + offsetY + 5

      if (_i % 10 !== 0) continue
      
      const sn = (_i * (d.virtualSize / 10)).toString()

      for (let j = 0; j < sn.length; j++) {
        gd.fillText(sn[j], x1, y1 + j * d.fontSize)
      }
    }
  }
  renderRuler() {
    const me = this
    const d = me.d

    d.virtualSize = -1
    d.pixelSize = -1

    for (let i = 0; i < d.virtualSizes.length; i++) {
      const size = d.virtualSizes[i]
      const pixelUintSize = d.scale * size

      if (pixelUintSize > 50) {
        d.virtualSize = size
        d.pixelSize = pixelUintSize / 10
        break
      }
    }

    d.lenH = Math.ceil(d.sceneCanvas.width / (d.pixelSize * devicePixelRatio))
    d.lenV = Math.ceil(d.sceneCanvas.height / (d.pixelSize * devicePixelRatio))

    me.renderRulerH()
    me.renderRulerV()
  }
  render() {
    const me = this
    const d = me.d

    me.renderRuler()
    d.canvas.renderAll()
  }
}

new App({
  sceneCanvas: document.getElementById('scene'),
  rulerH: document.getElementById('ruler-h'),
  rulerV: document.getElementById('ruler-v'),
})