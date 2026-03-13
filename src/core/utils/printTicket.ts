import { NativeModules } from "react-native";

const { PrinterModule } = NativeModules;

export async function printTicket(ticketData: any) {
    try {
        const resultado = await PrinterModule.printTicket(
            ticketData.TICKET_IMAGE,
            ticketData.ADDRESS,
            ticketData.DATE,
            ticketData.TIME,
            ticketData.ID,
            ticketData.CARD,
            ticketData.CARD_BRAND,
            ticketData.CARD_TYPE,
            ticketData.AUTH_TYPE,
            ticketData.IMPRESSION_TYPE,
            ticketData.AMOUNT,
            ticketData.EXTRA,
            ticketData.TOTAL,
            ticketData.BANK,
            ticketData.AFILIATION_NUMBER,
            ticketData.REFERENCE,
            ticketData.AUT,
            ticketData.AID,
            ticketData.ARQC,
            ticketData.CVM,
            ticketData.TVR,
            ticketData.TSI,
            ticketData.TXN_TYPE,
        );
        console.log(resultado);
    } catch (error) {
        console.log("Error al imprimir:", error);
    }
}