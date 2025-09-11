"use client"

import { BaseEditor, type DataItem } from "./base-editor"

export interface HistogramData extends DataItem {
  category: string
  value: number
  frequency: number
}

interface HistogramEditorProps {
  data: HistogramData[]
  onChange: (data: HistogramData[]) => void
}

export function HistogramEditor({ data = [], onChange }: HistogramEditorProps) {
  return (
    <BaseEditor
      data={data}
      onChange={onChange}
      fields={[
        {
          name: "category",
          label: "区间",
          type: "text",
          required: true,
          placeholder: "例如：0-10"
        },
        {
          name: "value",
          label: "数值",
          type: "number",
          required: true,
          step: 1,
          placeholder: "区间中心值"
        },
        {
          name: "frequency",
          label: "频率",
          type: "number",
          required: true,
          min: 0,
          step: 1,
          placeholder: "出现次数"
        }
      ]}
    />
  )
}