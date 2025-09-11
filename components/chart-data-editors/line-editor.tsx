"use client"

import { useState } from "react"
import { BaseEditor, DataItem, Field } from "./base-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface LineChartData extends DataItem {
  name: string
  value: number
  value2?: number
  value3?: number
  value4?: number
  value5?: number
}

interface LineEditorProps {
  data: LineChartData[]
  onChange: (data: LineChartData[]) => void
}

export function LineEditor({ data = [], onChange }: LineEditorProps) {
  const [seriesCount, setSeriesCount] = useState(3) // 默认3个系列

  // 根据系列数量动态生成字段配置
  const getFields = (): Field[] => {
    const fields: Field[] = [
      {
        name: "name",
        label: "时间/类别",
        type: "text",
        required: true,
        placeholder: "例如：2024-01、一月..."
      }
    ]

    // 添加数值字段
    for (let i = 1; i <= seriesCount; i++) {
      const fieldName = i === 1 ? "value" : `value${i}`
      const fieldLabel = i === 1 ? "系列1" : `系列${i}`
      
      fields.push({
        name: fieldName,
        label: fieldLabel,
        type: "number",
        required: true,
        placeholder: "请输入数值"
      })
    }

    return fields
  }

  const handleAddSeries = () => {
    if (seriesCount < 5) {
      setSeriesCount(seriesCount + 1)
      
      // 为现有数据添加新系列字段
      const updatedData = data.map(item => ({
        ...item,
        [`value${seriesCount + 1}`]: 0
      }))
      onChange(updatedData)
    }
  }

  const handleRemoveSeries = () => {
    if (seriesCount > 1) {
      setSeriesCount(seriesCount - 1)
      
      // 移除最后一个系列字段
      const updatedData = data.map(item => {
        const newItem = { ...item }
        delete newItem[`value${seriesCount}`]
        return newItem
      })
      onChange(updatedData)
    }
  }

  const handleAddSampleData = () => {
    const sampleData: LineChartData[] = [
      { name: "2024-01", value: 2000, value2: 1500, value3: 1000 },
      { name: "2024-02", value: 1800, value2: 1200, value3: 800 },
      { name: "2024-03", value: 2200, value2: 1800, value3: 1200 },
      { name: "2024-04", value: 1600, value2: 1000, value3: 600 },
      { name: "2024-05", value: 1400, value2: 900, value3: 500 },
      { name: "2024-06", value: 1900, value2: 1400, value3: 900 },
    ]

    // 为新系列添加默认值
    for (let i = 4; i <= seriesCount; i++) {
      sampleData.forEach(item => {
        item[`value${i}`] = Math.floor(Math.random() * 1500) + 500
      })
    }

    onChange(sampleData)
  }

  const handleAddTimeSeriesData = () => {
    const timeSeriesData: LineChartData[] = []
    const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    
    months.forEach((month, index) => {
      const item: LineChartData = { name: month }
      
      for (let i = 1; i <= seriesCount; i++) {
        const fieldName = i === 1 ? "value" : `value${i}`
        // 生成一些有趋势的数据
        const baseValue = 1000 + Math.sin(index * 0.5) * 500
        const randomVariation = (Math.random() - 0.5) * 200
        item[fieldName] = Math.max(0, Math.floor(baseValue + randomVariation))
      }
      
      timeSeriesData.push(item)
    })

    onChange(timeSeriesData)
  }

  const handleClearData = () => {
    onChange([])
  }

  return (
    <div className="space-y-6">
      {/* 系列管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">系列管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">系列数量:</Label>
              <span className="text-sm font-medium">{seriesCount}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSeries}
              disabled={seriesCount >= 5}
            >
              <Plus className="w-4 h-4 mr-1" />
              添加系列
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveSeries}
              disabled={seriesCount <= 1}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              移除系列
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">数据操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSampleData}
            >
              添加示例数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTimeSeriesData}
            >
              添加时间序列数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
            >
              清空数据
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据编辑器 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">数据编辑</CardTitle>
        </CardHeader>
        <CardContent>
          <BaseEditor
            data={data}
            onChange={onChange}
            fields={getFields()}
          />
        </CardContent>
      </Card>
    </div>
  )
}
