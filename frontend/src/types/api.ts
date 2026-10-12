// ╔══════════════════════════════════════════════════════════════════╗
// ║  ❗ FORMATO DE ERRORES DEL BACKEND                                  ║
// ║  Compañeros: esta es la forma del JSON que esperamos cuando algo   ║
// ║  falla (lo que devuelve su @ControllerAdvice o el error por        ║
// ║  defecto de Spring Boot). Si usan otros nombres, ajústenlos aquí.  ║
// ╚══════════════════════════════════════════════════════════════════╝
export interface ApiErrorDTO {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  mensaje?: string;
  path?: string;
  // ❗ Errores por campo cuando el formulario tiene datos inválidos (400):
  //    { "nombre": "El nombre es obligatorio", "stockMinimo": "..." }
  errores?: Record<string, string>;
}
