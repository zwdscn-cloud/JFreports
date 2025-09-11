"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface PropertyConfig {
  key: string
  label: string
  type: 'text' | 'number' | 'color' | 'select' | 'switch' | 'slider'
  options?: { label: string; value: string | number }[]
  min?: number
  max?: number
  step?: number
  unit?: string
}

interface PropertyTableProps {
  properties: PropertyConfig[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
}

export function PropertyTable({ properties, values, onChange }: PropertyTableProps) {
  // 本地状态管理输入框的值
  const [inputValues, setInputValues] = useState<Record<string, any>>({})
  
  // 防抖计时器引用
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化本地输入值
  useEffect(() => {
    const initialValues: Record<string, any> = {}
    properties.forEach(property => {
      initialValues[property.key] = values[property.key] || ''
    })
    setInputValues(initialValues)
  }, [properties, values])

  // 防抖处理函数
  const handleChange = useCallback((key: string, value: any) => {
    // 清除之前的防抖计时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // 设置新的防抖计时器
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(key, value)
    }, 300) // 300ms防抖延迟，与NumberInput组件保持一致
  }, [onChange])

  // 组件卸载时清理计时器
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const renderEditor = (property: PropertyConfig) => {
    const value = inputValues[property.key]

    switch (property.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={property.type}
            value={value || ''}
            onChange={(e) => {
              // 只更新本地状态，不触发防抖更新
              const newValue = e.target.value
              setInputValues(prev => ({ ...prev, [property.key]: newValue }))
            }}
            onBlur={(e) => {
              // 在失去焦点时触发更新
              const newValue = property.type === 'number' ? Number(e.target.value) : e.target.value
              handleChange(property.key, newValue)
            }}
            onKeyDown={(e) => {
              // 当按下回车键时触发更新
              if (e.key === 'Enter') {
                e.preventDefault()
                const newValue = property.type === 'number' ? Number(e.currentTarget.value) : e.currentTarget.value
                handleChange(property.key, newValue)
              }
            }}
            min={property.min}
            max={property.max}
            step={property.step}
          />
        )

      case 'color':
        return (
          <Input
            type="color"
            value={inputValues[property.key] || '#000000'}
            onChange={(e) => {
              const newValue = e.target.value
              setInputValues(prev => ({ ...prev, [property.key]: newValue }))
              handleChange(property.key, newValue)
            }}
            className="w-full h-8"
          />
        )

      case 'select':
        return (
          <Select value={String(value)} onValueChange={(v) => handleChange(property.key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'switch':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => handleChange(property.key, checked)}
          />
        )

      case 'slider':
        return (
          <div className="flex items-center gap-2">
            <Slider
              value={[value || 0]}
              min={property.min}
              max={property.max}
              step={property.step}
              onValueChange={(v) => handleChange(property.key, v[0])}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {value}
              {property.unit}
            </span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">属性</TableHead>
          <TableHead>值</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.key}>
            <TableCell className="font-medium">{property.label}</TableCell>
            <TableCell>{renderEditor(property)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
