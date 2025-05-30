<template>
  <div class="hunter-wrapper">
    <div class="hunter-counter">
      {{ destroyCount }}
    </div>
    <div 
      class="cursor-hunter"
      :style="{
        '--x': `${position.x}px`,
        '--y': `${position.y}px`,
        '--rotation': `${rotation}deg`,
        '--scale': isColliding ? '1.2' : isDestroying ? '0' : '1',
        '--size': `${HUNTER_SIZE}px`,
        '--glow-intensity': isColliding ? '1' : '0.5',
        'opacity': isVisible && !isDestroying ? '1' : '0'
      }"
      :class="{ 
        'colliding': isColliding,
        'hunting': !isColliding && Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1,
        'on-screen': isOnScreen,
        'destroying': isDestroying
      }"
      @click.stop="handleHunterClick"
    >
      <div class="hunter-body">
        <div class="hunter-core"></div>
        <div class="hunter-eye left">
          <div class="pupil"></div>
          <div class="glow"></div>
        </div>
        <div class="hunter-eye right">
          <div class="pupil"></div>
          <div class="glow"></div>
        </div>
        <div class="hunter-mouth">
          <div class="teeth"></div>
        </div>
        <div class="hunter-aura"></div>
      </div>
      <div class="hunter-trail"></div>
      <div class="hunter-particles"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const isVisible = ref(false)
const position = ref({ x: 0, y: 0 })
const targetPosition = ref({ x: 0, y: 0 })
const velocity = ref({ x: 0, y: 0 })
const rotation = ref(0)
const isColliding = ref(false)
const pathPoints = ref<Array<{x: number, y: number}>>([])
const currentPathIndex = ref(0)
let animationFrame: number
let lastTime = 0
const isDestroying = ref(false)
const audioContext = ref<AudioContext | null>(null)
const oscillator = ref<OscillatorNode | null>(null)
const gainNode = ref<GainNode | null>(null)

const HUNTER_SIZE = 40
const COLLISION_DISTANCE = 30
const BASE_SPEED = 3 // Базовая скорость
const MAX_SPEED = 8 // Максимальная скорость
const ACCELERATION = 0.15
const FRICTION = 0.95
const ROTATION_SPEED = 0.1 // Уменьшаем скорость поворота для более плавного движения
const MIN_DISTANCE = 5
const MAX_DISTANCE = 500 // Увеличиваем максимальное расстояние
const PATH_UPDATE_INTERVAL = 100
const PATH_POINT_DISTANCE = 100
const OBSTACLE_CHECK_DISTANCE = 150
const MAX_PATH_POINTS = 3 // Максимальное количество точек пути
const SCREEN_MARGIN = 100 // Отступ от края экрана для проверки видимости
const MAX_ROTATION_CHANGE = 180 // Максимальное изменение угла за один кадр

// Добавляем ref для хранения ссылки на элемент App
const appElementRef = ref<HTMLElement | null>(null)

// Добавляем счетчик уничтожений
const destroyCount = ref(0)

// Вычисляем текущую целевую точку пути
const currentTarget = computed(() => {
  if (pathPoints.value.length === 0) return targetPosition.value
  return pathPoints.value[currentPathIndex.value] || targetPosition.value
})

// Функция для проверки препятствий между двумя точками
const checkObstacle = (start: {x: number, y: number}, end: {x: number, y: number}) => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Проверяем только середину пути для упрощения
  const midX = start.x + dx / 2
  const midY = start.y + dy / 2
  
  const elements = document.elementsFromPoint(midX, midY)
  return elements.some(el => 
    !el.classList.contains('cursor-hunter') && 
    !el.classList.contains('hunter-trail') &&
    window.getComputedStyle(el).pointerEvents !== 'none'
  )
}

// Функция для поиска пути к цели
const findPath = () => {
  const start = position.value
  const end = targetPosition.value
  
  // Всегда используем прямой путь
  pathPoints.value = [end]
  currentPathIndex.value = 0
}

// Функция для получения скролла родительского блока App
const getAppScroll = () => {
  if (appElementRef.value) {
    return {
      x: appElementRef.value.scrollLeft,
      y: appElementRef.value.scrollTop
    }
  }
  return { x: 0, y: 0 }
}

// Функция для получения текущих координат курсора с учетом скролла App
const getMousePosition = (event: MouseEvent) => {
  const appScroll = getAppScroll()
  if (!appElementRef.value) return { x: event.pageX, y: event.pageY }

  // Получаем позицию App относительно viewport
  const appRect = appElementRef.value.getBoundingClientRect()
  
  // Вычисляем координаты относительно App
  return {
    x: event.clientX - appRect.left + appScroll.x,
    y: event.clientY - appRect.top + appScroll.y
  }
}

// Функция для проверки, находится ли охотник на экране
const isOnScreen = computed(() => {
  if (!appElementRef.value) return true

  const appRect = appElementRef.value.getBoundingClientRect()
  const appScroll = getAppScroll()
  
  const screenLeft = appScroll.x - SCREEN_MARGIN
  const screenRight = appScroll.x + appRect.width + SCREEN_MARGIN
  const screenTop = appScroll.y - SCREEN_MARGIN
  const screenBottom = appScroll.y + appRect.height + SCREEN_MARGIN

  return (
    position.value.x >= screenLeft &&
    position.value.x <= screenRight &&
    position.value.y >= screenTop &&
    position.value.y <= screenBottom
  )
})

// Функция для вычисления скорости на основе расстояния
const calculateSpeed = (distance: number) => {
  if (distance > MAX_DISTANCE) {
    return MAX_SPEED
  }
  // Плавное увеличение скорости от BASE_SPEED до MAX_SPEED
  const speedFactor = Math.min(distance / MAX_DISTANCE, 1)
  return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * speedFactor
}

// Функция для нормализации угла в диапазон [-180, 180]
const normalizeAngle = (angle: number): number => {
  angle = angle % 360
  if (angle > 180) angle -= 360
  if (angle < -180) angle += 360
  return angle
}

// Функция для вычисления кратчайшего пути поворота
const calculateShortestRotation = (currentAngle: number, targetAngle: number): number => {
  const diff = normalizeAngle(targetAngle - currentAngle)
  return diff
}

const updatePosition = (timestamp: number) => {
  if (!lastTime) lastTime = timestamp
  const deltaTime = Math.min((timestamp - lastTime) / 16, 2)
  lastTime = timestamp

  // Обновляем путь чаще
  if (timestamp % PATH_UPDATE_INTERVAL < 16) {
    findPath()
  }

  // Вычисляем направление к текущей точке пути с учетом скролла
  const scroll = getAppScroll()
  const dx = currentTarget.value.x - position.value.x
  const dy = currentTarget.value.y - position.value.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Проверяем столкновение с курсором
  isColliding.value = distance < COLLISION_DISTANCE

  // Вычисляем целевой угол
  const targetRotation = Math.atan2(dy, dx) * (180 / Math.PI)
  
  // Плавно поворачиваем к цели
  if (distance > MIN_DISTANCE) {
    const angleDiff = calculateShortestRotation(rotation.value, targetRotation)
    const maxChange = MAX_ROTATION_CHANGE * deltaTime
    const limitedDiff = Math.max(Math.min(angleDiff, maxChange), -maxChange)
    rotation.value = normalizeAngle(rotation.value + limitedDiff * ROTATION_SPEED)
  }

  // Двигаемся только если охотник на экране
  if (isOnScreen.value && distance > MIN_DISTANCE) {
    const currentMaxSpeed = calculateSpeed(distance)
    const currentAngle = rotation.value * (Math.PI / 180)
    const accelerationX = Math.cos(currentAngle) * ACCELERATION * deltaTime
    const accelerationY = Math.sin(currentAngle) * ACCELERATION * deltaTime

    velocity.value.x += accelerationX
    velocity.value.y += accelerationY

    const speed = Math.sqrt(velocity.value.x * velocity.value.x + velocity.value.y * velocity.value.y)
    if (speed > currentMaxSpeed) {
      velocity.value.x = (velocity.value.x / speed) * currentMaxSpeed
      velocity.value.y = (velocity.value.y / speed) * currentMaxSpeed
    }
  } else {
    velocity.value.x *= 0.9
    velocity.value.y *= 0.9
  }

  // Применяем трение
  velocity.value.x *= FRICTION
  velocity.value.y *= FRICTION

  // Останавливаем движение при очень малой скорости
  if (Math.abs(velocity.value.x) < 0.01) velocity.value.x = 0
  if (Math.abs(velocity.value.y) < 0.01) velocity.value.y = 0

  // Обновляем позицию
  position.value.x += velocity.value.x
  position.value.y += velocity.value.y

  // Если охотник вышел за пределы экрана, возвращаем его на экран
  if (!isOnScreen.value) {
    if (appElementRef.value) {
      const appRect = appElementRef.value.getBoundingClientRect()
      const appScroll = getAppScroll()
      
      const centerX = appRect.width / 2 + appScroll.x
      const centerY = appRect.height / 2 + appScroll.y
      
      // Плавно перемещаем охотника к центру App
      position.value.x += (centerX - position.value.x) * 0.1
      position.value.y += (centerY - position.value.y) * 0.1
    }
  }

  // Запускаем следующий кадр
  animationFrame = requestAnimationFrame(updatePosition)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isVisible.value) {
    isVisible.value = true
  }
  
  const mousePos = getMousePosition(event)
  targetPosition.value = mousePos
}

const handleScroll = () => {
  // При скролле обновляем целевую позицию с учетом новых координат скролла App
  if (isVisible.value) {
    const mousePos = getMousePosition(window.event as MouseEvent)
    if (mousePos.x !== 0 && mousePos.y !== 0) {
      targetPosition.value = mousePos
    }
  }
}

const handleResize = () => {
  // Обновляем позицию при изменении размера окна
  if (!isVisible.value) {
    position.value = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }
    targetPosition.value = { ...position.value }
  }
}

// Функция для создания звукового эффекта
const createSound = (frequency: number, duration: number) => {
  if (!audioContext.value) {
    audioContext.value = new AudioContext()
  }

  // Создаем осциллятор
  oscillator.value = audioContext.value.createOscillator()
  gainNode.value = audioContext.value.createGain()

  // Настраиваем осциллятор
  oscillator.value.type = 'sine'
  oscillator.value.frequency.setValueAtTime(frequency, audioContext.value.currentTime)
  oscillator.value.frequency.exponentialRampToValueAtTime(
    frequency * 2,
    audioContext.value.currentTime + duration
  )

  // Настраиваем громкость
  gainNode.value.gain.setValueAtTime(0.1, audioContext.value.currentTime)
  gainNode.value.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.value.currentTime + duration
  )

  // Подключаем узлы
  oscillator.value.connect(gainNode.value)
  gainNode.value.connect(audioContext.value.destination)

  // Запускаем и останавливаем звук
  oscillator.value.start()
  oscillator.value.stop(audioContext.value.currentTime + duration)
}

// Функция для уничтожения охотника
const destroyHunter = () => {
  if (isDestroying.value) return

  isDestroying.value = true
  isVisible.value = false
  destroyCount.value++ // Увеличиваем счетчик

  // Создаем звук уничтожения
  createSound(440, 0.5)

  // Останавливаем текущую анимацию
  cancelAnimationFrame(animationFrame)

  // Через 500мс создаем нового охотника
  setTimeout(() => {
    resetHunter()
    // Перезапускаем анимацию
    animationFrame = requestAnimationFrame(updatePosition)
  }, 500)
}

// Функция для сброса состояния охотника
const resetHunter = () => {
  if (appElementRef.value) {
    const appRect = appElementRef.value.getBoundingClientRect()
    const appScroll = getAppScroll()
    
    // Создаем нового охотника в случайной позиции на экране
    const randomX = Math.random() * appRect.width + appScroll.x
    const randomY = Math.random() * appRect.height + appScroll.y
    
    position.value = { x: randomX, y: randomY }
    targetPosition.value = { x: randomX, y: randomY }
    velocity.value = { x: 0, y: 0 }
    rotation.value = 0
    isDestroying.value = false
    isVisible.value = true
    isColliding.value = false

    // Создаем звук появления
    createSound(880, 0.3) // Ля второй октавы, длительность 0.3 секунды
  }
}

// Обработчик клика по охотнику
const handleHunterClick = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  destroyHunter()
}

onMounted(() => {
  // Сохраняем ссылку на элемент App
  appElementRef.value = document.querySelector('.app') as HTMLElement

  // Устанавливаем начальную позицию с учетом скролла App
  if (appElementRef.value) {
    const appRect = appElementRef.value.getBoundingClientRect()
    const appScroll = getAppScroll()
    
    const centerX = appRect.width / 2 + appScroll.x
    const centerY = appRect.height / 2 + appScroll.y
    
    position.value = { x: centerX, y: centerY }
    targetPosition.value = { x: centerX, y: centerY }
  }
  
  // Запускаем анимацию
  animationFrame = requestAnimationFrame(updatePosition)
  
  // Добавляем слушатели событий
  window.addEventListener('mousemove', handleMouseMove)
  if (appElementRef.value) {
    appElementRef.value.addEventListener('scroll', handleScroll, { passive: true })
  }
  window.addEventListener('resize', handleResize)

  // Инициализируем AudioContext при первом взаимодействии пользователя
  const initAudio = () => {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }
    document.removeEventListener('click', initAudio)
  }
  document.addEventListener('click', initAudio)
})

onUnmounted(() => {
  // Очищаем анимацию и слушатели
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('mousemove', handleMouseMove)
  if (appElementRef.value) {
    appElementRef.value.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('resize', handleResize)
  appElementRef.value = null

  // Очищаем аудио ресурсы
  if (oscillator.value) {
    oscillator.value.stop()
    oscillator.value.disconnect()
  }
  if (gainNode.value) {
    gainNode.value.disconnect()
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
})
</script>

<style lang="scss" scoped>
.hunter-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.hunter-counter {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #ff0000;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: bold;
  z-index: 10000;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
  border: 2px solid rgba(255, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  animation: counter-pulse 2s infinite;
  pointer-events: auto;

  &::before {
    content: '🎯';
    margin-right: 8px;
  }
}

.cursor-hunter {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  transform: 
    translate(-50%, -50%)
    rotate(calc(var(--rotation) + 90deg))
    scale(var(--scale));
  pointer-events: auto;
  z-index: 9999;
  transition: 
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
  will-change: transform, opacity;
  cursor: pointer;

  &.colliding {
    animation: collision 0.3s ease-out;
  }

  &.hunting {
    .hunter-body {
      animation: pulse 1s infinite;
    }
    .hunter-trail {
      opacity: 0.8;
    }
  }

  &:not(.on-screen) {
    opacity: 0.5;
  }

  &.destroying {
    animation: destroy 0.5s ease-out forwards;
  }
}

.hunter-body {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, #ff6b6b, #ff0000);
  border-radius: 50%;
  box-shadow: 
    0 0 30px rgba(255, 0, 0, 0.5),
    inset 0 0 20px rgba(255, 255, 255, 0.4);
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    inset: -10%;
    background: radial-gradient(circle at 70% 70%, #ff0000, transparent);
    opacity: 0.6;
    filter: blur(5px);
    animation: glow 2s infinite alternate;
  }
}

.hunter-core {
  position: absolute;
  inset: 20%;
  background: radial-gradient(circle at center, #fff, #ff6b6b);
  border-radius: 50%;
  filter: blur(2px);
  animation: core-pulse 2s infinite;
}

.hunter-eye {
  position: absolute;
  width: 25%;
  height: 25%;
  background: #fff;
  border-radius: 50%;
  top: 30%;
  box-shadow: 
    inset 0 0 10px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(255, 255, 255, 0.5);
  overflow: hidden;

  &.left {
    left: 25%;
  }

  &.right {
    right: 25%;
  }

  .pupil {
    position: absolute;
    width: 50%;
    height: 50%;
    background: #000;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pupil-move 3s infinite alternate;
  }

  .glow {
    position: absolute;
    inset: -50%;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8), transparent);
    opacity: 0.5;
    animation: eye-glow 2s infinite alternate;
  }
}

.hunter-mouth {
  position: absolute;
  width: 40%;
  height: 20%;
  background: #000;
  border-radius: 0 0 50% 50%;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  transition: height 0.2s ease;

  .teeth {
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(45deg, transparent 48%, #fff 49%, #fff 51%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, #fff 49%, #fff 51%, transparent 52%);
    background-size: 20% 20%;
    opacity: 0.3;
  }

  .colliding & {
    height: 30%;
    animation: mouth-open 0.3s ease-out;
  }
}

.hunter-aura {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle, rgba(255, 0, 0, 0.2), transparent 70%);
  filter: blur(10px);
  animation: aura-pulse 2s infinite;
}

.hunter-trail {
  position: absolute;
  inset: -30%;
  background: radial-gradient(circle, rgba(255, 0, 0, 0.15), transparent 70%);
  filter: blur(15px);
  opacity: 0.5;
  animation: trail 1s infinite;
  transform-origin: center;
}

.hunter-particles {
  position: absolute;
  inset: -50%;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: #ff0000;
    border-radius: 50%;
    animation: particle-float 2s infinite;
  }

  &::before {
    left: 20%;
    top: 20%;
    animation-delay: -0.5s;
  }

  &::after {
    right: 20%;
    bottom: 20%;
    animation-delay: -1s;
  }
}

@keyframes collision {
  0% { transform: translate(-50%, -50%) rotate(calc(var(--rotation) + 90deg)) scale(1.2); }
  50% { transform: translate(-50%, -50%) rotate(calc(var(--rotation) + 90deg)) scale(0.8); }
  100% { transform: translate(-50%, -50%) rotate(calc(var(--rotation) + 90deg)) scale(1); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes glow {
  0% { opacity: 0.3; filter: blur(5px); }
  100% { opacity: 0.6; filter: blur(8px); }
}

@keyframes core-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes pupil-move {
  0% { transform: translate(-50%, -50%) translate(20%, 0); }
  100% { transform: translate(-50%, -50%) translate(-20%, 0); }
}

@keyframes eye-glow {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.6; transform: scale(1.2); }
}

@keyframes mouth-open {
  0% { height: 20%; }
  50% { height: 35%; }
  100% { height: 30%; }
}

@keyframes aura-pulse {
  0% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.1); }
  100% { opacity: 0.2; transform: scale(1); }
}

@keyframes trail {
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
  100% { opacity: 0.3; transform: scale(1); }
}

@keyframes particle-float {
  0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
  50% { transform: translate(10px, -10px) scale(1.5); opacity: 0.4; }
  100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
}

@keyframes destroy {
  0% { 
    transform: translate(-50%, -50%) rotate(calc(var(--rotation) + 90deg)) scale(1);
    opacity: 1;
  }
  50% { 
    transform: translate(-50%, -50%) rotate(calc(var(--rotation) + 90deg)) scale(1.5);
    opacity: 0.5;
  }
  100% { 
    transform: translate(-50%, -50%) rotate(calc(var(--rotation) + 90deg)) scale(0);
    opacity: 0;
  }
}

@keyframes counter-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style> 