"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarEditor, 
  LineEditor, 
  PieEditor, 
  ScatterEditor,
  BarChartData,
  LineChartData,
  PieChartData,
  ScatterChartData
} from "@/components/chart-data-editors"

interface DataBindingPanelProps {
  chartType?: string
  data: any[]
  onDataChange: (data: any[]) => void
}

export function DataBindingPanel({ chartType = "", data = [], onDataChange }: DataBindingPanelProps) {
  const [activeTab, setActiveTab] = useState("data")

  // 根据图表类型获取对应的编辑器
  const getEditor = () => {
    const type = chartType?.toLowerCase() || ""
    
    switch (type) {
      case "bar":
      case "barchart":
        return (
          <BarEditor
            data={data as BarChartData[]}
            onChange={onDataChange}
          />
        )
      case "line":
      case "linechart":
        return (
          <LineEditor
            data={data as LineChartData[]}
            onChange={onDataChange}
          />
        )
      case "pie":
      case "piechart":
        return (
          <PieEditor
            data={data as PieChartData[]}
            onChange={onDataChange}
          />
        )
      case "scatter":
      case "scatterchart":
        return (
          <ScatterEditor
            data={data as ScatterChartData[]}
            onChange={onDataChange}
          />
        )
      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            暂不支持此图表类型的数据编辑
          </div>
        )
    }
  }

  // 获取图表类型的中文名称
  const getChartTypeName = () => {
    const type = chartType?.toLowerCase() || ""
    
    switch (type) {
      case "bar":
      case "barchart":
        return "柱状图"
      case "line":
      case "linechart":
        return "折线图"
      case "pie":
      case "piechart":
        return "饼图"
      case "scatter":
      case "scatterchart":
        return "散点图"
      default:
        return "图表"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">{getChartTypeName()}数据配置</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="data">数据编辑</TabsTrigger>
            <TabsTrigger value="preview">数据预览</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="mt-4">
            {getEditor()}
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <div className="space-y-4">
              <div className="text-sm font-medium">数据预览</div>
              {data.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  暂无数据
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}