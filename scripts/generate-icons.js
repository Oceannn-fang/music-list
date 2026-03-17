// 生成 PWA 图标
const fs = require('fs')
const { createCanvas } = require('canvas')

const sizes = [192, 512]

sizes.forEach((size) => {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // 背景
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#1DB954')
  gradient.addColorStop(1, '#1ed760')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.15)
  ctx.fill()

  // 唱片图标
  const center = size / 2
  const radius = size * 0.35
  const lineWidth = size * 0.06

  // 外圆
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = lineWidth
  ctx.stroke()

  // 中心点
  ctx.beginPath()
  ctx.arc(center, center, radius * 0.15, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()

  // 音轨线条
  ctx.beginPath()
  ctx.arc(center, center, radius * 0.5, 0.7, 2.5)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = lineWidth * 0.5
  ctx.stroke()

  // 保存
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(`public/icon-${size}x${size}.png`, buffer)
  console.log(`Generated icon-${size}x${size}.png`)
})

console.log('All icons generated!')
