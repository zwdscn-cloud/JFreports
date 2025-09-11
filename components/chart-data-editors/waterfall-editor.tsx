"use client"

import { BaseEditor, type DataItem } from "./base-editor"

export interface WaterfallData extends DataItem {
  category: string
  value: number
  isTotal?: boolean
}

interface WaterfallEditorProps {
  data: WaterfallData[]
  onChange: (data: WaterfallData[]) => void
}

export function WaterfallEditor({ data = [], onChange }: WaterfallEditorProps) {
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
          label: "数值",
          type: "number",
          required: true,
          step: 1,
          placeholder: "正数表示增加，负数表示减少"
        }
      ]}
    />
  )
}