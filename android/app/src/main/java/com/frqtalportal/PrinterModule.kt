package com.frqtalportal

import android.graphics.BitmapFactory
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PrinterModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PrinterModule"
    }

    @ReactMethod
    fun printTicket(
        base64Logo: String?,
        address: String,
        Date: String,
        Time: String,
        ID: String?,
        Card: String?,
        CardBrand: String?,
        CardType: String?,
        AuthType: String?,
        ImpressionType: String?,
        Amount: String?,
        Extra: String?,
        Total: String?,
        Bank: String?,
        AfiliationNumber: String?,
        Reference: String?,
        AUT: String?,
        AID: String?,
        ARQC: String?,
        CVM: String?,
        TVR: String?,
        TSI: String?,
        txnType: String?,
        firma: String?,
        promise: Promise,
    ) {
        try {
            val myPrinter = PrnTool(reactContext)

            if (base64Logo != null && base64Logo.isNotEmpty()) {
                val cleanBase64 = base64Logo.replace(Regex("^data:image\\/[a-zA-Z]+;base64,"), "")
                val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                
                myPrinter.printImageFromBitmap(bitmap, 122)
                myPrinter.printLineFeed()
                myPrinter.printLineFeed()
            }

            // --- ENCABEZADO ---
            myPrinter.printText(address, PrnTool.PRT_ALIGNCENTER, isBold = false, textSize = PrnTool.PRT_SIZE_SMALL)
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            
            // --- DATOS DE LA TRANSACCIÓN ---
            myPrinter.printTwoColumn(Date, Time, isBold = true)
            /* myPrinter.printText(Date + " " + Time, PrnTool.PRT_ALIGNCENTER, isBold = true) */
            myPrinter.printLineFeed()
            myPrinter.printText("Id: ${ID}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            myPrinter.printText("Tarjeta: ${Card}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            myPrinter.printText("Marca: ${CardBrand}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            /* myPrinter.printText("Tipo: ${CardType}", PrnTool.PRT_ALIGNLEFT, isBold = false) */
            myPrinter.printText("Autarización: ${AuthType}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            /* myPrinter.printText("Impresión: ${ImpressionType}", PrnTool.PRT_ALIGNLEFT, isBold = false) */
            myPrinter.printLineFeed()
            
            // --- TOTALES ---
            if (Extra != null && Extra.isNotEmpty() && Extra != "\$0.00") {
                myPrinter.printText("Venta ${txnType}", PrnTool.PRT_ALIGNCENTER, isBold = true)
                myPrinter.printLineFeed()
                myPrinter.printTwoColumn("Consumo: ", "${Amount} MXN", isBold = false)
                myPrinter.printTwoColumn("Propina: ", "${Extra} MXN", isBold = false)
                myPrinter.printTwoColumn("Total: ", "${Total} MXN", isBold = false)
                myPrinter.printLineFeed()
            } else {
                myPrinter.printText("Venta ${txnType}", PrnTool.PRT_ALIGNCENTER, isBold = true)
                myPrinter.printLineFeed()
                myPrinter.printTwoColumn("Total: ", "${Total} MXN", isBold = false)
                myPrinter.printLineFeed()
            }
            
            // --- DATOS TÉCNICOS ---
            /* myPrinter.printText("Banco: ${Bank}", PrnTool.PRT_ALIGNLEFT, isBold = false)  */
            myPrinter.printText("Afiliación: ${AfiliationNumber}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            myPrinter.printText("No. Referencia: ${Reference}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            myPrinter.printText("Código de aprobación: ${AUT}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            myPrinter.printText("AID: ${AID}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            myPrinter.printText("ARQC: ${ARQC}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            if (CVM != null && CVM.isNotEmpty()) {
                myPrinter.printText("CVM: ${CVM}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            }
            if (TVR != null && TVR.isNotEmpty()) {
                myPrinter.printText("TVR: ${TVR}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            }
            if (TSI != null && TSI.isNotEmpty()) {
                myPrinter.printText("TSI: ${TSI}", PrnTool.PRT_ALIGNLEFT, isBold = false)
            }
            myPrinter.printLineFeed()
             if (firma != null && firma.isNotEmpty()) {
                val cleanBase64 = firma.replace(Regex("^data:image\\/[a-zA-Z]+;base64,"), "")
                val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
                val firmaBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                
                myPrinter.printImageFromBitmap(firmaBitmap, 220) 
                myPrinter.printText("Firma del cliente", PrnTool.PRT_ALIGNCENTER, isBold = true)
            }
            myPrinter.printLineFeed()
            
            // --- PIE DE PÁGINA Y LEGALES ---            
            myPrinter.printText("Por este pagaré me obligo incondicionalmente a pagar a la orden del banco acreditante el importe de este título. Este pagaré procede del contrato de apertura de crédito que el banco acreditante y el tarjetahabiente tienen celebrado.", PrnTool.PRT_ALIGNCENTER, isBold = false, textSize = PrnTool.PRT_SIZE_SMALL)
            myPrinter.printLineFeed()
            myPrinter.printText("Powered by Frqtal", PrnTool.PRT_ALIGNCENTER, isBold = true, textSize = PrnTool.PRT_SIZE_SMALL)
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()

            val status = myPrinter.printAll()

            when (status) {
                0 -> promise.resolve("Impresión exitosa")
                3 -> promise.reject("NO_PAPER", "La impresora no tiene papel")
                20 -> promise.reject("COVER_OPEN", "La tapa de la impresora está abierta")
                2 -> promise.reject("OVER_TEMP", "La impresora se está sobrecalentando")
                -128 -> promise.reject("COMMUNICATION_ERROR", "Error de comunicación con la impresora")
                else -> promise.reject("UNKNOWN_ERROR", "Código de error desconocido: $status")
            }

        } catch (e: Exception) {
            promise.reject("UNKNOWN_ERROR", e.message)
        }
    }

    @ReactMethod
    fun printErrorTicket(
        base64Logo: String?,
        address: String,
        Date: String,
        Time: String,
        txnType: String?,
        promise: Promise,
    ) {
        try {
            val myPrinter = PrnTool(reactContext)

            if (base64Logo != null && base64Logo.isNotEmpty()) {
                val cleanBase64 = base64Logo.replace(Regex("^data:image\\/[a-zA-Z]+;base64,"), "")
                val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                
                myPrinter.printImageFromBitmap(bitmap, 122)
                myPrinter.printLineFeed()
            }

            // --- ENCABEZADO ---
            myPrinter.printText(address, PrnTool.PRT_ALIGNCENTER, isBold = false, textSize = PrnTool.PRT_SIZE_SMALL)
            myPrinter.printLineFeed()
            
            // --- DATOS DE LA TRANSACCIÓN ---
            myPrinter.printTwoColumn(Date, Time, isBold = true)
            /* myPrinter.printText(Date + " " + Time, PrnTool.PRT_ALIGNCENTER, isBold = true) */
            myPrinter.printLineFeed()
            myPrinter.printText("Venta declinada", PrnTool.PRT_ALIGNCENTER, isBold = true)
            myPrinter.printText("${txnType}", PrnTool.PRT_ALIGNCENTER, isBold = true)
            myPrinter.printLineFeed()
            
            // --- PIE DE PÁGINA Y LEGALES ---            
            myPrinter.printText("Powered by Frqtal", PrnTool.PRT_ALIGNCENTER, isBold = true, textSize = PrnTool.PRT_SIZE_SMALL)
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()
            myPrinter.printLineFeed()

            val status = myPrinter.printAll()

            when (status) {
                0 -> promise.resolve("Impresión exitosa")
                3 -> promise.reject("NO_PAPER", "La impresora no tiene papel")
                20 -> promise.reject("COVER_OPEN", "La tapa de la impresora está abierta")
                2 -> promise.reject("OVER_TEMP", "La impresora se está sobrecalentando")
                -128 -> promise.reject("COMMUNICATION_ERROR", "Error de comunicación con la impresora")
                else -> promise.reject("UNKNOWN_ERROR", "Código de error desconocido: $status")
            }

        } catch (e: Exception) {
            promise.reject("UNKNOWN_ERROR", e.message)
        }
    }
}