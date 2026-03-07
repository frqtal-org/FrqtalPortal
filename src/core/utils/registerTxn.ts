import { createMMKV } from 'react-native-mmkv';

export const storageTxnHistory = createMMKV();
const COBROS_KEY = 'lista_de_cobros';



export const obtenerTransaccion = (txnApprovalCode: string, amount: string) => {
  try {
    const cobrosGuardados = storageTxnHistory.getString(COBROS_KEY);
    if (!cobrosGuardados) return null;

    const listaCobros = JSON.parse(cobrosGuardados);

    const transaccionEncontrada = listaCobros.find(
      (cobro: any) => (cobro.TXN_APPROVAL_CODE === txnApprovalCode) && (cobro.AMOUNT === amount)
    );

    return transaccionEncontrada || null;

  } catch (error) {
    console.error('Hubo un problema buscando la transacción:', error);
    return null;
  }
};


export const obtenerTotalCobrado = () => {
  try {
    const cobrosGuardados = storageTxnHistory.getString(COBROS_KEY);
    if (!cobrosGuardados) return 0;

    const listaCobros = JSON.parse(cobrosGuardados);

    const sumaTotal = listaCobros
      .filter((cobro: any) => cobro.TXN_NAME !== "CANCELACION")
      .reduce((acumulador: number, cobro: any) => {
        const monto = parseFloat(cobro.AMOUNT) || 0;
        const sumaEnCentavos = Math.round(acumulador * 100) + Math.round(monto * 100);
        return sumaEnCentavos / 100;
      }, 0);

    return sumaTotal;

  } catch (error) {
    console.error('Hubo un problema calculando el total:', error);
    return 0;
  }
};



export const obtenerTotalPropinas = () => {
  try {
    const cobrosGuardados = storageTxnHistory.getString(COBROS_KEY);
    if (!cobrosGuardados) return 0;
    const listaCobros = JSON.parse(cobrosGuardados);

    const sumaPropinas = listaCobros
      .filter((cobro: any) => cobro.TXN_NAME !== "CANCELACION")
      .reduce((acumulador: number, cobro: any) => {
        const propina = parseFloat(cobro.TIP) || 0;
        const sumaEnCentavos = Math.round(acumulador * 100) + Math.round(propina * 100);
        return sumaEnCentavos / 100;
      }, 0);
      
    return sumaPropinas;
  } catch (error) {
    console.error('Hubo un problema calculando el total de propinas:', error);
    return 0;
  }
};


export const obtenerTransaccionesPorEstado = () => {
  try {
    const cobrosGuardados = storageTxnHistory.getString(COBROS_KEY);
    
    // Si no hay nada, regresamos las tres listas vacías para no romper tu UI
    if (!cobrosGuardados) {
      return { todas: [], exitosas: [], devueltas: [] };
    }

    const listaCobros = JSON.parse(cobrosGuardados);

    // Filtramos usando TXN_NAME como identificador del estado
    const exitosas = listaCobros.filter((cobro: any) => cobro.TXN_NAME !== "CANCELACION");
    const devueltas = listaCobros.filter((cobro: any) => cobro.TXN_NAME === "CANCELACION");

    // Retornamos un objeto con las tres variantes
    return {
      todas: listaCobros,
      exitosas,
      devueltas
    };

  } catch (error) {
    console.error('Hubo un problema filtrando las transacciones:', error);
    return { todas: [], exitosas: [], devueltas: [] };
  }
};
