export function getExtraPercentage({ montoBase, montoExtra }: { montoBase: number, montoExtra: number }) {
    if (montoBase === 0) return "El monto base no puede ser 0";
    const porcentaje = (montoExtra / montoBase) * 100;

    return porcentaje.toFixed(0) + "%";
}