"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface SankeyNode {
  id: string
  name: string
  category?: string
}

export interface SankeyLink {
  source: string
  target: string
  value: number
  label?: string
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

interface SankeyEditorProps {
  data: SankeyData
  onChange: (data: SankeyData) => void
}

export function SankeyEditor({ data, onChange }: SankeyEditorProps) {
  const [activeTab, setActiveTab] = useState<"nodes" | "links">("nodes")

  // 确保数据有默认值
  const safeData = data || { nodes: [], links: [] }
  
  // 调试信息
  console.log("[SankeyEditor] 接收到的数据:", data)
  console.log("[SankeyEditor] 安全数据:", safeData)

  const addNode = () => {
    const newNode: SankeyNode = {
      id: `node_${Date.now()}`,
      name: `节点${safeData.nodes.length + 1}`,
      category: "默认"
    }
    onChange({
      ...safeData,
      nodes: [...safeData.nodes, newNode]
    })
  }

  const updateNode = (index: number, field: keyof SankeyNode, value: string) => {
    const newNodes = [...safeData.nodes]
    newNodes[index] = { ...newNodes[index], [field]: value }
    onChange({ ...safeData, nodes: newNodes })
  }

  const removeNode = (index: number) => {
    const nodeToRemove = safeData.nodes[index]
    const newNodes = safeData.nodes.filter((_, i) => i !== index)
    const newLinks = safeData.links.filter(
      link => link.source !== nodeToRemove.id && link.target !== nodeToRemove.id
    )
    onChange({ nodes: newNodes, links: newLinks })
  }

  const addLink = () => {
    if (safeData.nodes.length < 2) return
    
    const newLink: SankeyLink = {
      source: safeData.nodes[0]?.id || "",
      target: safeData.nodes[1]?.id || "",
      value: 100,
      label: "连接"
    }
    onChange({
      ...safeData,
      links: [...safeData.links, newLink]
    })
  }

  const updateLink = (index: number, field: keyof SankeyLink, value: string | number) => {
    const newLinks = [...safeData.links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    onChange({ ...safeData, links: newLinks })
  }

  const removeLink = (index: number) => {
    const newLinks = safeData.links.filter((_, i) => i !== index)
    onChange({ ...safeData, links: newLinks })
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button
          variant={activeTab === "nodes" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("nodes")}
        >
          节点管理
        </Button>
        <Button
          variant={activeTab === "links" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("links")}
        >
          连接管理
        </Button>
      </div>

      {activeTab === "nodes" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">节点列表</CardTitle>
              <Button variant="outline" size="sm" onClick={addNode}>
                <Plus className="h-4 w-4 mr-1" />
                添加节点
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {safeData.nodes.map((node, index) => (
                  <div key={node.id} className="flex gap-2 items-center bg-muted/50 p-3 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">节点名称</Label>
                          <Input
                            value={node.name}
                            onChange={(e) => updateNode(index, "name", e.target.value)}
                            placeholder="输入节点名称"
                            className="h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">分类</Label>
                          <Input
                            value={node.category || ""}
                            onChange={(e) => updateNode(index, "category", e.target.value)}
                            placeholder="输入分类"
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeNode(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {activeTab === "links" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">连接列表</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addLink}
                disabled={safeData.nodes.length < 2}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加连接
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {safeData.links.map((link, index) => (
                  <div key={index} className="flex gap-2 items-center bg-muted/50 p-3 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <Label className="text-xs">源节点</Label>
                          <select
                            value={link.source}
                            onChange={(e) => updateLink(index, "source", e.target.value)}
                            className="w-full h-8 px-3 py-1 text-sm border border-input bg-background rounded-md"
                          >
                            {safeData.nodes.map(node => (
                              <option key={node.id} value={node.id}>
                                {node.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <Label className="text-xs">目标节点</Label>
                          <select
                            value={link.target}
                            onChange={(e) => updateLink(index, "target", e.target.value)}
                            className="w-full h-8 px-3 py-1 text-sm border border-input bg-background rounded-md"
                          >
                            {safeData.nodes.map(node => (
                              <option key={node.id} value={node.id}>
                                {node.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">流量值</Label>
                          <Input
                            type="number"
                            value={link.value}
                            onChange={(e) => updateLink(index, "value", Number(e.target.value))}
                            placeholder="输入流量值"
                            className="h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">标签</Label>
                          <Input
                            value={link.label || ""}
                            onChange={(e) => updateLink(index, "label", e.target.value)}
                            placeholder="输入连接标签"
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {safeData.nodes.length === 0 && activeTab === "nodes" && (
        <div className="text-center text-muted-foreground py-8">
          <p>请先添加节点，然后创建连接</p>
        </div>
      )}
      
      {safeData.nodes.length === 0 && activeTab === "links" && (
        <div className="text-center text-muted-foreground py-8">
          <p>请先在"节点管理"中添加节点，然后在此创建连接</p>
        </div>
      )}
    </div>
  )
}
