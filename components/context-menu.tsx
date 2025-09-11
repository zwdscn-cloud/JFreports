"use client"

import * as React from "react"
import { ArrowUpIcon, ArrowDownIcon, Layers } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface ContextMenuComponentProps {
  children: React.ReactNode
  onLayerUp?: () => void
  onLayerDown?: () => void
  currentLayer?: number
  totalLayers?: number
}

export function ContextMenuComponent({
  children,
  onLayerUp,
  onLayerDown,
  currentLayer = 0,
  totalLayers = 0,
}: ContextMenuComponentProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Layers className="mr-2 h-4 w-4" />
            <span>图层</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {currentLayer + 1}/{totalLayers}
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              onClick={onLayerUp}
              disabled={currentLayer >= totalLayers - 1}
            >
              <ArrowUpIcon className="mr-2 h-4 w-4" />
              <span>上移一层</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={onLayerDown}
              disabled={currentLayer <= 0}
            >
              <ArrowDownIcon className="mr-2 h-4 w-4" />
              <span>下移一层</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
