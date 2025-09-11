'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Camera, Lightbulb, Eye, Save, RotateCcw, Plus, Trash2, Play, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useCameraState } from '@/components/camera-state-context';
import { ModelSearchDialog } from '@/components/model-search-dialog';

interface ViewPreset {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov: number;
  target?: { x: number; y: number; z: number };
  description?: string;
  createdAt?: string;
}

interface ThreeDModelDataEditorProps {
  data?: {
    modelUrl?: string;
    environmentPreset?: string;
    ambientIntensity?: number;
    ambientColor?: string;
    directionalIntensity?: number;
    directionalColor?: string;
    viewPresets?: ViewPreset[];
    currentView?: string;
    // 视角动画播放设置
    viewAnimationEnabled?: boolean;
    viewAnimationInterval?: number; // 播放间隔（毫秒）
  };
  onDataChange?: (data: any) => void;
}

const environmentPresets = [
  { id: 'studio', name: '工作室' },
  { id: 'outdoor', name: '户外' },
  { id: 'sunset', name: '日落' },
  { id: 'night', name: '夜晚' },
  { id: 'warm', name: '暖光' }
];

export default function ThreeDModelDataEditor({ data, onDataChange }: ThreeDModelDataEditorProps) {
  const [viewPresets, setViewPresets] = useState<ViewPreset[]>(data?.viewPresets || []);
  const [currentView, setCurrentView] = useState(data?.currentView || '');
  
  // 视角管理状态
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');

  // 折叠状态管理
  const [isDataSettingsOpen, setIsDataSettingsOpen] = useState(true);
  const [isEnvironmentSettingsOpen, setIsEnvironmentSettingsOpen] = useState(false);
  
  const { getCurrentCameraState } = useCameraState();

  const handleDataChange = (key: string, value: any) => {
    if (onDataChange) {
      onDataChange({
        ...data,
        [key]: value
      });
    }
  };

  // 生成唯一ID
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // 创建新视角
  const createView = useCallback(() => {
    if (!newViewName.trim()) return;
    
    // 获取当前相机状态
    const currentState = getCurrentCameraState?.();
    if (!currentState) {
      console.warn('无法获取当前相机状态，使用默认值');
    }
    
    const newView: ViewPreset = {
      id: generateId(),
      name: newViewName.trim(),
      description: newViewDescription.trim(),
      position: currentState?.position || { x: 5, y: 5, z: 5 },
      rotation: currentState?.rotation || { x: 0, y: 0, z: 0 },
              fov: currentState?.fov || 45,
      target: currentState?.target || { x: 0, y: 0, z: 0 },
      createdAt: new Date().toISOString()
    };
    
    const updatedViewPresets = [...viewPresets, newView];
    setViewPresets(updatedViewPresets);
    
    if (onDataChange) {
      onDataChange({
        ...data,
        viewPresets: updatedViewPresets,
        currentView: newView.id
      });
    }
    
    // 重置表单
    setNewViewName('');
    setNewViewDescription('');
    setShowViewDialog(false);
  }, [newViewName, newViewDescription, viewPresets, data, onDataChange, generateId]);

  // 切换到指定视角
  const switchToView = useCallback((viewId: string) => {
    setCurrentView(viewId);
    if (onDataChange) {
      onDataChange({
        ...data,
        currentView: viewId
      });
    }
  }, [data, onDataChange]);

  // 删除视角
  const deleteView = useCallback((viewId: string) => {
    const updatedViewPresets = viewPresets.filter(v => v.id !== viewId);
    setViewPresets(updatedViewPresets);
    
    if (onDataChange) {
      onDataChange({
        ...data,
        viewPresets: updatedViewPresets,
        currentView: currentView === viewId ? undefined : currentView
      });
    }
  }, [viewPresets, currentView, data, onDataChange]);

  // 打开创建视角对话框
  const openCreateViewDialog = useCallback(() => {
    setShowViewDialog(true);
  }, []);

  // 取消创建视角
  const cancelCreateView = useCallback(() => {
    setShowViewDialog(false);
    setNewViewName('');
    setNewViewDescription('');
  }, []);

  const resetView = () => {
    setCurrentView('');
    if (onDataChange) {
      onDataChange({
        ...data,
        currentView: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 数据面板 - 可折叠 */}
      <Collapsible open={isDataSettingsOpen} onOpenChange={setIsDataSettingsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  数据设置
                </div>
                {isDataSettingsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
          {/* 模型URL */}
          <div className="space-y-2">
            <Label htmlFor="modelUrl">3D模型URL</Label>
            <div className="flex gap-2">
              <Input
                id="modelUrl"
                placeholder="输入GLB文件的URL地址"
                value={data?.modelUrl || ''}
                onChange={(e) => handleDataChange('modelUrl', e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSearchDialog(true)}
                title="搜索呱虎百科模型"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              支持GLB/GLTF格式的3D模型文件，请输入完整的URL地址
            </p>
            <p className="text-xs text-muted-foreground">
              注意：确保URL支持CORS跨域访问，建议使用HTTPS协议
            </p>
          </div>

          <Separator />

          {/* 视角预设 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              视角控制
            </Label>
            
            {/* 视角动画播放控制 */}
            {viewPresets.length > 0 && (
              <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    视角动画播放
                  </Label>
                  <Switch
                    checked={data?.viewAnimationEnabled || false}
                    onCheckedChange={(checked) => {
                      handleDataChange('viewAnimationEnabled', checked);
                    }}
                  />
                </div>
                
                {data?.viewAnimationEnabled && (
                  <div className="space-y-2">
                    <Label className="text-xs">播放间隔</Label>
                    <Select
                      value={data?.viewAnimationInterval?.toString() || '3000'}
                      onValueChange={(value) => {
                        handleDataChange('viewAnimationInterval', parseInt(value));
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1秒</SelectItem>
                        <SelectItem value="2000">2秒</SelectItem>
                        <SelectItem value="3000">3秒</SelectItem>
                        <SelectItem value="5000">5秒</SelectItem>
                        <SelectItem value="10000">10秒</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      系统将按照视角列表顺序循环播放
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={openCreateViewDialog} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                创建视角
              </Button>
              <Button onClick={resetView} size="sm" variant="outline">
                <RotateCcw className="w-4 h-4 mr-1" />
                重置视角
              </Button>
            </div>
            
            {viewPresets.length > 0 && (
              <div className="space-y-2">
                <Label>已保存的视角</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {viewPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                        currentView === preset.id
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => switchToView(preset.id)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            <Play className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-medium truncate">{preset.name}</span>
                            {currentView === preset.id && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1 rounded">
                                当前
                              </span>
                            )}
                          </button>
                        </div>
                        
                        {/* 动画播放状态指示器 */}
                        {data?.viewAnimationEnabled && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 dark:text-green-400">
                              动画播放中
                            </span>
                          </div>
                        )}
                        {preset.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {preset.description}
                          </p>
                        )}
                        {preset.createdAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(preset.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteView(preset.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {viewPresets.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无保存的视角</p>
                <p className="text-xs">点击"创建视角"保存当前视角</p>
              </div>
            )}
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 设置面板 - 可折叠 */}
      <Collapsible open={isEnvironmentSettingsOpen} onOpenChange={setIsEnvironmentSettingsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  环境设置
                </div>
                {isEnvironmentSettingsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
          {/* 环境预设 */}
          <div className="space-y-2">
            <Label>环境预设</Label>
            <Select
              value={data?.environmentPreset || ''}
              onValueChange={(value) => handleDataChange('environmentPreset', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择环境预设" />
              </SelectTrigger>
              <SelectContent>
                {environmentPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              选择预设的环境灯光和颜色配置
            </p>
          </div>

          <Separator />

          {/* 环境光设置 */}
          <div className="space-y-2">
            <Label>环境光强度</Label>
            <Input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={data?.ambientIntensity || 0.3}
              onChange={(e) => handleDataChange('ambientIntensity', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>环境光颜色</Label>
            <Input
              type="color"
              value={data?.ambientColor || '#ffffff'}
              onChange={(e) => handleDataChange('ambientColor', e.target.value)}
            />
          </div>

          <Separator />

          {/* 方向光设置 */}
          <div className="space-y-2">
            <Label>方向光强度</Label>
            <Input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={data?.directionalIntensity || 0.8}
              onChange={(e) => handleDataChange('directionalIntensity', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>方向光颜色</Label>
            <Input
              type="color"
              value={data?.directionalColor || '#ffffff'}
              onChange={(e) => handleDataChange('directionalColor', e.target.value)}
            />
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 创建视角对话框 */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              创建新视角
            </DialogTitle>
            <DialogDescription>
              保存当前相机位置和角度作为新的视角预设
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="view-name" className="text-sm font-medium">
                视角名称 *
              </Label>
              <Input
                id="view-name"
                placeholder="例如：正面视角、侧面视角、俯视角度..."
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            
            <div>
              <Label htmlFor="view-description" className="text-sm font-medium">
                描述（可选）
              </Label>
              <Input
                id="view-description"
                placeholder="添加视角的详细描述..."
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            
            {/* 当前相机信息预览 */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">当前相机状态</h4>
              {(() => {
                const currentState = getCurrentCameraState?.();
                return currentState ? (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">位置:</span>
                      <div className="ml-2">X: {currentState.position.x.toFixed(2)}</div>
                      <div className="ml-2">Y: {currentState.position.y.toFixed(2)}</div>
                      <div className="ml-2">Z: {currentState.position.z.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="font-medium">FOV:</span>
                      <div className="ml-2">{currentState.fov.toFixed(1)}°</div>
                      {currentState.target && (
                        <>
                          <span className="font-medium mt-2 block">目标:</span>
                          <div className="ml-2">X: {currentState.target.x.toFixed(2)}</div>
                          <div className="ml-2">Y: {currentState.target.y.toFixed(2)}</div>
                          <div className="ml-2">Z: {currentState.target.z.toFixed(2)}</div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    相机状态将在3D模型加载后显示
                  </div>
                );
              })()}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelCreateView}>
              取消
            </Button>
            <Button 
              onClick={createView}
              disabled={!newViewName.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              保存视角
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 模型搜索对话框 */}
      <ModelSearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        onModelSelect={(modelUrl) => {
          handleDataChange('modelUrl', modelUrl);
          setShowSearchDialog(false);
        }}
      />
    </div>
  );
}
