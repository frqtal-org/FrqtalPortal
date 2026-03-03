export function sumarMontosExactos(monto1: number, monto2: number) {
  // 1. Asegurarnos de que sean números (por si llegan como strings del input)
  const num1 = Number(monto1);
  const num2 = Number(monto2);

  if (isNaN(num1) || isNaN(num2)) {
    throw new Error("Los valores ingresados no son números válidos");
  }

  // 2. Convertir a enteros (centavos) multiplicando por 100.
  // Usamos Math.round() para eliminar cualquier micro-fracción flotante residual.
  const centavos1 = Math.round(num1 * 100);
  const centavos2 = Math.round(num2 * 100);

  // 3. Sumar los números enteros (lo cual es 100% exacto en procesadores)
  const sumaEnCentavos = centavos1 + centavos2;

  // 4. Dividir entre 100 para regresar al formato de pesos/dólares con decimales
  return sumaEnCentavos / 100;
}