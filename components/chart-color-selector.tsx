"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getThemesByCategory, getThemeById, type ColorTheme } from "@/lib/color-themes"
import { Check, Palette, Settings } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ChartColorSelectorProps {
  activeTheme: string
  onThemeChange: (themeId: string) => void
  size?: "sm" | "md"
  showLabel?: boolean
}

export function ChartColorSelector({ 
  activeTheme, 
  onThemeChange, 
  size = "md",
  showLabel = true 
}: ChartColorSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("数据分析")
  const categories = ["数据分析", "商业品牌"]

  // 当切换分类时，如果当前主题不在新分类中，自动选择新分类的第一个主题
  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory)
    const themesInNewCategory = getThemesByCategory(newCategory)
    const currentThemeInNewCategory = themesInNewCategory.find(t => t.id === activeTheme)
    
    if (!currentThemeInNewCategory && themesInNewCategory.length > 0) {
      onThemeChange(themesInNewCategory[0].id)
    }
  }

  // 当activeTheme改变时，确保activeCategory与当前主题的分类一致
  useEffect(() => {
    const currentTheme = getThemeById(activeTheme)
    if (currentTheme && currentTheme.category !== activeCategory) {
      setActiveCategory(currentTheme.category)
    }
  }, [activeTheme, activeCategory])

  const renderThemeCard = (theme: ColorTheme) => (
    <Button
      key={theme.id}
      variant={activeTheme === theme.id ? "default" : "outline"}
      className={`h-auto p-4 flex flex-col items-start gap-3 relative group w-full ${
        size === "sm" ? "text-xs" : "text-sm"
      }`}
      onClick={() => onThemeChange(theme.id)}
    >
      {/* Color Preview */}
      <div className="flex gap-1 w-full">
        {theme.colors.slice(0, 5).map((color, index) => (
          <div
            key={index}
            className={`flex-1 rounded-sm first:rounded-l-md last:rounded-r-md ${
              size === "sm" ? "h-5" : "h-6"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Theme Info */}
      <div className="flex items-center justify-between w-full">
        <div className="text-left">
          <div className={`font-medium ${size === "sm" ? "text-sm" : "text-base"}`}>
            {theme.name}
          </div>
          <div className={`text-muted-foreground ${size === "sm" ? "text-xs" : "text-sm"}`}>
            {theme.id}
          </div>
        </div>

        {activeTheme === theme.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
      </div>

      {/* Gradient Preview (if available) */}
      {theme.gradients && (
        <div 
          className={`w-full rounded-sm opacity-60 ${
            size === "sm" ? "h-2" : "h-3"
          }`} 
          style={{ background: theme.gradients[0] }} 
        />
      )}
    </Button>
  )

  const currentTheme = getThemeById(activeTheme)

  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <h3 className="text-sm font-medium">图表配色</h3>
        </div>
      )}

      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className={`w-full ${size === "sm" ? "h-8" : "h-9"}`}>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className={`flex-1 text-xs ${size === "sm" ? "text-xs" : "text-sm"}`}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-3 w-full">
            <ScrollArea className={`w-full ${size === "sm" ? "h-[190px]" : "h-[394px]"}`} type="auto">
              <div className="space-y-3 w-full pr-4">
                {getThemesByCategory(category).map(renderThemeCard)}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* Current Theme Preview */}
      {currentTheme && (
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-3">当前配色</div>
          <div className="flex gap-1 mb-3">
            {currentTheme.colors.slice(0, 5).map((color, index) => (
              <div
                key={index}
                className={`flex-1 rounded-sm first:rounded-l-md last:rounded-r-md ${
                  size === "sm" ? "h-4" : "h-5"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="text-xs font-medium">{currentTheme.name}</div>
        </div>
      )}
    </div>
  )
}

// 紧凑版本的配色选择器，用于属性面板
export function CompactColorSelector({ 
  activeTheme, 
  onThemeChange 
}: {
  activeTheme: string
  onThemeChange: (themeId: string) => void
}) {
  const [activeCategory, setActiveCategory] = useState("数据分析")
  const categories = ["数据分析", "商业品牌"]

  // 当切换分类时，如果当前主题不在新分类中，自动选择新分类的第一个主题
  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory)
    const themesInNewCategory = getThemesByCategory(newCategory)
    const currentThemeInNewCategory = themesInNewCategory.find(t => t.id === activeTheme)
    
    if (!currentThemeInNewCategory && themesInNewCategory.length > 0) {
      onThemeChange(themesInNewCategory[0].id)
    }
  }

  // 当activeTheme改变时，确保activeCategory与当前主题的分类一致
  useEffect(() => {
    const currentTheme = getThemeById(activeTheme)
    if (currentTheme && currentTheme.category !== activeCategory) {
      setActiveCategory(currentTheme.category)
    }
  }, [activeTheme, activeCategory])

  const renderThemeCard = (theme: ColorTheme) => (
    <Button
      key={theme.id}
      variant={activeTheme === theme.id ? "default" : "outline"}
      className="h-auto p-3 flex flex-col items-start gap-2 relative group text-xs w-full"
      onClick={() => onThemeChange(theme.id)}
    >
      {/* Color Preview */}
      <div className="flex gap-1 w-full">
        {theme.colors.slice(0, 4).map((color, index) => (
          <div
            key={index}
            className="flex-1 h-4 rounded-sm first:rounded-l-md last:rounded-r-md"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Theme Name */}
      <div className="text-sm font-medium text-center w-full">
        {theme.name}
      </div>

      {activeTheme === theme.id && (
        <Check className="w-4 h-4 text-primary absolute top-2 right-2" />
      )}
    </Button>
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Palette className="w-3 h-3" />
        <span className="text-xs font-medium">配色方案</span>
      </div>

      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="w-full h-7">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="flex-1 text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-2 w-full">
            <ScrollArea className="w-full h-[330px]" type="auto">
              <div className="space-y-3 w-full pr-4">
                {getThemesByCategory(category).map(renderThemeCard)}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
