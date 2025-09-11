"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Database, Code, FileText, CheckCircle, AlertCircle, Save, X, Download, Upload } from "lucide-react"
import Editor from "@monaco-editor/react"

interface InfoTableData {
  id: string
  title: string
  content: string
}

interface InfoTableDataEditorProps {
  data: InfoTableData[]
  onChange: (data: InfoTableData[]) => void
  isDarkMode?: boolean
}

export function InfoTableDataEditor({ data = [], onChange, isDarkMode = false }: InfoTableDataEditorProps) {
  const [localData, setLocalData] = useState<InfoTableData[]>(data)
  const [jsonText, setJsonText] = useState("")
  const [isValidJson, setIsValidJson] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<InfoTableData>({ id: "", title: "", content: "" })

  // 同步外部数据变化
  useEffect(() => {
    setLocalData(data)
    const jsonString = JSON.stringify(data, null, 2)
    setJsonText(jsonString)
    setIsValidJson(true)
  }, [data])

  // 当对话框打开时，确保有默认数据
  useEffect(() => {
    if (isDialogOpen && (!jsonText || jsonText.trim() === '')) {
      const defaultData: InfoTableData[] = []
      const defaultJson = JSON.stringify(defaultData, null, 2)
      setJsonText(defaultJson)
    }
  }, [isDialogOpen, jsonText])

  const handleJsonChange = (value: string) => {
    setJsonText(value)
    
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        setIsValidJson(true)
        setLocalData(parsed)
        onChange(parsed)
      } else {
        setIsValidJson(false)
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
    a.download = 'info-table-data.json'
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



  // 添加新行
  const addRow = () => {
    const newRow: InfoTableData = {
      id: `${localData.length + 1}`,
      title: `标题${localData.length + 1}`,
      content: `内容${localData.length + 1}`
    }
    const newData = [...localData, newRow]
    setLocalData(newData)
    onChange(newData)
  }

  // 删除行
  const deleteRow = (index: number) => {
    const newData = localData.filter((_, i) => i !== index)
    setLocalData(newData)
    onChange(newData)
  }

  // 开始编辑
  const startEdit = (index: number) => {
    setEditingRow(index)
    setEditForm(localData[index])
  }

  // 保存编辑
  const saveEdit = () => {
    if (editingRow !== null) {
      const newData = [...localData]
      newData[editingRow] = editForm
      setLocalData(newData)
      onChange(newData)
      setEditingRow(null)
      setEditForm({ id: "", title: "", content: "" })
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingRow(null)
    setEditForm({ id: "", title: "", content: "" })
  }

  // 更新编辑表单
  const updateEditForm = (field: keyof InfoTableData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            信息表
          </CardTitle>
          
          {/* Json编辑器弹窗 */}
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
                    <span className="text-sm font-medium">info-table-data.json</span>
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
                  <TableHead className="text-xs w-[15%]">ID</TableHead>
                  <TableHead className="text-xs w-[25%]">标题</TableHead>
                  <TableHead className="text-xs w-[45%]">内容</TableHead>
                  <TableHead className="text-xs w-[15%]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.map((row, index) => (
                  <TableRow key={index}>
                    {editingRow === index ? (
                      // 编辑模式
                      <>
                        <TableCell className="p-1">
                          <Input
                            value={editForm.id}
                            onChange={(e) => updateEditForm("id", e.target.value)}
                            className="h-7 text-xs"
                            placeholder="ID"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            value={editForm.title}
                            onChange={(e) => updateEditForm("title", e.target.value)}
                            className="h-7 text-xs"
                            placeholder="标题"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            value={editForm.content}
                            onChange={(e) => updateEditForm("content", e.target.value)}
                            className="h-7 text-xs"
                            placeholder="内容"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              className="h-7 px-2"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="h-7 px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      // 显示模式
                      <>
                        <TableCell className="text-xs p-2">{row.id}</TableCell>
                        <TableCell className="text-xs p-2">{row.title}</TableCell>
                        <TableCell className="text-xs p-2">{row.content}</TableCell>
                        <TableCell className="p-1">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(index)}
                              className="h-7 px-2"
                            >
                              编辑
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteRow(index)}
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <Button onClick={addRow} size="sm" className="h-8">
            <Plus className="w-4 h-4 mr-1" />
            添加行
          </Button>
          <div className="text-xs text-gray-500">
            共 {localData.length} 条记录
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 