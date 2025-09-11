export interface SnapGuide {
  type: 'horizontal' | 'vertical' | 'center' | 'edge'
  position: number
  elementId?: string
  color?: string
  edgeType?: 'left' | 'right' | 'top' | 'bottom' | 'center'
}

export interface SnapResult {
  x: number
  y: number
  guides: SnapGuide[]
}

export interface CanvasElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
}

export interface SnapOptions {
  snapThreshold?: number
  showCenterGuides?: boolean
  showEdgeGuides?: boolean
  showDistributionGuides?: boolean
  showSpacingGuides?: boolean
  showGridGuides?: boolean
  gridSize?: number
  marginGuides?: boolean
  marginSize?: number
  canvasEdgeSnap?: boolean
  canvasEdgeThreshold?: number
}

const DEFAULT_SNAP_THRESHOLD = 8
const DEFAULT_CANVAS_EDGE_THRESHOLD = 15
const GUIDE_COLORS = {
  edge: '#ff4444',
  center: '#44aaff',
  distribution: '#44ff44',
  spacing: '#ffaa44',
  grid: '#aaaaaa',
  margin: '#ff44ff',
  canvasEdge: '#ff8800'
}

export function calculateSnapPosition(
  movingElement: CanvasElement,
  allElements: CanvasElement[],
  canvasWidth: number = 2000,
  canvasHeight: number = 2000,
  options: SnapOptions = {}
): SnapResult {
  const {
    snapThreshold = DEFAULT_SNAP_THRESHOLD,
    showCenterGuides = true,
    showEdgeGuides = true,
    showDistributionGuides = true,
    showSpacingGuides = true,
    showGridGuides = true,
    gridSize = 20,
    marginGuides = true,
    marginSize = 20,
    canvasEdgeSnap = true,
    canvasEdgeThreshold = DEFAULT_CANVAS_EDGE_THRESHOLD
  } = options

  const guides: SnapGuide[] = []
  let snappedX = movingElement.x
  let snappedY = movingElement.y

  const otherElements = allElements.filter(el => el.id !== movingElement.id)
  
  // Canvas edge snapping (新增的画布边缘磁吸功能)
  if (canvasEdgeSnap) {
    const elementLeft = movingElement.x
    const elementRight = movingElement.x + movingElement.width
    const elementTop = movingElement.y
    const elementBottom = movingElement.y + movingElement.height
    const elementCenterX = movingElement.x + movingElement.width / 2
    const elementCenterY = movingElement.y + movingElement.height / 2

    // 左边缘磁吸
    if (Math.abs(elementLeft - 0) <= canvasEdgeThreshold) {
      snappedX = 0
      guides.push({
        type: 'vertical',
        position: 0,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'left'
      })
    }

    // 右边缘磁吸
    if (Math.abs(elementRight - canvasWidth) <= canvasEdgeThreshold) {
      snappedX = canvasWidth - movingElement.width
      guides.push({
        type: 'vertical',
        position: canvasWidth,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'right'
      })
    }

    // 上边缘磁吸
    if (Math.abs(elementTop - 0) <= canvasEdgeThreshold) {
      snappedY = 0
      guides.push({
        type: 'horizontal',
        position: 0,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'top'
      })
    }

    // 下边缘磁吸
    if (Math.abs(elementBottom - canvasHeight) <= canvasEdgeThreshold) {
      snappedY = canvasHeight - movingElement.height
      guides.push({
        type: 'horizontal',
        position: canvasHeight,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'bottom'
      })
    }

    // 画布中心线磁吸
    const canvasCenterX = canvasWidth / 2
    const canvasCenterY = canvasHeight / 2

    if (Math.abs(elementCenterX - canvasCenterX) <= canvasEdgeThreshold) {
      snappedX = canvasCenterX - movingElement.width / 2
      guides.push({
        type: 'vertical',
        position: canvasCenterX,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'center'
      })
    }

    if (Math.abs(elementCenterY - canvasCenterY) <= canvasEdgeThreshold) {
      snappedY = canvasCenterY - movingElement.height / 2
      guides.push({
        type: 'horizontal',
        position: canvasCenterY,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'center'
      })
    }

    // 四分之一线磁吸
    const quarterX1 = canvasWidth / 4
    const quarterX3 = (canvasWidth * 3) / 4
    const quarterY1 = canvasHeight / 4
    const quarterY3 = (canvasHeight * 3) / 4

    if (Math.abs(elementCenterX - quarterX1) <= canvasEdgeThreshold) {
      snappedX = quarterX1 - movingElement.width / 2
      guides.push({
        type: 'vertical',
        position: quarterX1,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'center'
      })
    }

    if (Math.abs(elementCenterX - quarterX3) <= canvasEdgeThreshold) {
      snappedX = quarterX3 - movingElement.width / 2
      guides.push({
        type: 'vertical',
        position: quarterX3,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'center'
      })
    }

    if (Math.abs(elementCenterY - quarterY1) <= canvasEdgeThreshold) {
      snappedY = quarterY1 - movingElement.height / 2
      guides.push({
        type: 'horizontal',
        position: quarterY1,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'center'
      })
    }

    if (Math.abs(elementCenterY - quarterY3) <= canvasEdgeThreshold) {
      snappedY = quarterY3 - movingElement.height / 2
      guides.push({
        type: 'horizontal',
        position: quarterY3,
        color: GUIDE_COLORS.canvasEdge,
        edgeType: 'center'
      })
    }
  }
  
  // Grid snapping
  if (showGridGuides) {
    const gridSnapX = Math.round(movingElement.x / gridSize) * gridSize
    const gridSnapY = Math.round(movingElement.y / gridSize) * gridSize
    
    if (Math.abs(movingElement.x - gridSnapX) <= snapThreshold) {
      snappedX = gridSnapX
      guides.push({
        type: 'vertical',
        position: gridSnapX,
        color: GUIDE_COLORS.grid
      })
    }
    
    if (Math.abs(movingElement.y - gridSnapY) <= snapThreshold) {
      snappedY = gridSnapY
      guides.push({
        type: 'horizontal',
        position: gridSnapY,
        color: GUIDE_COLORS.grid
      })
    }
  }

  // Margin guides
  if (marginGuides) {
    // Left margin
    if (Math.abs(movingElement.x - marginSize) <= snapThreshold) {
      snappedX = marginSize
      guides.push({
        type: 'vertical',
        position: marginSize,
        color: GUIDE_COLORS.margin
      })
    }
    
    // Right margin
    if (Math.abs(movingElement.x + movingElement.width - (canvasWidth - marginSize)) <= snapThreshold) {
      snappedX = canvasWidth - marginSize - movingElement.width
      guides.push({
        type: 'vertical',
        position: canvasWidth - marginSize,
        color: GUIDE_COLORS.margin
      })
    }
    
    // Top margin
    if (Math.abs(movingElement.y - marginSize) <= snapThreshold) {
      snappedY = marginSize
      guides.push({
        type: 'horizontal',
        position: marginSize,
        color: GUIDE_COLORS.margin
      })
    }
    
    // Bottom margin
    if (Math.abs(movingElement.y + movingElement.height - (canvasHeight - marginSize)) <= snapThreshold) {
      snappedY = canvasHeight - marginSize - movingElement.height
      guides.push({
        type: 'horizontal',
        position: canvasHeight - marginSize,
        color: GUIDE_COLORS.margin
      })
    }
  }

  // Calculate element edges and center
  const movingLeft = movingElement.x
  const movingRight = movingElement.x + movingElement.width
  const movingTop = movingElement.y
  const movingBottom = movingElement.y + movingElement.height
  const movingCenterX = movingElement.x + movingElement.width / 2
  const movingCenterY = movingElement.y + movingElement.height / 2

  // Canvas center and edges
  const canvasCenterX = canvasWidth / 2
  const canvasCenterY = canvasHeight / 2

  // Check canvas center snap
  if (showCenterGuides) {
    if (Math.abs(movingCenterX - canvasCenterX) <= snapThreshold) {
      snappedX = canvasCenterX - movingElement.width / 2
      guides.push({
        type: 'vertical',
        position: canvasCenterX,
        color: GUIDE_COLORS.center
      })
    }

    if (Math.abs(movingCenterY - canvasCenterY) <= snapThreshold) {
      snappedY = canvasCenterY - movingElement.height / 2
      guides.push({
        type: 'horizontal',
        position: canvasCenterY,
        color: GUIDE_COLORS.center
      })
    }
  }

  // Check other elements for edge and center snapping
  for (const element of otherElements) {
    const elementLeft = element.x
    const elementRight = element.x + element.width
    const elementTop = element.y
    const elementBottom = element.y + element.height
    const elementCenterX = element.x + element.width / 2
    const elementCenterY = element.y + element.height / 2

    if (showEdgeGuides) {
      // Horizontal edge snapping
      if (Math.abs(movingTop - elementTop) <= snapThreshold) {
        snappedY = elementTop
        guides.push({
          type: 'horizontal',
          position: elementTop,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }
      if (Math.abs(movingBottom - elementBottom) <= snapThreshold) {
        snappedY = elementBottom - movingElement.height
        guides.push({
          type: 'horizontal',
          position: elementBottom,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }
      if (Math.abs(movingTop - elementBottom) <= snapThreshold) {
        snappedY = elementBottom
        guides.push({
          type: 'horizontal',
          position: elementBottom,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }
      if (Math.abs(movingBottom - elementTop) <= snapThreshold) {
        snappedY = elementTop - movingElement.height
        guides.push({
          type: 'horizontal',
          position: elementTop,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }

      // Vertical edge snapping
      if (Math.abs(movingLeft - elementLeft) <= snapThreshold) {
        snappedX = elementLeft
        guides.push({
          type: 'vertical',
          position: elementLeft,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }
      if (Math.abs(movingRight - elementRight) <= snapThreshold) {
        snappedX = elementRight - movingElement.width
        guides.push({
          type: 'vertical',
          position: elementRight,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }
      if (Math.abs(movingLeft - elementRight) <= snapThreshold) {
        snappedX = elementRight
        guides.push({
          type: 'vertical',
          position: elementRight,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }
      if (Math.abs(movingRight - elementLeft) <= snapThreshold) {
        snappedX = elementLeft - movingElement.width
        guides.push({
          type: 'vertical',
          position: elementLeft,
          elementId: element.id,
          color: GUIDE_COLORS.edge
        })
      }
    }

    if (showCenterGuides) {
      // Center snapping
      if (Math.abs(movingCenterX - elementCenterX) <= snapThreshold) {
        snappedX = elementCenterX - movingElement.width / 2
        guides.push({
          type: 'vertical',
          position: elementCenterX,
          elementId: element.id,
          color: GUIDE_COLORS.center
        })
      }
      if (Math.abs(movingCenterY - elementCenterY) <= snapThreshold) {
        snappedY = elementCenterY - movingElement.height / 2
        guides.push({
          type: 'horizontal',
          position: elementCenterY,
          elementId: element.id,
          color: GUIDE_COLORS.center
        })
      }
    }

    // Spacing guides
    if (showSpacingGuides) {
      // Horizontal spacing
      const horizontalGap = Math.abs(movingLeft - elementRight)
      const horizontalGap2 = Math.abs(elementLeft - movingRight)
      
      for (const otherElement of otherElements) {
        if (otherElement.id === element.id) continue
        
        const otherRight = otherElement.x + otherElement.width
        const gap1 = Math.abs(otherRight - elementLeft)
        const gap2 = Math.abs(elementRight - otherElement.x)
        
        if (Math.abs(horizontalGap - gap1) <= snapThreshold) {
          snappedX = elementRight + gap1
          guides.push({
            type: 'vertical',
            position: elementRight,
            elementId: element.id,
            color: GUIDE_COLORS.spacing
          })
          guides.push({
            type: 'vertical',
            position: snappedX,
            color: GUIDE_COLORS.spacing
          })
        }
        
        if (Math.abs(horizontalGap2 - gap2) <= snapThreshold) {
          snappedX = elementLeft - movingElement.width - gap2
          guides.push({
            type: 'vertical',
            position: elementLeft,
            elementId: element.id,
            color: GUIDE_COLORS.spacing
          })
          guides.push({
            type: 'vertical',
            position: snappedX + movingElement.width,
            color: GUIDE_COLORS.spacing
          })
        }
      }

      // Vertical spacing
      const verticalGap = Math.abs(movingTop - elementBottom)
      const verticalGap2 = Math.abs(elementTop - movingBottom)
      
      for (const otherElement of otherElements) {
        if (otherElement.id === element.id) continue
        
        const otherBottom = otherElement.y + otherElement.height
        const gap1 = Math.abs(otherBottom - elementTop)
        const gap2 = Math.abs(elementBottom - otherElement.y)
        
        if (Math.abs(verticalGap - gap1) <= snapThreshold) {
          snappedY = elementBottom + gap1
          guides.push({
            type: 'horizontal',
            position: elementBottom,
            elementId: element.id,
            color: GUIDE_COLORS.spacing
          })
          guides.push({
            type: 'horizontal',
            position: snappedY,
            color: GUIDE_COLORS.spacing
          })
        }
        
        if (Math.abs(verticalGap2 - gap2) <= snapThreshold) {
          snappedY = elementTop - movingElement.height - gap2
          guides.push({
            type: 'horizontal',
            position: elementTop,
            elementId: element.id,
            color: GUIDE_COLORS.spacing
          })
          guides.push({
            type: 'horizontal',
            position: snappedY + movingElement.height,
            color: GUIDE_COLORS.spacing
          })
        }
      }
    }
  }

  return { x: snappedX, y: snappedY, guides }
}

export function calculateEvenDistribution(
  selectedElements: CanvasElement[],
  direction: 'horizontal' | 'vertical' = 'horizontal'
): { positions: Array<{ x: number, y: number }>, guides: SnapGuide[] } {
  if (selectedElements.length < 3) {
    return { positions: selectedElements.map(el => ({ x: el.x, y: el.y })), guides: [] }
  }

  const guides: SnapGuide[] = []
  const positions: Array<{ x: number, y: number }> = []

  if (direction === 'horizontal') {
    // Sort by x position
    const sortedElements = [...selectedElements].sort((a, b) => a.x - b.x)
    const totalWidth = sortedElements[sortedElements.length - 1].x + sortedElements[sortedElements.length - 1].width - sortedElements[0].x
    const totalElementsWidth = sortedElements.reduce((sum, el) => sum + el.width, 0)
    const availableSpace = totalWidth - totalElementsWidth
    const spacing = availableSpace / (sortedElements.length - 1)

    let currentX = sortedElements[0].x
    for (let i = 0; i < sortedElements.length; i++) {
      positions.push({ x: currentX, y: sortedElements[i].y })
      
      if (i < sortedElements.length - 1) {
        currentX += sortedElements[i].width + spacing
        
        // Add distribution guide
        guides.push({
          type: 'vertical',
          position: currentX - sortedElements[i + 1].width / 2,
          color: GUIDE_COLORS.distribution
        })
      }
    }
  } else {
    // Sort by y position
    const sortedElements = [...selectedElements].sort((a, b) => a.y - b.y)
    const totalHeight = sortedElements[sortedElements.length - 1].y + sortedElements[sortedElements.length - 1].height - sortedElements[0].y
    const totalElementsHeight = sortedElements.reduce((sum, el) => sum + el.height, 0)
    const availableSpace = totalHeight - totalElementsHeight
    const spacing = availableSpace / (sortedElements.length - 1)

    let currentY = sortedElements[0].y
    for (let i = 0; i < sortedElements.length; i++) {
      positions.push({ x: sortedElements[i].x, y: currentY })
      
      if (i < sortedElements.length - 1) {
        currentY += sortedElements[i].height + spacing
        
        // Add distribution guide
        guides.push({
          type: 'horizontal',
          position: currentY - sortedElements[i + 1].height / 2,
          color: GUIDE_COLORS.distribution
        })
      }
    }
  }

  return { positions, guides }
}

export function shouldShowDistribution(
  selectedElements: CanvasElement[],
  movingElement: CanvasElement
): boolean {
  if (selectedElements.length < 3) return false
  
  // Check if all selected elements are of the same type
  const types = new Set(selectedElements.map(el => el.type))
  if (types.size > 1) return false
  
  // Check if moving element is part of the selection
  return selectedElements.some(el => el.id === movingElement.id)
}
