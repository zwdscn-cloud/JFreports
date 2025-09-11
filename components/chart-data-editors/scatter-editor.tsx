"use client"

import { useState } from "react"
import { BaseEditor, DataItem, Field } from "./base-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface ScatterChartData extends DataItem {
  x: number
  y: number
  z?: number
  name?: string
}

interface ScatterEditorProps {
  data: ScatterChartData[]
  onChange: (data: ScatterChartData[]) => void
}

export function ScatterEditor({ data = [], onChange }: ScatterEditorProps) {
  const [includeZ, setIncludeZ] = useState(true)
  const [includeName, setIncludeName] = useState(false)

  // 根据配置动态生成字段
  const getFields = (): Field[] => {
    const fields: Field[] = [
      {
        name: "x",
        label: "X轴值",
        type: "number",
        required: true,
        placeholder: "请输入X轴数值"
      },
      {
        name: "y",
        label: "Y轴值",
        type: "number",
        required: true,
        placeholder: "请输入Y轴数值"
      }
    ]

    if (includeZ) {
      fields.push({
        name: "z",
        label: "Z轴值（气泡大小）",
        type: "number",
        required: false,
        min: 0,
        placeholder: "可选，用于控制气泡大小"
      })
    }

    if (includeName) {
      fields.unshift({
        name: "name",
        label: "数据点名称",
        type: "text",
        required: false,
        placeholder: "可选，用于标识数据点"
      })
    }

    return fields
  }

  const handleAddSampleData = () => {
    const sampleData: ScatterChartData[] = [
      { x: 10, y: 30, z: 200 },
      { x: 20, y: 50, z: 400 },
      { x: 30, y: 40, z: 300 },
      { x: 40, y: 60, z: 500 },
      { x: 50, y: 45, z: 350 },
      { x: 60, y: 70, z: 600 },
      { x: 70, y: 35, z: 250 },
      { x: 80, y: 80, z: 700 },
    ]
    onChange(sampleData)
  }

  const handleAddRandomData = () => {
    const randomData: ScatterChartData[] = []
    const count = 20
    
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 100)
      const y = Math.floor(Math.random() * 100)
      const z = includeZ ? Math.floor(Math.random() * 500) + 50 : undefined
      const name = includeName ? `点${i + 1}` : undefined
      
      randomData.push({ x, y, z, name })
    }
    
    onChange(randomData)
  }

  const handleAddCorrelationData = () => {
    const correlationData: ScatterChartData[] = []
    const count = 30
    
    for (let i = 0; i < count; i++) {
      const x = i * 3 + Math.random() * 10
      const y = x * 0.8 + (Math.random() - 0.5) * 20
      const z = includeZ ? Math.floor(Math.random() * 300) + 100 : undefined
      const name = includeName ? `点${i + 1}` : undefined
      
      correlationData.push({ x, y, z, name })
    }
    
    onChange(correlationData)
  }

  const handleAddClustersData = () => {
    const clustersData: ScatterChartData[] = []
    
    // 第一个聚类
    for (let i = 0; i < 10; i++) {
      const x = 20 + Math.random() * 20
      const y = 20 + Math.random() * 20
      const z = includeZ ? Math.floor(Math.random() * 200) + 50 : undefined
      const name = includeName ? `聚类1-${i + 1}` : undefined
      clustersData.push({ x, y, z, name })
    }
    
    // 第二个聚类
    for (let i = 0; i < 10; i++) {
      const x = 60 + Math.random() * 20
      const y = 60 + Math.random() * 20
      const z = includeZ ? Math.floor(Math.random() * 200) + 50 : undefined
      const name = includeName ? `聚类2-${i + 1}` : undefined
      clustersData.push({ x, y, z, name })
    }
    
    // 第三个聚类
    for (let i = 0; i < 10; i++) {
      const x = 40 + Math.random() * 20
      const y = 80 + Math.random() * 20
      const z = includeZ ? Math.floor(Math.random() * 200) + 50 : undefined
      const name = includeName ? `聚类3-${i + 1}` : undefined
      clustersData.push({ x, y, z, name })
    }
    
    onChange(clustersData)
  }

  const handleClearData = () => {
    onChange([])
  }

  const handleToggleZ = () => {
    setIncludeZ(!includeZ)
    if (!includeZ) {
      // 添加Z轴时，为现有数据添加默认Z值
      const updatedData = data.map(item => ({
        ...item,
        z: item.z || Math.floor(Math.random() * 300) + 100
      }))
      onChange(updatedData)
    } else {
      // 移除Z轴时，删除Z值
      const updatedData = data.map(item => {
        const newItem = { ...item }
        delete newItem.z
        return newItem
      })
      onChange(updatedData)
    }
  }

  const handleToggleName = () => {
    setIncludeName(!includeName)
    if (!includeName) {
      // 添加名称时，为现有数据添加默认名称
      const updatedData = data.map((item, index) => ({
        ...item,
        name: item.name || `点${index + 1}`
      }))
      onChange(updatedData)
    } else {
      // 移除名称时，删除name值
      const updatedData = data.map(item => {
        const newItem = { ...item }
        delete newItem.name
        return newItem
      })
      onChange(updatedData)
    }
  }

  return (
    <div className="space-y-6">
      {/* 维度配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">维度配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeZ"
                checked={includeZ}
                onChange={handleToggleZ}
                className="rounded"
              />
              <Label htmlFor="includeZ" className="text-sm">包含Z轴（气泡大小）</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeName"
                checked={includeName}
                onChange={handleToggleName}
                className="rounded"
              />
              <Label htmlFor="includeName" className="text-sm">包含数据点名称</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">数据操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
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
              onClick={handleAddRandomData}
            >
              随机数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCorrelationData}
            >
              相关性数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddClustersData}
            >
              聚类数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="col-span-2"
            >
              清空数据
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计 */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">数据统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">数据点数量</Label>
                <div className="font-medium">{data.length}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">X轴范围</Label>
                <div className="font-medium">
                  {Math.min(...data.map(item => item.x))} - {Math.max(...data.map(item => item.x))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Y轴范围</Label>
                <div className="font-medium">
                  {Math.min(...data.map(item => item.y))} - {Math.max(...data.map(item => item.y))}
                </div>
              </div>
              {includeZ && (
                <div>
                  <Label className="text-xs text-muted-foreground">Z轴范围</Label>
                  <div className="font-medium">
                    {Math.min(...data.map(item => item.z || 0))} - {Math.max(...data.map(item => item.z || 0))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
