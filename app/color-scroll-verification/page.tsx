"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartColorSelector, CompactColorSelector } from "@/components/chart-color-selector"
import { getThemesByCategory } from "@/lib/color-themes"

export default function ColorScrollVerification() {
  const [selectedTheme, setSelectedTheme] = useState("DA001")

  const dataAnalyticsThemes = getThemesByCategory("数据分析")
  const businessBrandingThemes = getThemesByCategory("商业品牌")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">配色选择器滚动条验证</h1>
        
        <div className="space-y-8">
          {/* 标准版本配色选择器 - 验证滚动条 */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">标准版本配色选择器 (滚动条验证)</CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <ChartColorSelector
                activeTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                size="md"
                showLabel={true}
              />
            </CardContent>
          </Card>

          {/* 紧凑版本配色选择器 - 验证滚动条 */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">紧凑版本配色选择器 (滚动条验证)</CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <CompactColorSelector
                activeTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
              />
            </CardContent>
          </Card>
        </div>

        {/* 滚动条功能验证说明 */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">滚动条功能验证说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white/80 space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-white">滚动条行为：</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 当配色方案数量超出容器高度时，自动显示滚动条</li>
                  <li>• 当配色方案数量在容器高度内时，不显示滚动条</li>
                  <li>• 滚动条类型设置为 "auto"，根据内容自动显示/隐藏</li>
                  <li>• 支持鼠标滚轮、拖拽滚动条、键盘导航等多种操作方式</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-white">容器高度设置：</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 标准版本：h-72 (288px)</li>
                  <li>• 紧凑版本：h-52 (208px)</li>
                  <li>• 小尺寸标准版本：h-56 (224px)</li>
                  <li>• 内容超出这些高度时自动显示滚动条</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-white">验证要点：</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 数据分析分类有 {dataAnalyticsThemes.length} 个配色方案</li>
                  <li>• 商业品牌分类有 {businessBrandingThemes.length} 个配色方案</li>
                  <li>• 当配色方案超出容器高度时，右侧应出现滚动条</li>
                  <li>• 滚动操作应流畅，不会影响配色选择功能</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-white/20">
                <h3 className="font-semibold mb-2 text-white">当前状态：</h3>
                <div className="text-sm text-white/70">
                  <p>当前选中主题: {selectedTheme}</p>
                  <p>数据分析配色方案数量: {dataAnalyticsThemes.length}</p>
                  <p>商业品牌配色方案数量: {businessBrandingThemes.length}</p>
                  <p>总配色方案数量: {dataAnalyticsThemes.length + businessBrandingThemes.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 配色方案高度计算 */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">配色方案高度计算</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white/80 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-white">标准版本计算：</h4>
                  <div className="text-sm space-y-1">
                    <p>• 容器高度: 288px (h-72)</p>
                    <p>• 单个配色卡片高度: ~80px (包含间距)</p>
                    <p>• 可显示配色数量: 3-4个</p>
                    <p>• 超出时显示滚动条: 是</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-white">紧凑版本计算：</h4>
                  <div className="text-sm space-y-1">
                    <p>• 容器高度: 208px (h-52)</p>
                    <p>• 单个配色卡片高度: ~60px (包含间距)</p>
                    <p>• 可显示配色数量: 3-4个</p>
                    <p>• 超出时显示滚动条: 是</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <h4 className="font-semibold mb-2 text-white">滚动条触发条件：</h4>
                <div className="text-sm">
                  <p>当配色方案数量 × 单个卡片高度 > 容器高度时，自动显示滚动条</p>
                  <p>例如：{dataAnalyticsThemes.length}个配色 × 80px ≈ {dataAnalyticsThemes.length * 80}px > 288px ✓</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作测试指南 */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">操作测试指南</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white/80 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border border-white/10 rounded-lg">
                  <h4 className="font-semibold mb-2 text-white">1. 验证滚动条显示</h4>
                  <p className="text-sm">检查右侧是否出现滚动条，确认内容超出容器高度</p>
                </div>
                <div className="p-3 border border-white/10 rounded-lg">
                  <h4 className="font-semibold mb-2 text-white">2. 测试滚动功能</h4>
                  <p className="text-sm">使用鼠标滚轮或拖拽滚动条，验证滚动是否流畅</p>
                </div>
                <div className="p-3 border border-white/10 rounded-lg">
                  <h4 className="font-semibold mb-2 text-white">3. 测试配色选择</h4>
                  <p className="text-sm">滚动到不同位置，点击配色方案，确认选择功能正常</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
