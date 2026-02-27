export function generateTransactionId(): string {
  const now = new Date();

  // Fecha
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  // Tiempo
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Milisegundos (siempre 3 dígitos para evitar colisiones)
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  // Concatenamos todo sin espacios
  return `${day}${month}${year}${hours}${minutes}${seconds}${milliseconds}`;
}