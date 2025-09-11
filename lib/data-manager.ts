interface ChartData {
  [key: string]: any
}

// 支持关系图的特殊数据格式
interface NetworkData {
  nodes: any[]
  links: any[]
}

// 支持3D模型的数据格式
interface ThreeDModelData {
  modelUrl?: string
  environmentPreset?: string
  ambientIntensity?: number
  ambientColor?: string
  directionalIntensity?: number
  directionalColor?: string
}

type ChartDataType = ChartData[] | NetworkData | ThreeDModelData

class DataManager {
  private chartData: Map<string, ChartDataType>

  constructor() {
    this.chartData = new Map()
  }

  bindChartToData(chartId: string, data: ChartDataType) {
    try {
      console.log(`[DataManager] 绑定数据到图表 ${chartId}:`, data)
      
      // 检查数据格式：可以是数组、关系图对象格式或3D模型数据格式
      if (!Array.isArray(data) && !this.isNetworkData(data) && !this.isThreeDModelData(data)) {
        console.error('Invalid data format: data must be an array, network data object, or 3D model data object')
        return
      }

      // 深拷贝数据以防止外部修改
      const dataCopy = JSON.parse(JSON.stringify(data))
      this.chartData.set(chartId, dataCopy)

      // 触发更新事件
      this.notifyDataChange(chartId)
      console.log(`[DataManager] 数据绑定成功: ${chartId}`)
    } catch (error) {
      console.error('Error binding data to chart:', error)
    }
  }

  private isNetworkData(data: any): data is NetworkData {
    return data && typeof data === 'object' && 
           Array.isArray(data.nodes) && 
           Array.isArray(data.links)
  }

  private isThreeDModelData(data: any): data is ThreeDModelData {
    return data && typeof data === 'object' && 
           (typeof data.modelUrl === 'string' || typeof data.modelUrl === 'undefined')
  }



  getChartData(chartId: string): ChartDataType {
    try {
      const data = this.chartData.get(chartId)
      console.log(`[DataManager] 获取图表 ${chartId} 数据:`, data)
      return data ? JSON.parse(JSON.stringify(data)) : []
    } catch (error) {
      console.error('Error getting chart data:', error)
      return []
    }
  }

  private notifyDataChange(chartId: string) {
    // 这里可以添加数据变化的事件通知
    console.log(`[DataManager] Data changed for chart: ${chartId}`)
  }

  clearChartData(chartId: string) {
    this.chartData.delete(chartId)
  }

  clearAllData() {
    this.chartData.clear()
  }
}

// 导出单例实例
export const dataManager = new DataManager()