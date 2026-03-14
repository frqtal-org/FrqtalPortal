import { NativeModules } from "react-native";

const { PrinterModule } = NativeModules;

export async function printTicket(ticketData: any) {
    try {
        await PrinterModule.printTicket(
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
            ticketData.FIRMA,
        );
    } catch (error: any) {
        console.error(error)
        console.error(error?.message)
        throw new Error(error?.message)
    }
}

export async function printErrorTicket(ticketData: any) {
    try {
        await PrinterModule.printErrorTicket(
            ticketData.TICKET_IMAGE,
            ticketData.ADDRESS,
            ticketData.DATE,
            ticketData.TIME,
            ticketData.TXN_TYPE,
        );
    } catch (error: any) {
        console.error(error)
        console.error(error?.message)
        throw new Error(error?.message)
    }
}