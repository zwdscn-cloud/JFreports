"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Database, Code, FileText, CheckCircle, AlertCircle, Move, X, Download, Upload } from "lucide-react"
import Editor from "@monaco-editor/react"

interface SimpleDataEditorProps {
  data: any[] | { nodes: any[], links: any[] }
  onChange: (data: any[] | { nodes: any[], links: any[] }) => void
  chartType?: string
  isDarkMode?: boolean
}

export function SimpleDataEditor({ data = [], onChange, chartType = "", isDarkMode = false }: SimpleDataEditorProps) {
  // 关系图、树状图、桑基图特殊处理
  const isComplexData = (chartType === "network" || chartType === "tree" || chartType === "sankey") && 
                       typeof data === "object" && !Array.isArray(data) && data.nodes && data.links
  
  // 桑基图特殊处理
  const isSankeyData = chartType === "sankey" && isComplexData
  
  const [localData, setLocalData] = useState<any[]>(() => {
    if (isComplexData) return []
    return Array.isArray(data) ? data : []
  })
  const [jsonText, setJsonText] = useState("")
  const [isValidJson, setIsValidJson] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // 编辑器状态
  const [isUpdating, setIsUpdating] = useState(false)
  

  


  // 当外部 data 变化时，同步更新本地状态
  useEffect(() => {
    if (isComplexData) {
      // 复杂图表数据（关系图、树状图、桑基图）：显示节点数据
      setLocalData(data.nodes || [])
      const jsonString = JSON.stringify(data, null, 2)
      setJsonText(jsonString)
      setIsValidJson(true)
    } else {
      // 普通图表数据
      setLocalData(Array.isArray(data) ? data : [])
      const jsonString = JSON.stringify(data, null, 2)
      setJsonText(jsonString)
      setIsValidJson(true)
    }
  }, [data, chartType, isComplexData])

  // 确保编辑器有默认数据
  useEffect(() => {
    if (isDialogOpen && (!jsonText || jsonText.trim() === '')) {
      // 如果没有数据，提供默认的JSON结构
      const defaultData = isComplexData
        ? { nodes: [], links: [] }
        : []
      const defaultJson = JSON.stringify(defaultData, null, 2)
      setJsonText(defaultJson)
    }
  }, [isDialogOpen, jsonText, chartType, isComplexData])



  const handleJsonChange = (value: string) => {
    setJsonText(value)
    
    try {
      const parsed = JSON.parse(value)
      if (isComplexData) {
        // 复杂图表数据（关系图、树状图、桑基图）：支持对象格式
        if (typeof parsed === "object" && parsed.nodes && parsed.links) {
          setIsValidJson(true)
          setLocalData(parsed.nodes || [])
          onChange(parsed)
        } else if (Array.isArray(parsed)) {
          // 如果是数组，转换为复杂图表格式
          setIsValidJson(true)
          setLocalData(parsed)
          onChange({ nodes: parsed, links: [] })
        } else {
          setIsValidJson(false)
        }
      } else {
        // 普通图表数据：只支持数组格式
        if (Array.isArray(parsed)) {
          setIsValidJson(true)
          setLocalData(parsed)
          onChange(parsed)
        } else {
          setIsValidJson(false)
        }
      }
    } catch (error) {
      setIsValidJson(false)
    }
  }





  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonText(formatted)
      setIsValidJson(true)
    } catch (error) {
      // 忽略格式化错误
    }
  }

  const validateJson = () => {
    try {
      JSON.parse(jsonText)
      setIsValidJson(true)
      return true
    } catch (error) {
      setIsValidJson(false)
      return false
    }
  }

  const exportData = () => {
    const blob = new Blob([jsonText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setJsonText(content)
          handleJsonChange(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }



  const addRow = () => {
    if (isSankeyData) {
      // 桑基图：添加新节点
      const newNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `节点${localData.length + 1}`,
        category: "默认分类"
      }
      const newNodes = [...localData, newNode]
      setLocalData(newNodes)
      
      // 获取当前的完整数据（包括links）
      const currentData = typeof data === "object" && !Array.isArray(data) ? data : { nodes: [], links: [] }
      const newData = { ...currentData, nodes: newNodes }
      onChange(newData)
    } else if (isComplexData) {
      // 关系图、树状图：添加新节点
      const newNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `节点${localData.length + 1}`,
        value: Math.floor(Math.random() * 100) + 10,
        group: "group1",
        size: Math.floor(Math.random() * 20) + 10
      }
      const newNodes = [...localData, newNode]
      setLocalData(newNodes)
      
      // 获取当前的完整数据（包括links）
      const currentData = typeof data === "object" && !Array.isArray(data) ? data : { nodes: [], links: [] }
      const newData = { ...currentData, nodes: newNodes }
      onChange(newData)
    } else {
      // 普通图表
      const newRow = getDefaultRow()
      const newData = [...localData, newRow]
      setLocalData(newData)
      onChange(newData)
    }
  }

  const removeRow = (index: number) => {
    if (isComplexData) {
      // 复杂图表（关系图、树状图、桑基图）：删除节点
      const newNodes = localData.filter((_, i) => i !== index)
      setLocalData(newNodes)
      
      // 获取当前的完整数据（包括links）
      const currentData = typeof data === "object" && !Array.isArray(data) ? data : { nodes: [], links: [] }
      const newData = { ...currentData, nodes: newNodes }
      onChange(newData)
    } else {
      // 普通图表
      const newData = localData.filter((_, i) => i !== index)
      setLocalData(newData)
      onChange(newData)
    }
  }

  const updateRow = (index: number, field: string, value: any) => {
    const newData = [...localData]
    // 对于数值字段，确保转换为数字类型
    const processedValue = (field === "value" || field === "x" || field === "y") 
      ? Number(value) || 0 
      : value
    newData[index] = { ...newData[index], [field]: processedValue }
    setLocalData(newData) // 立即更新本地状态
  }

  const updateComplexDataRow = (index: number, field: string, value: any) => {
    const newNodes = [...localData]
    
    // 对于数值字段，确保转换为数字类型
    let processedValue = value
    if (isSankeyData) {
      // 桑基图：所有字段都是文本类型
      processedValue = value
    } else {
      // 关系图、树状图：数值字段需要转换
      processedValue = (field === "value" || field === "size") 
        ? Number(value) || 0 
        : value
    }
    
    newNodes[index] = { ...newNodes[index], [field]: processedValue }
    setLocalData(newNodes)
    
    // 获取当前的完整数据（包括links）
    const currentData = typeof data === "object" && !Array.isArray(data) ? data : { nodes: [], links: [] }
    const newData = { ...currentData, nodes: newNodes }
    onChange(newData)
  }

  const handleBlur = () => {
    // 当用户离开输入框时，通知父组件更新图表
    setIsUpdating(true)
    if (isComplexData) {
      // 复杂图表（关系图、树状图、桑基图）：传递完整的数据对象
      const currentData = typeof data === "object" && !Array.isArray(data) ? data : { nodes: [], links: [] }
      const newData = { ...currentData, nodes: localData }
      onChange(newData)
    } else {
      // 普通图表
      onChange(localData)
    }
    // 短暂显示更新状态
    setTimeout(() => setIsUpdating(false), 300)
  }

  const getDefaultRow = () => {
    const currentIndex = localData.length + 1
    
    // 为不同图表类型提供更合适的示例数据
    switch (chartType.toLowerCase()) {
      case "bar":
        const barNames = ["产品A", "产品B", "产品C", "产品D", "产品E", "产品F", "产品G", "产品H"]
        return { 
          name: barNames[currentIndex - 1] || `产品${currentIndex}`, 
          value: Math.floor(Math.random() * 300) + 100 
        }
      case "line":
        const lineNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
        return { 
          name: lineNames[currentIndex - 1] || `第${currentIndex}期`, 
          value: Math.floor(Math.random() * 500) + 200 
        }
      case "area":
        const areaNames = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]
        return { 
          name: areaNames[currentIndex - 1] || `季度${currentIndex}`, 
          value: Math.floor(Math.random() * 400) + 150 
        }
      case "pie":
        const pieNames = ["苹果", "香蕉", "橙子", "葡萄", "草莓", "蓝莓", "樱桃", "桃子"]
        return { 
          name: pieNames[currentIndex - 1] || `分类${currentIndex}`, 
          value: Math.floor(Math.random() * 80) + 20 
        }
      case "funnel":
        const funnelNames = ["访问", "咨询", "订单", "付款", "成交", "复购"]
        return { 
          name: funnelNames[currentIndex - 1] || `阶段${currentIndex}`, 
          value: Math.floor(Math.random() * 1000) + 100 
        }
      case "scatter":
        return { 
          x: Math.floor(Math.random() * 100) + 20, 
          y: Math.floor(Math.random() * 100) + 20 
        }
      default:
        const defaultNames = ["项目A", "项目B", "项目C", "项目D", "项目E", "项目F"]
        return { 
          name: defaultNames[currentIndex - 1] || `项目${currentIndex}`, 
          value: Math.floor(Math.random() * 200) + 50 
        }
    }
  }

  // 获取字段列表
  const getFields = () => {
    if (localData.length === 0) return []
    return Object.keys(localData[0])
  }

  const fields = getFields()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            数据编辑
            
          </CardTitle>
          
          {/* 简洁的Json编辑器弹窗 */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Code className="w-4 h-4 mr-2" />
                Json编辑器
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[1280px] h-[768px] !max-w-[1280px] !max-h-[768px] !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] p-0">
              <DialogTitle className="sr-only">Json编辑器</DialogTitle>
              <div className="h-full flex flex-col">
                {/* 工具栏 */}
                <div className="flex items-center px-4 py-2 border-b bg-gray-100 dark:bg-gray-800">
                  {/* 左侧：文件名和状态 */}
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">data.json</span>
                    {isValidJson ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  {/* 中间：功能按钮 */}
                  <div className="flex items-center gap-2 mx-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={formatJson}
                      className="text-xs h-7 px-2"
                      title="格式化JSON"
                    >
                      格式化
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={importData}
                      className="text-xs h-7 px-2"
                      title="导入JSON文件"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportData}
                      className="text-xs h-7 px-2"
                      title="导出JSON文件"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                  </div>
                  
                  {/* 右侧：预留空间，避免按钮被关闭按钮遮挡 */}
                  <div className="w-8"></div>
                </div>
                
                {/* Json编辑器 */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    theme={isDarkMode ? "vs-dark" : "vs"}
                    value={jsonText}
                    onChange={(value) => handleJsonChange(value || "")}
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      wordWrap: "on",
                      automaticLayout: true,
                      lineNumbers: "on",
                      tabSize: 2,
                      insertSpaces: true,
                      bracketPairColorization: { enabled: true },
                      guides: { bracketPairs: true, indentation: true },
                      renderLineHighlight: "all",
                      folding: true,
                      fontFamily: "Consolas, 'Courier New', monospace"
                    }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 数据表格 */}
        <div className="space-y-3">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                                     {isSankeyData ? (
                     // 桑基图字段
                     <>
                       <TableHead className="text-xs w-[40%]">节点名称</TableHead>
                       <TableHead className="text-xs w-[40%]">分类</TableHead>
                       <TableHead className="text-xs w-[20%]">ID</TableHead>
                     </>
                   ) : isComplexData ? (
                     // 关系图、树状图字段
                     <>
                       <TableHead className="text-xs w-[30%]">名称</TableHead>
                       <TableHead className="text-xs w-[20%]">数值</TableHead>
                       <TableHead className="text-xs w-[30%]">分组</TableHead>
                       <TableHead className="text-xs w-[20%]">大小</TableHead>
                     </>
                   ) : (
                    // 普通图表字段
                    fields.map((field) => (
                      <TableHead key={field} className="text-xs capitalize">
                        {field === "value" ? "数值" : 
                         field === "x" ? "X坐标" : 
                         field === "y" ? "Y坐标" : 
                         field}
                      </TableHead>
                    ))
                  )}
                  <TableHead className="w-[60px] pr-2">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.map((row, index) => (
                  <TableRow key={index}>
                    {isSankeyData ? (
                      // 桑基图节点字段
                      <>
                        <TableCell className="p-1">
                          <Input
                            type="text"
                            value={row.name || ""}
                            onChange={(e) => updateComplexDataRow(index, "name", e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-xs border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder="节点名称"
                            style={{ fontSize: '8px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="text"
                            value={row.category || ""}
                            onChange={(e) => updateComplexDataRow(index, "category", e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-xs border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder="分类"
                            style={{ fontSize: '8px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="text"
                            value={row.id || ""}
                            onChange={(e) => updateComplexDataRow(index, "id", e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-xs border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder="节点ID"
                            style={{ fontSize: '8px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                      </>
                    ) : isComplexData ? (
                      // 关系图、树状图节点字段
                      <>
                        <TableCell className="p-1">
                          <Input
                            type="text"
                            value={row.name || ""}
                            onChange={(e) => updateComplexDataRow(index, "name", e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-xs border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder="节点名称"
                            style={{ fontSize: '8px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            value={row.value || ""}
                            onChange={(e) => updateComplexDataRow(index, "value", e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-[10px] border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder="数值"
                            step="1"
                            style={{ fontSize: '8px', padding: '2px 6px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="text"
                            value={row.group || ""}
                            onChange={(e) => updateComplexDataRow(index, "group", e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-xs border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder="分组"
                            style={{ fontSize: '8px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            value={row.size || ""}
                            onChange={(e) => updateComplexDataRow(index, "size", e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-[10px] border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder="大小"
                            step="1"
                            style={{ fontSize: '8px', padding: '2px 6px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                      </>
                    ) : (
                      // 普通图表字段
                      fields.map((field) => (
                        <TableCell key={field} className="p-1">
                          <Input
                            type={field === "value" || field === "x" || field === "y" ? "number" : "text"}
                            value={row[field] || ""}
                            onChange={(e) => updateRow(index, field, e.target.value)}
                            onBlur={handleBlur}
                            className="h-7 text-xs border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                            placeholder={field}
                            step={field === "value" || field === "x" || field === "y" ? "1" : undefined}
                            style={{ fontSize: '8px', width: 'calc(100% + 1px)' }}
                          />
                        </TableCell>
                      ))
                    )}
                    <TableCell className="p-1 pr-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(index)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* 添加行按钮 */}
          <div className="flex justify-center">
            <Button
              onClick={addRow}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加数据行
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
