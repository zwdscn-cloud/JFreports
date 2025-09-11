"use client"

import { useState } from "react"
import { BaseEditor, DataItem, Field } from "./base-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface PieChartData extends DataItem {
  name: string
  value: number
}

interface PieEditorProps {
  data: PieChartData[]
  onChange: (data: PieChartData[]) => void
}

export function PieEditor({ data = [], onChange }: PieEditorProps) {
  const fields: Field[] = [
    {
      name: "name",
      label: "类别名称",
      type: "text",
      required: true,
      placeholder: "例如：产品A、部门B..."
    },
    {
      name: "value",
      label: "数值",
      type: "number",
      required: true,
      min: 0,
      placeholder: "请输入数值"
    }
  ]

  const handleAddSampleData = () => {
    const sampleData: PieChartData[] = [
      { name: "产品A", value: 30 },
      { name: "产品B", value: 40 },
      { name: "产品C", value: 25 },
      { name: "产品D", value: 35 },
      { name: "产品E", value: 20 },
    ]
    onChange(sampleData)
  }

  const handleAddSalesData = () => {
    const salesData: PieChartData[] = [
      { name: "线上销售", value: 45 },
      { name: "线下门店", value: 30 },
      { name: "代理商", value: 15 },
      { name: "其他渠道", value: 10 },
    ]
    onChange(salesData)
  }

  const handleAddDepartmentData = () => {
    const departmentData: PieChartData[] = [
      { name: "技术部", value: 35 },
      { name: "销售部", value: 25 },
      { name: "市场部", value: 20 },
      { name: "人事部", value: 10 },
      { name: "财务部", value: 10 },
    ]
    onChange(departmentData)
  }

  const handleAddRandomData = () => {
    const randomData: PieChartData[] = []
    const categories = ["类别A", "类别B", "类别C", "类别D", "类别E", "类别F"]
    
    categories.forEach((category, index) => {
      const value = Math.floor(Math.random() * 50) + 10 // 10-60之间的随机值
      randomData.push({ name: category, value })
    })
    
    onChange(randomData)
  }

  const handleClearData = () => {
    onChange([])
  }

  const handleNormalizeData = () => {
    if (data.length === 0) return
    
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return
    
    const normalizedData = data.map(item => ({
      ...item,
      value: Math.round((item.value / total) * 100)
    }))
    
    onChange(normalizedData)
  }

  return (
    <div className="space-y-6">
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
              onClick={handleAddSalesData}
            >
              销售数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddDepartmentData}
            >
              部门数据
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
              onClick={handleNormalizeData}
            >
              标准化为百分比
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

      {/* 数据统计 */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">数据统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">数据项数</Label>
                <div className="font-medium">{data.length}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">总和</Label>
                <div className="font-medium">{data.reduce((sum, item) => sum + item.value, 0)}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">最大值</Label>
                <div className="font-medium">{Math.max(...data.map(item => item.value))}</div>
              </div>
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
            fields={fields}
          />
        </CardContent>
      </Card>
    </div>
  )
}
