/**
 * Firebase Authentication Service
 * Maneja la autenticación de usuarios en Firebase usando signInAnonymously
 * Cada usuario anónimo se identifica con el UID de nuestro sistema
 */

import { getAuth, signInAnonymously, Auth, User } from 'firebase/auth';
import app from './config';

const auth: Auth = getAuth(app);

class FirebaseAuthService {
  private currentUser: User | null = null;
  private authPromise: Promise<User> | null = null;

  /**
   * Autentica al usuario en Firebase de forma anónima
   * Firebase necesita que el usuario esté autenticado para aplicar las reglas de seguridad
   */
  async signIn(): Promise<User> {
    // Si ya hay una autenticación en proceso, esperar a que termine
    if (this.authPromise) {
      return this.authPromise;
    }

    // Si ya hay un usuario autenticado, retornarlo
    if (this.currentUser) {
      return this.currentUser;
    }

    // Iniciar autenticación
    this.authPromise = signInAnonymously(auth)
      .then((userCredential) => {
        this.currentUser = userCredential.user;
        console.log('✅ Usuario autenticado en Firebase:', this.currentUser.uid);
        return this.currentUser;
      })
      .catch((error) => {
        console.error('❌ Error al autenticar en Firebase:', error);
        this.authPromise = null;
        
        // Mensaje de ayuda para errores comunes
        if (error.code === 'auth/configuration-not-found') {
          console.error(`
╔════════════════════════════════════════════════════════════════╗
║  🔥 Firebase Authentication no está habilitado                 ║
╠════════════════════════════════════════════════════════════════╣
║  1. Ve a: https://console.firebase.google.com/               ║
║  2. Selecciona tu proyecto                                     ║
║  3. Build → Authentication → Sign-in method                    ║
║  4. Habilita "Anonymous"                                       ║
╚════════════════════════════════════════════════════════════════╝
          `);
        }
        
        throw error;
      });

    return this.authPromise;
  }

  /**
   * Obtiene el usuario actual de Firebase
   */
  getCurrentUser(): User | null {
    return auth.currentUser || this.currentUser;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Espera a que Firebase Auth esté listo
   */
  async waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        this.currentUser = user;
        resolve(user);
      });
    });
  }

  /**
   * Cierra sesión de Firebase (raramente necesario)
   */
  async signOut(): Promise<void> {
    await auth.signOut();
    this.currentUser = null;
    this.authPromise = null;
    console.log('✅ Sesión de Firebase cerrada');
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export { auth };
