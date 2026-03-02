export function transactionDate(dateStr: any, timeStr: any) {
  const año = "20" + dateStr.substring(0, 2);
  const mes = dateStr.substring(2, 4);
  const dia = dateStr.substring(4, 6);

  const hora = timeStr.substring(0, 2);
  const minuto = timeStr.substring(2, 4);

  return `${dia}/${mes}/${año} ${hora}:${minuto}`;
}