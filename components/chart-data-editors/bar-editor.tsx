"use client"

import { useState } from "react"
import { BaseEditor, DataItem, Field } from "./base-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface BarChartData extends DataItem {
  name: string
  value: number
  value2?: number
  value3?: number
  value4?: number
  value5?: number
}

interface BarEditorProps {
  data: BarChartData[]
  onChange: (data: BarChartData[]) => void
}

export function BarEditor({ data = [], onChange }: BarEditorProps) {
  const [seriesCount, setSeriesCount] = useState(2) // 默认2个系列

  // 根据系列数量动态生成字段配置
  const getFields = (): Field[] => {
    const fields: Field[] = [
      {
        name: "name",
        label: "类别名称",
        type: "text",
        required: true,
        placeholder: "例如：一月、二月..."
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
        min: 0,
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
    const sampleData: BarChartData[] = [
      { name: "一月", value: 600, value2: 800 },
      { name: "二月", value: 550, value2: 650 },
      { name: "三月", value: 700, value2: 400 },
      { name: "四月", value: 500, value2: 300 },
      { name: "五月", value: 400, value2: 200 },
    ]

    // 为新系列添加默认值
    for (let i = 3; i <= seriesCount; i++) {
      sampleData.forEach(item => {
        item[`value${i}`] = Math.floor(Math.random() * 500) + 100
      })
    }

    onChange(sampleData)
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
