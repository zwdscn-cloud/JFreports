"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Save, FolderOpen, Undo, Redo, Play, Settings, User, Bell, Search, Eye, Edit, Palette, Sun, Moon, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColorThemeSelector } from "@/components/color-theme-selector"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DashboardToolbarProps {
  activeTheme: string
  onThemeChange: (theme: string) => void
  isViewMode?: boolean
  onModeToggle?: () => void
  onSave?: (fileName?: string) => void
  onLoad?: (file: File) => void
  onClear?: () => void
  isDarkMode?: boolean
  onDarkModeToggle?: () => void
}

export function DashboardToolbar({
  activeTheme,
  onThemeChange,
  isViewMode = false,
  onModeToggle,
  onSave,
  onLoad,
  onClear,
  isDarkMode = false,
  onDarkModeToggle,
}: DashboardToolbarProps) {
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveFileName, setSaveFileName] = useState("")

  // 生成默认文件名 - 使用useCallback避免无限循环
  const getDefaultFileName = useCallback(() => {
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    return `dashboard-${dateStr}`
  }, [])

  // 处理文件加载 - 使用useCallback避免无限循环
  const handleFileLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onLoad) {
      onLoad(file)
    }
    event.target.value = ""
  }, [onLoad])

  // 处理保存按钮点击 - 使用useCallback避免无限循环
  const handleSaveClick = useCallback(() => {
    setSaveFileName(getDefaultFileName())
    setShowSaveDialog(true)
  }, [getDefaultFileName])

  // 处理清除按钮点击 - 使用useCallback避免无限循环
  const handleClearClick = useCallback(() => {
    setShowClearDialog(true)
  }, [])

  // 处理暗色模式切换 - 使用useCallback避免无限循环
  const handleDarkModeToggle = useCallback(() => {
    if (onDarkModeToggle) {
      onDarkModeToggle()
    }
  }, [onDarkModeToggle])

  // 处理模式切换 - 使用useCallback避免无限循环
  const handleModeToggle = useCallback(() => {
    if (onModeToggle) {
      onModeToggle()
    }
  }, [onModeToggle])

  // 计算模式文本 - 使用useMemo避免重复计算
  const modeText = useMemo(() => isViewMode ? "查看模式" : "编辑模式", [isViewMode])
  const themeText = useMemo(() => isDarkMode ? "黑夜" : "白天", [isDarkMode])
  const modeIcon = useMemo(() => isViewMode ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />, [isViewMode])

  // 处理取消清除对话框
  const handleCancelClear = useCallback(() => {
    setShowClearDialog(false)
  }, [])

  // 处理确认清除
  const handleConfirmClear = useCallback(() => {
    onClear?.()
    setShowClearDialog(false)
  }, [onClear])

  // 处理取消保存对话框
  const handleCancelSave = useCallback(() => {
    setShowSaveDialog(false)
    setSaveFileName("")
  }, [])

  // 处理确认保存
  const handleConfirmSave = useCallback(() => {
    const fileName = saveFileName.trim() || getDefaultFileName()
    onSave?.(fileName)
    setShowSaveDialog(false)
    setSaveFileName("")
  }, [saveFileName, getDefaultFileName, onSave])

  // 处理保存文件名输入
  const handleSaveFileNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveFileName(e.target.value)
  }, [])

  // 处理保存文件名键盘事件
  const handleSaveFileNameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const fileName = saveFileName.trim() || getDefaultFileName()
      onSave?.(fileName)
      setShowSaveDialog(false)
      setSaveFileName("")
    }
  }, [saveFileName, getDefaultFileName, onSave])

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
            JF
          </div>
          <span className="text-sm font-medium">巨烽会表</span>
        </div>

        <div className="h-4 w-px bg-border mx-2" />

        {/* 配色主题选择器 */}
     

        {!isViewMode && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileLoad}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="load-file"
                  />
                  <Button variant="ghost" size="sm" asChild>
                    <label htmlFor="load-file" className="cursor-pointer">
                      <FolderOpen className="w-4 h-4 mr-1" />
                      打开
                    </label>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>打开保存的仪表板文件</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleSaveClick}>
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>保存当前仪表板</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearClick}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  清除
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>清除画布上的所有内容</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border mx-2" />

           
          </>
        )}

       
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索图表、数据源..." className="pl-10 bg-muted/50" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>搜索图表和数据源</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 mr-4">
                              <Label htmlFor="view-mode" className="text-sm">
                  {modeText}
                </Label>
              <Switch id="view-mode" checked={isViewMode} onCheckedChange={handleModeToggle} />
                              {modeIcon}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>切换查看/编辑模式</p>
          </TooltipContent>
        </Tooltip>


        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>系统设置</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>通知中心</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>用户中心</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border mx-2" />

        <div className="text-xs text-muted-foreground">95.5%</div>

        {/* 明暗主题切换 - 放在最右边 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDarkModeToggle}
              className="flex items-center gap-3 px-3"
            >
              <div className="relative">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-0 left-0" />
              </div>
              <span className="text-xs font-medium">
                {themeText}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>切换明暗主题</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* 清除确认弹窗 */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              确认清除画布
            </DialogTitle>
            <DialogDescription>
              此操作将删除画布上的所有图表和内容，且无法撤销。您确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelClear}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmClear}
            >
              确认清除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 保存对话框 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-blue-600" />
              保存仪表板
            </DialogTitle>
            <DialogDescription>
              请输入文件名，文件将保存为JSON格式
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="save-filename" className="text-sm font-medium">
              文件名
            </Label>
            <Input
              id="save-filename"
              placeholder={getDefaultFileName()}
              value={saveFileName}
              onChange={handleSaveFileNameChange}
              onKeyDown={handleSaveFileNameKeyDown}
              className="mt-2"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              建议文件名：{getDefaultFileName()}.json
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelSave}
            >
              取消
            </Button>
            <Button 
              onClick={handleConfirmSave}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
