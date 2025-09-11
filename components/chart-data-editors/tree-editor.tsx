"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, GitBranch, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TreeNode {
  id: string
  name: string
  value?: number
  children?: TreeNode[]
}

export interface TreeData {
  root: TreeNode
}

interface TreeEditorProps {
  data: TreeData
  onChange: (data: TreeData) => void
}

export function TreeEditor({ data, onChange }: TreeEditorProps) {
  const [activeTab, setActiveTab] = useState("structure")
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 添加根节点
  const addRootNode = () => {
    const newRoot: TreeNode = {
      id: `node_${Date.now()}`,
      name: "根节点",
      value: 100,
      children: []
    }
    onChange({ root: newRoot })
  }

  // 添加子节点
  const addChildNode = (parentId: string) => {
    const newChild: TreeNode = {
      id: `node_${Date.now()}`,
      name: "新节点",
      value: 50,
      children: []
    }

    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newChild]
        }
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        }
      }
      return node
    }

    const updatedRoot = updateNode(data.root)
    onChange({ root: updatedRoot })
  }

  // 删除节点
  const removeNode = (nodeId: string) => {
    if (nodeId === data.root.id) {
      onChange({ root: { id: "", name: "", children: [] } })
      return
    }

    const removeFromNode = (node: TreeNode): TreeNode | null => {
      if (node.children) {
        const filteredChildren = node.children
          .map(removeFromNode)
          .filter((child): child is TreeNode => child !== null)
        
        return {
          ...node,
          children: filteredChildren
        }
      }
      return node.id === nodeId ? null : node
    }

    const updatedRoot = removeFromNode(data.root)
    if (updatedRoot) {
      onChange({ root: updatedRoot })
    }
  }

  // 更新节点
  const updateNode = (nodeId: string, field: keyof TreeNode, value: string | number) => {
    const updateNodeData = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          [field]: field === "value" ? Number(value) : value
        }
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeData)
        }
      }
      return node
    }

    const updatedRoot = updateNodeData(data.root)
    onChange({ root: updatedRoot })
  }

  // 渲染节点树
  const renderNodeTree = (node: TreeNode, level: number = 0) => {
    const isSelected = selectedNodeId === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id} className="space-y-2">
        <div className={`p-3 rounded-lg border ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span className="text-sm font-medium">节点 {level === 0 ? '(根)' : level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addChildNode(node.id)}
                className="h-6 w-6 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNode(node.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">节点名称</Label>
              <Input
                value={node.name}
                onChange={(e) => updateNode(node.id, "name", e.target.value)}
                placeholder="节点名称"
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">节点值</Label>
              <Input
                type="number"
                value={node.value || ""}
                onChange={(e) => updateNode(node.id, "value", e.target.value)}
                placeholder="数值"
                className="h-7 text-xs"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
            className="w-full mt-2 h-6 text-xs"
          >
            {isSelected ? "取消选择" : "选择此节点"}
          </Button>
        </div>

        {hasChildren && (
          <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {node.children!.map((child) => renderNodeTree(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // 生成示例数据
  const generateSampleData = () => {
    const sampleData: TreeData = {
      root: {
        id: "root",
        name: "公司组织",
        value: 1000,
        children: [
          {
            id: "dept1",
            name: "技术部",
            value: 400,
            children: [
              { id: "team1", name: "前端团队", value: 150, children: [] },
              { id: "team2", name: "后端团队", value: 200, children: [] },
              { id: "team3", name: "测试团队", value: 50, children: [] }
            ]
          },
          {
            id: "dept2",
            name: "产品部",
            value: 300,
            children: [
              { id: "team4", name: "产品设计", value: 100, children: [] },
              { id: "team5", name: "用户体验", value: 200, children: [] }
            ]
          },
          {
            id: "dept3",
            name: "运营部",
            value: 300,
            children: [
              { id: "team6", name: "市场推广", value: 150, children: [] },
              { id: "team7", name: "客户服务", value: 150, children: [] }
            ]
          }
        ]
      }
    }
    onChange(sampleData)
  }

  // 生成项目结构示例数据
  const generateProjectData = () => {
    const projectData: TreeData = {
      root: {
        id: "root",
        name: "项目结构",
        value: 500,
        children: [
          {
            id: "phase1",
            name: "第一阶段",
            value: 200,
            children: [
              { id: "task1", name: "需求分析", value: 50, children: [] },
              { id: "task2", name: "设计规划", value: 75, children: [] },
              { id: "task3", name: "原型制作", value: 75, children: [] }
            ]
          },
          {
            id: "phase2",
            name: "第二阶段",
            value: 200,
            children: [
              { id: "task4", name: "开发实现", value: 120, children: [] },
              { id: "task5", name: "测试验证", value: 80, children: [] }
            ]
          },
          {
            id: "phase3",
            name: "第三阶段",
            value: 100,
            children: [
              { id: "task6", name: "部署上线", value: 60, children: [] },
              { id: "task7", name: "维护优化", value: 40, children: [] }
            ]
          }
        ]
      }
    }
    onChange(projectData)
  }

  // 清空数据
  const clearData = () => {
    onChange({ root: { id: "", name: "", children: [] } })
  }

  // 计算树统计信息
  const getTreeStats = () => {
    const countNodes = (node: TreeNode): number => {
      let count = 1
      if (node.children) {
        count += node.children.reduce((sum, child) => sum + countNodes(child), 0)
      }
      return count
    }

    const getMaxDepth = (node: TreeNode, depth: number = 0): number => {
      if (!node.children || node.children.length === 0) {
        return depth
      }
      return Math.max(...node.children.map(child => getMaxDepth(child, depth + 1)))
    }

    const totalNodes = countNodes(data.root)
    const maxDepth = getMaxDepth(data.root)
    const hasData = data.root.id !== ""

    return { totalNodes, maxDepth, hasData }
  }

  const stats = getTreeStats()

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            树结构
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            快速操作
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {stats.totalNodes} 个节点，最大深度 {stats.maxDepth}
            </div>
            <Button variant="outline" size="sm" onClick={addRootNode}>
              <Plus className="h-4 w-4 mr-1" />
              添加根节点
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {stats.hasData ? (
              <div className="space-y-2">
                {renderNodeTree(data.root)}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无树状数据</p>
                <p className="text-xs">点击"添加根节点"开始创建</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={generateSampleData} variant="outline" className="h-20">
              <div className="text-center">
                <GitBranch className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">组织架构</div>
                <div className="text-xs text-muted-foreground">公司部门结构</div>
              </div>
            </Button>
            
            <Button onClick={generateProjectData} variant="outline" className="h-20">
              <div className="text-center">
                <Settings className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">项目结构</div>
                <div className="text-xs text-muted-foreground">开发项目流程</div>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button onClick={clearData} variant="outline" className="h-12 text-red-500 hover:text-red-700">
              <div className="text-center">
                <Trash2 className="w-4 h-4 mr-2" />
                清空所有数据
              </div>
            </Button>
          </div>

          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">数据统计</div>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <div>节点总数</div>
                <div className="text-lg font-semibold text-foreground">{stats.totalNodes}</div>
              </div>
              <div>
                <div>最大深度</div>
                <div className="text-lg font-semibold text-foreground">{stats.maxDepth}</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 