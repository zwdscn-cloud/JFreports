"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

export interface DataItem {
  id?: string
  [key: string]: any
}

interface Field {
  name: string
  label: string
  type: "text" | "number"
  required?: boolean
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

interface BaseEditorProps {
  data: DataItem[]
  onChange: (data: DataItem[]) => void
  fields: Field[]
}

export function BaseEditor({ data = [], onChange, fields }: BaseEditorProps) {
  const [error, setError] = useState<string>("")

  const validateField = (value: any, field: Field): boolean => {
    if (field.required && (value === undefined || value === "")) {
      setError(`${field.label}不能为空`)
      return false
    }

    if (field.type === "number") {
      const numValue = Number(value)
      if (isNaN(numValue)) {
        setError(`${field.label}必须是数字`)
        return false
      }
      if (field.min !== undefined && numValue < field.min) {
        setError(`${field.label}不能小于${field.min}`)
        return false
      }
      if (field.max !== undefined && numValue > field.max) {
        setError(`${field.label}不能大于${field.max}`)
        return false
      }
    }

    setError("")
    return true
  }

  const handleAdd = () => {
    const newItem: DataItem = {
      id: `item-${Date.now()}`
    }
    
    // 为每个字段设置默认值
    fields.forEach(field => {
      newItem[field.name] = field.type === "number" ? 0 : ""
    })

    onChange([...data, newItem])
  }

  const handleDelete = (index: number) => {
    const newData = [...data]
    newData.splice(index, 1)
    onChange(newData)
  }

  const handleChange = (index: number, field: Field, value: string) => {
    if (!validateField(value, field)) return

    const newData = [...data]
    newData[index] = {
      ...newData[index],
      [field.name]: field.type === "number" ? Number(value) : value
    }
    onChange(newData)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 p-2 rounded">
          {error}
        </div>
      )}

                    <div className="pr-4">
         <Table>
            <TableHeader>
              <TableRow>
                {fields.map((field) => (
                  <TableHead key={field.name} className="text-xs">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </TableHead>
                ))}
                <TableHead className="w-[50px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id || index} className="group">
                  {fields.map((field) => (
                                         <TableCell key={field.name} className="p-1">
                       <Input
                         id={`${field.name}-${index}`}
                         type={field.type}
                         value={item[field.name] ?? ""}
                         onChange={(e) => handleChange(index, field, e.target.value)}
                         min={field.min}
                         max={field.max}
                         step={field.step}
                         placeholder={field.placeholder}
                         required={field.required}
                         className="h-8 text-xs border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       />
                     </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
                     </Table>
         </div>

             <div className="pt-4 border-t">
         <Button
           variant="outline"
           className="w-full"
           onClick={handleAdd}
         >
           <Plus className="w-4 h-4 mr-2" />
           添加数据
         </Button>
       </div>
    </div>
  )
}