"use client"

import { BaseEditor, type DataItem } from "./base-editor"

export interface AreaData extends DataItem {
  category: string
  value: number
  value2?: number
}

interface AreaEditorProps {
  data: AreaData[]
  onChange: (data: AreaData[]) => void
}

export function AreaEditor({ data = [], onChange }: AreaEditorProps) {
  return (
    <BaseEditor
      data={data}
      onChange={onChange}
      fields={[
        {
          name: "category",
          label: "类别",
          type: "text",
          required: true,
          placeholder: "请输入类别名称"
        },
        {
          name: "value",
          label: "数值1",
          type: "number",
          required: true,
          step: 1,
          placeholder: "请输入数值"
        },
        {
          name: "value2",
          label: "数值2",
          type: "number",
          step: 1,
          placeholder: "请输入数值（可选）"
        }
      ]}
    />
  )
}