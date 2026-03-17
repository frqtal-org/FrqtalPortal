import { NativeModules } from "react-native";
import { obtenerFechaActual, obtenerHoraActual, transactionDateDate, transactionDateTime } from "./transactionDate";
import { formatPriceFromDigits } from "./priceFormater";
import { sumarMontosExactos } from "./sumarMontosExactos";
import { mmkvStorage } from "../store/principalStore";
import StorageKey from "./store/keysStore";

const { PrinterModule } = NativeModules;

export async function printTicketAUX(ticketData: any) {
    try {
        const TICKET_IMAGE = mmkvStorage.getString(StorageKey.LOGO_64);
        const ADDRESS = mmkvStorage.getString(StorageKey.LOCATION_ADRESS);
        const DATE = transactionDateDate(ticketData?.TXN_DATE)
        const TIME = transactionDateTime(ticketData?.TXN_TIME)
        const ID = ticketData?.TXN_UNIQUE_REF
        const CARD = `**** ${ticketData?.ACCOUNT_NUMBER?.slice(-4)}`
        const CARD_BRAND = ticketData?.TAG_50
        const CARD_TYPE = ticketData?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
        const AUTH_TYPE = ticketData?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
        const IMPRESSION_TYPE = 'Original'
        const AMOUNT = parseFloat(formatPriceFromDigits(ticketData?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        const EXTRA = parseFloat(formatPriceFromDigits(ticketData?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        const TOTAL = ticketData?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(ticketData?.AMOUNT)), parseFloat(formatPriceFromDigits(ticketData?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT
        const BANK = ticketData?.CARD_NAME
        const AFILIATION_NUMBER = ticketData?.MERCHANT_ID
        const REFERENCE = ticketData?.SG_REFERENCE
        const AUT = ticketData?.TXN_APPROVAL_CODE
        const AID = ticketData?.AID
        const ARQC = ticketData?.ARQC
        const CVM = ticketData?.TAG_9F34
        const TVR = ticketData?.TAG_95
        const TSI = ticketData?.TAG_9B
        const TXN_TYPE = ticketData?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'
        const FIRMA = ticketData?.SIGNATURE_BYTES

        await PrinterModule.printTicket(
            TICKET_IMAGE,
            ADDRESS,
            DATE,
            TIME,
            ID,
            CARD,
            CARD_BRAND,
            CARD_TYPE,
            AUTH_TYPE,
            IMPRESSION_TYPE,
            AMOUNT,
            EXTRA,
            TOTAL,
            BANK,
            AFILIATION_NUMBER,
            REFERENCE,
            AUT,
            AID,
            ARQC,
            CVM,
            TVR,
            TSI,
            TXN_TYPE,
            FIRMA,
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

export async function printErrorTicketAUX(text: any) {
    try {
        const TICKET_IMAGE = mmkvStorage.getString(StorageKey.LOGO_64);
        const ADDRESS = mmkvStorage.getString(StorageKey.LOCATION_ADRESS);
        const DATE =  obtenerFechaActual();
        const TIME =  obtenerHoraActual();

        await PrinterModule.printErrorTicket(
            TICKET_IMAGE,
            ADDRESS,
            DATE,
            TIME,
            text,
        );
    } catch (error: any) {
        console.error(error)
        console.error(error?.message)
        throw new Error(error?.message)
    }
}