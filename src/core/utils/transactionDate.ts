export function transactionDate(dateStr: any, timeStr: any) {
  if (!dateStr) return
  const año = "20" + dateStr.substring(0, 2);
  const mes = dateStr.substring(2, 4);
  const dia = dateStr.substring(4, 6);

  const hora = timeStr.substring(0, 2);
  const minuto = timeStr.substring(2, 4);
  const segundos = timeStr.substring(4, 6);

  return `${dia}/${mes}/${año} ${hora}:${minuto}:${segundos}`;
}

export function transactionDateDate(dateStr: any) {
  if (!dateStr) return
  const año = "20" + dateStr.substring(0, 2);
  const mes = dateStr.substring(2, 4);
  const dia = dateStr.substring(4, 6);

  return `${dia}/${mes}/${año}`;
}

export function transactionDateTime(timeStr: any) {
  if (!timeStr) return

  const hora = timeStr.substring(0, 2);
  const minuto = timeStr.substring(2, 4);
  const segundos = timeStr.substring(4, 6);

  return `${hora}:${minuto}:${segundos}`;
}

export function isTodayTransactionDate(dateStr: any) {
  const hoy = new Date();

  const anioActual = hoy.getFullYear().toString().slice(-2);
  const mesActual = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const diaActual = hoy.getDate().toString().padStart(2, '0');

  const hoyFormateado = `${anioActual}${mesActual}${diaActual}`;

  return dateStr === hoyFormateado;
}

export function parseDateToDate(dateStr: any) {

  const anioCorto = dateStr.slice(0, 2);
  const mes = dateStr.slice(2, 4);
  const dia = dateStr.slice(4, 6);

  const anioCompleto = "20" + anioCorto;

  return `${dia}${mes}${anioCompleto}`;
}