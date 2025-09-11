"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Users, Link, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface NetworkNode {
  id: string
  name: string
  value?: number
  group?: string
  size?: number
}

export interface NetworkLink {
  source: string
  target: string
  value?: number
  type?: string
}

export interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
}

interface NetworkEditorProps {
  data: NetworkData
  onChange: (data: NetworkData) => void
}

export function NetworkEditor({ data, onChange }: NetworkEditorProps) {
  const [activeTab, setActiveTab] = useState("nodes")

  // 节点管理
  const addNode = () => {
    const newNode: NetworkNode = {
      id: `node_${Date.now()}`,
      name: `节点${data.nodes.length + 1}`,
      value: 1,
      group: "default",
      size: 20
    }
    onChange({
      ...data,
      nodes: [...data.nodes, newNode]
    })
  }

  const removeNode = (index: number) => {
    const nodeToRemove = data.nodes[index]
    const newNodes = data.nodes.filter((_, i) => i !== index)
    const newLinks = data.links.filter(
      link => link.source !== nodeToRemove.id && link.target !== nodeToRemove.id
    )
    onChange({
      nodes: newNodes,
      links: newLinks
    })
  }

  const updateNode = (index: number, field: keyof NetworkNode, value: string | number) => {
    const newNodes = [...data.nodes]
    if (field === "value" || field === "size") {
      newNodes[index] = {
        ...newNodes[index],
        [field]: Number(value)
      }
    } else {
      newNodes[index] = {
        ...newNodes[index],
        [field]: value
      }
    }
    onChange({
      ...data,
      nodes: newNodes
    })
  }

  // 连接管理
  const addLink = () => {
    if (data.nodes.length < 2) {
      alert("请先添加至少两个节点")
      return
    }
    
    const newLink: NetworkLink = {
      source: data.nodes[0]?.id || "",
      target: data.nodes[1]?.id || "",
      value: 1,
      type: "default"
    }
    onChange({
      ...data,
      links: [...data.links, newLink]
    })
  }

  const removeLink = (index: number) => {
    const newLinks = data.links.filter((_, i) => i !== index)
    onChange({
      ...data,
      links: newLinks
    })
  }

  const updateLink = (index: number, field: keyof NetworkLink, value: string | number) => {
    const newLinks = [...data.links]
    if (field === "value") {
      newLinks[index] = {
        ...newLinks[index],
        [field]: Number(value)
      }
    } else {
      newLinks[index] = {
        ...newLinks[index],
        [field]: value
      }
    }
    onChange({
      ...data,
      links: newLinks
    })
  }

  // 快速操作
  const generateSampleData = () => {
    const sampleData: NetworkData = {
      nodes: [
        { id: "1", name: "中心节点", value: 100, group: "center", size: 30 },
        { id: "2", name: "节点A", value: 50, group: "group1", size: 20 },
        { id: "3", name: "节点B", value: 50, group: "group1", size: 20 },
        { id: "4", name: "节点C", value: 30, group: "group2", size: 15 },
        { id: "5", name: "节点D", value: 30, group: "group2", size: 15 },
      ],
      links: [
        { source: "1", target: "2", value: 10, type: "strong" },
        { source: "1", target: "3", value: 10, type: "strong" },
        { source: "2", target: "4", value: 5, type: "weak" },
        { source: "3", target: "5", value: 5, type: "weak" },
      ]
    }
    onChange(sampleData)
  }

  const clearAllData = () => {
    onChange({ nodes: [], links: [] })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">关系图数据</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateSampleData}>
            示例数据
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllData}>
            清空数据
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nodes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            节点管理
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            连接管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {data.nodes.length} 个节点
            </div>
            <Button variant="outline" size="sm" onClick={addNode}>
              <Plus className="h-4 w-4 mr-1" />
              添加节点
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {data.nodes.map((node, index) => (
                <div key={node.id} className="bg-muted/50 p-3 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">节点 {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNode(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>节点ID</Label>
                      <Input
                        value={node.id}
                        onChange={(e) => updateNode(index, "id", e.target.value)}
                        placeholder="唯一标识符"
                      />
                    </div>
                    <div>
                      <Label>节点名称</Label>
                      <Input
                        value={node.name}
                        onChange={(e) => updateNode(index, "name", e.target.value)}
                        placeholder="显示名称"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>权重值</Label>
                      <Input
                        type="number"
                        value={node.value || 0}
                        onChange={(e) => updateNode(index, "value", e.target.value)}
                        placeholder="权重"
                      />
                    </div>
                    <div>
                      <Label>节点大小</Label>
                      <Input
                        type="number"
                        value={node.size || 20}
                        onChange={(e) => updateNode(index, "size", e.target.value)}
                        placeholder="大小"
                      />
                    </div>
                    <div>
                      <Label>分组</Label>
                      <Input
                        value={node.group || ""}
                        onChange={(e) => updateNode(index, "group", e.target.value)}
                        placeholder="分组名称"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {data.links.length} 个连接
            </div>
            <Button variant="outline" size="sm" onClick={addLink}>
              <Plus className="h-4 w-4 mr-1" />
              添加连接
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {data.links.map((link, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">连接 {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>源节点</Label>
                      <Select
                        value={link.source}
                        onValueChange={(value) => updateLink(index, "source", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择源节点" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.name} ({node.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>目标节点</Label>
                      <Select
                        value={link.target}
                        onValueChange={(value) => updateLink(index, "target", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择目标节点" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.name} ({node.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>连接权重</Label>
                      <Input
                        type="number"
                        value={link.value || 0}
                        onChange={(e) => updateLink(index, "value", e.target.value)}
                        placeholder="权重值"
                      />
                    </div>
                    <div>
                      <Label>连接类型</Label>
                      <Input
                        value={link.type || ""}
                        onChange={(e) => updateLink(index, "type", e.target.value)}
                        placeholder="连接类型"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* 数据统计 */}
      <div className="bg-muted/30 p-3 rounded-lg">
        <div className="text-sm font-medium mb-2">数据统计</div>
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <div>节点数量</div>
            <div className="text-lg font-semibold text-foreground">{data.nodes.length}</div>
          </div>
          <div>
            <div>连接数量</div>
            <div className="text-lg font-semibold text-foreground">{data.links.length}</div>
          </div>
          <div>
            <div>分组数量</div>
            <div className="text-lg font-semibold text-foreground">
              {new Set(data.nodes.map(n => n.group).filter(Boolean)).size}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 