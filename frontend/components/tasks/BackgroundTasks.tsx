'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, XCircle, Loader2, FileUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BackgroundTask {
  id: string;
  type: 'image_upload' | 'video_processing' | 'pdf_generation' | 'export' | 'import';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileName: string;
  fileSize?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface BackgroundTasksProps {
  tasks: BackgroundTask[];
  onRetry?: (taskId: string) => void;
  onCancel?: (taskId: string) => void;
  onDismiss?: (taskId: string) => void;
}

const taskTypeLabels = {
  image_upload: 'Subiendo imagen',
  video_processing: 'Procesando video',
  pdf_generation: 'Generando PDF',
  export: 'Exportando datos',
  import: 'Importando datos',
};

const taskTypeIcons = {
  image_upload: Upload,
  video_processing: FileUp,
  pdf_generation: FileUp,
  export: Upload,
  import: Upload,
};

export function BackgroundTasks({ tasks, onRetry, onCancel, onDismiss }: BackgroundTasksProps) {
  // Future feature: expandable task details
  // const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  // const toggleTask = (taskId: string) => { ... }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const seconds = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No hay tareas en segundo plano</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Tareas en Segundo Plano
          <Badge variant="secondary" className="ml-auto">
            {tasks.filter((t) => t.status === 'processing').length} activas
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.map((task) => {
          const Icon = taskTypeIcons[task.type];
          // Future: const isExpanded = expandedTasks.has(task.id);

          return (
            <div
              key={task.id}
              className={cn(
                'border rounded-lg p-4 space-y-3 transition-colors',
                task.status === 'completed' && 'bg-green-50 border-green-200',
                task.status === 'failed' && 'bg-red-50 border-red-200',
                task.status === 'processing' && 'bg-blue-50 border-blue-200'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    task.status === 'completed' && 'bg-green-100',
                    task.status === 'failed' && 'bg-red-100',
                    task.status === 'processing' && 'bg-blue-100'
                  )}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : task.status === 'failed' ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : task.status === 'processing' ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{task.fileName}</span>
                    {task.fileSize && (
                      <span className="text-xs text-slate-500">{formatFileSize(task.fileSize)}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mb-2">{taskTypeLabels[task.type]}</p>

                  {task.status === 'processing' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{task.progress}%</span>
                        <span className="text-slate-500">
                          {formatDuration(task.createdAt)}
                        </span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        Completado en {formatDuration(task.createdAt, task.completedAt)}
                      </span>
                    </div>
                  )}

                  {task.status === 'failed' && task.error && (
                    <div className="flex items-start gap-2 text-xs text-red-700 mt-2">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{task.error}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {task.status === 'failed' && onRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRetry(task.id)}
                    >
                      Reintentar
                    </Button>
                  )}

                  {task.status === 'processing' && onCancel && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCancel(task.id)}
                    >
                      Cancelar
                    </Button>
                  )}

                  {(task.status === 'completed' || task.status === 'failed') && onDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDismiss(task.id)}
                    >
                      Descartar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
