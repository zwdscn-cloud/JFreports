"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface ModelSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onModelSelect: (modelUrl: string) => void
}

export function ModelSearchDialog({
  open,
  onOpenChange,
  onModelSelect
}: ModelSearchDialogProps) {
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  interface SearchResult {
    title: string;
    titlePicName: string;
    webGlFileName: string;
  }

  interface ApiResponse {
    code: number;
    msg: string;
    data: Array<{
      title: string;
      titlePicName: string;
      webGlFileName: string;
      [key: string]: any;
    }>;
  }

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!searchValue.trim()) return

    setIsSearching(true)
    try {
      const title = searchValue.trim()
            const formData = new FormData()
      formData.append('title', title)
      formData.append('index', '0')

      const response = await fetch("https://data.g5bk.com:8443/MojieProject/artic/searchArtic.do", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        throw new Error("搜索请求失败")
      }

      const result = await response.json() as ApiResponse
      if (result.code === 0 && Array.isArray(result.data)) {
        setSearchResults(result.data.map(item => ({
          title: item.title,
          titlePicName: item.titlePicName,
          webGlFileName: item.webGlFileName
        })))
        setError("")
      } else {
        setError(result.msg || "搜索失败")
        setSearchResults([])
      }

    } catch (error) {
      console.error("搜索出错:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Search className="w-5 h-5 text-blue-500" />
            搜索呱虎百科模型
          </DialogTitle>
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              搜索说明
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• 搜索范围包括模型标题和文章内容</li>
              <li>• 点击搜索结果可直接使用对应模型</li>
            </ul>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 pr-4 h-10"
                  placeholder="输入关键词搜索模型..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button 
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleSearch}
                disabled={isSearching || !searchValue.trim()}
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>搜索中</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>搜索</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {error && (
              <p className="text-sm text-red-500 mb-2">{error}</p>
            )}
            
            {searchResults.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 -mr-2">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="group flex gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => {
                      // 从webGlFileName中提取实际的GLB文件URL
                      const glbUrl = result.webGlFileName.split("name=../")?.[1] || ""
                      const modelUrl = glbUrl ? `https://data.g5bk.com:8443/MojieProject/file/webGlFile/${glbUrl}` : ""
                      onModelSelect(modelUrl)
                      onOpenChange(false)
                    }}
                  >
                    <div className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                      <img
                        src={result.titlePicName}
                        alt={result.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium mb-1.5 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 break-words line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 leading-relaxed">
                        {result.webGlFileName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isSearching && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchValue.trim() ? "未找到相关模型" : "输入关键词搜索模型"}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
