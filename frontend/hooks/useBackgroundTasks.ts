/**
 * Hook para manejar background tasks con progreso
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

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

interface UseBackgroundTasksReturn {
  tasks: BackgroundTask[];
  addTask: (task: Omit<BackgroundTask, 'id' | 'status' | 'progress' | 'createdAt'>) => string;
  updateProgress: (taskId: string, progress: number) => void;
  completeTask: (taskId: string) => void;
  failTask: (taskId: string, error: string) => void;
  retryTask: (taskId: string) => void;
  cancelTask: (taskId: string) => void;
  dismissTask: (taskId: string) => void;
  clearCompleted: () => void;
}

export function useBackgroundTasks(): UseBackgroundTasksReturn {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const taskIdCounter = useRef(0);

  const addTask = useCallback((task: Omit<BackgroundTask, 'id' | 'status' | 'progress' | 'createdAt'>) => {
    const id = `task-${++taskIdCounter.current}`;
    const newTask: BackgroundTask = {
      ...task,
      id,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    setTasks((prev) => [...prev, newTask]);
    
    toast.info(`Tarea iniciada: ${task.fileName}`, {
      description: 'La tarea se ejecutará en segundo plano',
    });

    return id;
  }, []);

  const updateProgress = useCallback((taskId: string, progress: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: 'processing' as const, progress: Math.min(100, Math.max(0, progress)) }
          : task
      )
    );
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date(),
            }
          : task
      )
    );

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      toast.success(`Completado: ${task.fileName}`);
    }
  }, [tasks]);

  const failTask = useCallback((taskId: string, error: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'failed' as const,
              error,
              completedAt: new Date(),
            }
          : task
      )
    );

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      toast.error(`Error: ${task.fileName}`, {
        description: error,
      });
    }
  }, [tasks]);

  const retryTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'pending' as const,
              progress: 0,
              error: undefined,
              completedAt: undefined,
            }
          : task
      )
    );

    toast.info('Reintentando tarea...');
  }, []);

  const cancelTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'failed' as const,
              error: 'Cancelado por el usuario',
              completedAt: new Date(),
            }
          : task
      )
    );

    toast.info('Tarea cancelada');
  }, []);

  const dismissTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => task.status !== 'completed'));
    toast.success('Tareas completadas limpiadas');
  }, []);

  return {
    tasks,
    addTask,
    updateProgress,
    completeTask,
    failTask,
    retryTask,
    cancelTask,
    dismissTask,
    clearCompleted,
  };
}

/**
 * Ejemplo de uso:
 * 
 * const { tasks, addTask, updateProgress, completeTask, failTask } = useBackgroundTasks();
 * 
 * const handleFileUpload = async (file: File) => {
 *   const taskId = addTask({
 *     type: 'image_upload',
 *     fileName: file.name,
 *     fileSize: file.size,
 *   });
 * 
 *   try {
 *     // Simular upload con progreso
 *     for (let i = 0; i <= 100; i += 10) {
 *       await new Promise(resolve => setTimeout(resolve, 200));
 *       updateProgress(taskId, i);
 *     }
 *     completeTask(taskId);
 *   } catch (error) {
 *     failTask(taskId, error.message);
 *   }
 * };
 */
