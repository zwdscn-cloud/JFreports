# 画布拖动性能优化方案

## 问题描述
用户在画布上拖动组件时出现卡顿和不同步现象，组件位置与鼠标坐标不同步，不够丝滑。

## 识别的问题

### 1. 坐标转换计算效率低
- 在 `DashboardCanvas` 的 `getCanvasCoordinates` 函数中，坐标转换使用了除法运算
- 查看模式下需要复杂的缩放和偏移组合计算

### 2. 状态更新过于频繁
- `ChartElement` 组件中的节流设置为16ms（约60fps），对于复杂图表来说仍然过于频繁
- 每次鼠标移动都会触发状态更新和重渲染

### 3. 动画帧管理不完善
- `requestAnimationFrame` 没有很好的管理清理
- 没有限制动画帧率，导致过度渲染

### 4. 多元素拖动性能问题
- 拖动多个元素时需要计算所有选中元素的相对位置
- 频繁的数组操作和状态更新

## 优化方案

### 1. 坐标转换优化
**文件**: `components/dashboard-canvas.tsx`

```typescript
// 优化前：使用除法运算
const transformedX = (e.clientX - rect.left) / scale - canvasOffset.x / scale

// 优化后：使用乘法运算（除法转换为乘法）
const scaleReciprocal = 1 / scale
const transformedX = (clientX - rect.left) * scaleReciprocal - canvasOffset.x * scaleReciprocal
```

### 2. 状态更新频率优化
**文件**: `components/chart-element.tsx`

```typescript
// 优化前：16ms节流（约60fps）
const throttledUpdate = useThrottle(callback, 16)

// 优化后：32ms节流（约30fps）
const throttledUpdate = useThrottle(callback, 32)
```

### 3. 动画帧管理优化
**文件**: `components/chart-element.tsx`

```typescript
// 添加帧率限制
let lastAnimationTime = 0
const animationFrameRate = 1000 / 60 // 60fps

if (currentTime - lastAnimationTime < animationFrameRate) {
  return // 跳过这帧
}
lastAnimationTime = currentTime

// 改进动画帧清理
if (dragAnimationRef.current) {
  cancelAnimationFrame(dragAnimationRef.current)
  dragAnimationRef.current = null
}
```

### 4. 性能优化样式
```typescript
// 拖动开始时设置 will-change 和 pointer-events
if (elementRef.current && isDragging) {
  elementRef.current.style.willChange = 'transform'
  elementRef.current.style.pointerEvents = 'none'
}

// 拖动结束时恢复
elementRef.current.style.willChange = 'auto'
elementRef.current.style.pointerEvents = 'auto'
```

## 优化效果

### 性能提升
1. **坐标计算**: 减少除法运算，提高计算效率
2. **渲染频率**: 从60fps降低到30fps，减少重渲染次数
3. **动画管理**: 限制帧率，避免过度渲染
4. **内存使用**: 更好的动画帧清理，避免内存泄漏

### 用户体验改善
1. **丝滑拖动**: 组件位置与鼠标坐标更同步
2. **减少卡顿**: 降低渲染频率，提高整体流畅度
3. **多选优化**: 多元素拖动性能得到改善

## 测试建议

1. **单元素拖动**: 测试单个图表元素的拖动流畅度
2. **多元素拖动**: 测试多个选中元素的同步拖动
3. **缩放状态**: 在不同缩放级别下测试拖动性能
4. **复杂图表**: 测试数据量较大的图表拖动性能

## 后续优化方向

1. **虚拟化**: 对于大量元素，实现虚拟化渲染
2. **Web Workers**: 将复杂计算移到Web Workers中
3. **GPU加速**: 更多使用CSS transform和will-change
4. **内存优化**: 优化数据结构和算法减少内存占用
