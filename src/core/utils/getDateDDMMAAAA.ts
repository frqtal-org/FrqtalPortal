export function getCurrentDateDDMMAAAA(): string {
  const today = new Date();

  // Obtenemos el día y aseguramos que tenga 2 dígitos (ej. "05" en vez de "5")
  const day = String(today.getDate()).padStart(2, '0');
  
  // Obtenemos el mes (sumamos 1 porque enero es 0) y aseguramos 2 dígitos
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // Obtenemos el año en 4 dígitos
  const year = today.getFullYear();

  return `${day}${month}${year}`;
}
