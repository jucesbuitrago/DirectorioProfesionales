import { createContext } from 'react';

/**
 * Toast React Context (no default value)
 * Se mantiene en un archivo separado para cumplir con la regla
 * react-refresh/only-export-components (evitar exportar hooks/constantes
 * desde archivos que exportan componentes).
 */
export const ToastContext = createContext(null);