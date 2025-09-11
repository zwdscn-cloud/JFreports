"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getThemesByCategory, type ColorTheme } from "@/lib/color-themes"
import { Check, Palette } from "lucide-react"

interface ColorThemeSelectorProps {
  activeTheme: string
  onThemeChange: (themeId: string) => void
}

export function ColorThemeSelector({ activeTheme, onThemeChange }: ColorThemeSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("数据分析")

  const categories = ["数据分析", "商业品牌"]

  const renderThemeCard = (theme: ColorTheme) => (
    <Button
      key={theme.id}
      variant={activeTheme === theme.id ? "default" : "outline"}
      className="h-auto p-3 flex flex-col items-start relative group"
      onClick={() => onThemeChange(theme.id)}
    >
      {/* Color Preview */}
      <div className="flex gap-1 mb-2 w-full">
        {theme.colors.slice(0, 5).map((color, index) => (
          <div
            key={index}
            className="flex-1 h-4 rounded-sm first:rounded-l-md last:rounded-r-md"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Theme Info */}
      <div className="flex items-center justify-between w-full">
        <div className="text-left">
          <div className="text-xs font-medium">{theme.name}</div>
          <div className="text-xs text-muted-foreground">{theme.id}</div>
        </div>

        {activeTheme === theme.id && <Check className="w-4 h-4 text-primary" />}
      </div>

      {/* Gradient Preview (if available) */}
      {theme.gradients && (
        <div className="w-full h-2 rounded-sm mt-1 opacity-60" style={{ background: theme.gradients[0] }} />
      )}
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4" />
        <h3 className="text-sm font-medium">配色方案</h3>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-2">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <ScrollArea className="h-64">
              <div className="grid grid-cols-1 gap-2">{getThemesByCategory(category).map(renderThemeCard)}</div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* Custom Color Section */}
      <div className="pt-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
          <Palette className="w-4 h-4 mr-2" />
          自定义配色
        </Button>
      </div>
    </div>
  )
}
