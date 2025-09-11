"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartColorSelector, CompactColorSelector } from "@/components/chart-color-selector"
import { getThemesByCategory } from "@/lib/color-themes"

export default function ColorThemesExpanded() {
  const [selectedTheme, setSelectedTheme] = useState("DA001")

  const dataAnalyticsThemes = getThemesByCategory("数据分析")
  const businessBrandingThemes = getThemesByCategory("商业品牌")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">扩展配色方案展示</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 标准版本配色选择器 */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">标准版本配色选择器</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartColorSelector
                activeTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                size="md"
                showLabel={true}
              />
            </CardContent>
          </Card>

          {/* 紧凑版本配色选择器 */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">紧凑版本配色选择器</CardTitle>
            </CardHeader>
            <CardContent>
              <CompactColorSelector
                activeTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
              />
            </CardContent>
          </Card>
        </div>

        {/* 配色方案统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white/5 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">数据分析配色方案</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white/80">
                <p className="text-2xl font-bold text-white mb-2">{dataAnalyticsThemes.length} 个配色方案</p>
                <div className="space-y-2 text-sm">
                  {dataAnalyticsThemes.map((theme) => (
                    <div key={theme.id} className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {theme.colors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span>{theme.name} ({theme.id})</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">商业品牌配色方案</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white/80">
                <p className="text-2xl font-bold text-white mb-2">{businessBrandingThemes.length} 个配色方案</p>
                <div className="space-y-2 text-sm">
                  {businessBrandingThemes.map((theme) => (
                    <div key={theme.id} className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {theme.colors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span>{theme.name} ({theme.id})</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 新增配色方案说明 */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">新增配色方案说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-white/80">
                <h3 className="font-semibold mb-3 text-white">数据分析新增配色：</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>深空蓝 (DA009)</strong>: 深邃的蓝色系，适合专业数据分析</li>
                  <li>• <strong>翡翠绿 (DA010)</strong>: 清新的绿色系，适合环保类数据</li>
                  <li>• <strong>玫瑰金 (DA011)</strong>: 温暖的粉色系，适合女性用户数据</li>
                  <li>• <strong>极光紫 (DA012)</strong>: 神秘的紫色系，适合科技类数据</li>
                </ul>
              </div>
              
              <div className="text-white/80">
                <h3 className="font-semibold mb-3 text-white">商业品牌新增配色：</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>珊瑚粉 (BB004)</strong>: 温暖的珊瑚色系，适合时尚品牌</li>
                  <li>• <strong>森林绿 (BB005)</strong>: 自然的绿色系，适合环保品牌</li>
                  <li>• <strong>海洋蓝 (BB006)</strong>: 深邃的海洋色系，适合科技品牌</li>
                  <li>• <strong>香槟金 (BB007)</strong>: 高贵的金色系，适合奢侈品品牌</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <h3 className="font-semibold mb-3 text-white">配色方案特点：</h3>
              <div className="text-sm text-white/70 space-y-2">
                <p>✅ 每个配色方案都包含5个协调的颜色</p>
                <p>✅ 提供渐变效果，增强视觉层次</p>
                <p>✅ 支持不同图表类型的颜色应用</p>
                <p>✅ 配色方案总数：{dataAnalyticsThemes.length + businessBrandingThemes.length} 个</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
