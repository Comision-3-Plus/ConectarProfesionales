/**
 * Storage Service - Firebase Storage
 * Servicio para almacenamiento de imágenes y archivos
 * 
 * Estructura de almacenamiento:
 * - chat_images/{chatId}/{timestamp}_{filename}
 * - portfolio/{userId}/{timestamp}_{filename}
 * - profile_photos/{userId}/{timestamp}_{filename}
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
  StorageReference,
} from 'firebase/storage';
import { storage } from './config';

// ============================================================================
// TIPOS
// ============================================================================

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

// ============================================================================
// STORAGE SERVICE
// ============================================================================

class StorageService {
  /**
   * Subir imagen de chat
   */
  async uploadChatImage(
    chatId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `chat_images/${chatId}/${fileName}`);

      if (onProgress) {
        // Upload con progreso
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              };
              onProgress(progress);
            },
            (error) => {
              console.error('❌ Error al subir imagen:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Imagen subida:', downloadURL);
              resolve(downloadURL);
            }
          );
        });
      } else {
        // Upload simple
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        console.log('✅ Imagen subida:', downloadURL);
        return downloadURL;
      }
    } catch (error) {
      console.error('❌ Error al subir imagen de chat:', error);
      throw error;
    }
  }

  /**
   * Subir imagen de portfolio
   */
  async uploadPortfolioImage(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `portfolio/${userId}/${fileName}`);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              };
              onProgress(progress);
            },
            (error) => {
              console.error('❌ Error al subir imagen:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Imagen de portfolio subida:', downloadURL);
              resolve(downloadURL);
            }
          );
        });
      } else {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        console.log('✅ Imagen de portfolio subida:', downloadURL);
        return downloadURL;
      }
    } catch (error) {
      console.error('❌ Error al subir imagen de portfolio:', error);
      throw error;
    }
  }

  /**
   * Subir foto de perfil
   */
  async uploadProfilePhoto(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `profile_photos/${userId}/${fileName}`);

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              };
              onProgress(progress);
            },
            (error) => {
              console.error('❌ Error al subir foto:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Foto de perfil subida:', downloadURL);
              resolve(downloadURL);
            }
          );
        });
      } else {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        console.log('✅ Foto de perfil subida:', downloadURL);
        return downloadURL;
      }
    } catch (error) {
      console.error('❌ Error al subir foto de perfil:', error);
      throw error;
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      console.log('✅ Archivo eliminado');
    } catch (error) {
      console.error('❌ Error al eliminar archivo:', error);
      throw error;
    }
  }

  /**
   * Validar archivo de imagen
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)',
      };
    }

    // Verificar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 5MB',
      };
    }

    return { valid: true };
  }

  /**
   * Comprimir imagen antes de subir (opcional)
   */
  async compressImage(file: File, maxWidth: number = 1920): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Error al comprimir imagen'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }
}

// Exportar instancia singleton
export const storageService = new StorageService();
