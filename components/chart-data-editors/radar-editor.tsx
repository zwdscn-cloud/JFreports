"use client"

import { BaseEditor, type DataItem } from "./base-editor"

export interface RadarData extends DataItem {
  name: string
  value: number
}

interface RadarEditorProps {
  data: RadarData[]
  onChange: (data: RadarData[]) => void
}

export function RadarEditor({ data = [], onChange }: RadarEditorProps) {
  return (
    <BaseEditor
      data={data}
      onChange={onChange}
      fields={[
        {
          name: "name",
          label: "维度名称",
          type: "text",
          required: true,
          placeholder: "请输入维度名称"
        },
        {
          name: "value",
          label: "数值",
          type: "number",
          required: true,
          min: 0,
          max: 100,
          step: 1,
          placeholder: "请输入0-100之间的数值"
        }
      ]}
    />
  )
}