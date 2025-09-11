"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

export interface CustomDataItem {
  field: string
  value: string | number
}

interface CustomDataEditorProps {
  data: CustomDataItem[]
  onChange: (data: CustomDataItem[]) => void
}

export function CustomDataEditor({ data, onChange }: CustomDataEditorProps) {
  const addNewField = () => {
    const newFieldNumber = data.length + 1
    onChange([...data, { field: `field${newFieldNumber}`, value: 0 }])
  }

  const removeField = (index: number) => {
    const newData = [...data]
    newData.splice(index, 1)
    onChange(newData)
  }

  const updateField = (index: number, field: string, value: string) => {
    const newData = [...data]
    newData[index] = {
      ...newData[index],
      [field]: isNaN(Number(value)) ? value : Number(value)
    }
    onChange(newData)
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <Label>字段名</Label>
            <Input
              value={item.field}
              onChange={(e) => updateField(index, "field", e.target.value)}
              placeholder="输入字段名"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>数值</Label>
            <Input
              value={item.value}
              onChange={(e) => updateField(index, "value", e.target.value)}
              placeholder="输入数值"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mt-8"
            onClick={() => removeField(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={addNewField}>
        <Plus className="h-4 w-4 mr-2" />
        添加字段
      </Button>
    </div>
  )
}
