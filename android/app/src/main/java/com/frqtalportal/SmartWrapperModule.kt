package com.frqtalportal

import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import com.facebook.react.bridge.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.IntentFilter
import android.os.Build

class SmartWrapperModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var authPromise: Promise? = null

    private val SMART_PACKAGE_BASE = "com.smart.smart" 
    private val APP_ID = "com.smart.smart.qa.debug" 
    private var currentPromise: Promise? = null
    private val REQUEST_CODE_SMART = 1001

    private val jsonConfigNoPrint = "{\"activityStr\": \"com.frqtalportal.MainActivity\", \"packageStr\":\"com.frqtalportal\", \"print\": false}"
    private val jsonConfigPrint = "{\"activityStr\": \"com.frqtalportal.MainActivity\", \"packageStr\":\"com.frqtalportal\", \"print\": true}"

    private val authReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val bundle = intent?.extras ?: return
            val status = bundle.getBoolean("TX_STATUS", false)
            val jsonReturn = bundle.getString("TX_JSON_RETURN", "")
            val error = bundle.getString("TX_ERROR", "")

            if (status) {
                authPromise?.resolve(jsonReturn)
            } else {
                authPromise?.reject("AUTH_ERROR", error.ifEmpty { "Error en autenticación" })
            }
            authPromise = null
        }
    }

    init {
        reactContext.addActivityEventListener(this)

        val filter = IntentFilter()
        filter.addAction("${reactContext.packageName}.PermissionBroadcast")
        filter.addAction("com.smart.thirdpartysample.PermissionBroadcast")
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(authReceiver, filter, Context.RECEIVER_EXPORTED)
        } else {
            reactContext.registerReceiver(authReceiver, filter)
        }
    }

    override fun getName(): String {
        return "SmartWrapperModule"
    }




    @ReactMethod
    fun authenticate(apikey: String, idCommerce: String, idIntegrator: String, invoiceId: String, promise: Promise) {
        authPromise = promise 
        
        val intent = Intent().apply {
            putExtra("authentication", apikey)
            putExtra("commerce_id", idCommerce)
            putExtra("integrator_id", idIntegrator)
            putExtra("invoice_id", invoiceId)
            
            putExtra("packageStr", reactContext.packageName) 

            addFlags(Intent.FLAG_INCLUDE_STOPPED_PACKAGES)
            component = ComponentName(APP_ID, "$SMART_PACKAGE_BASE.thirdparty.broadcast.AuthenticationBroadcast")
        }

        reactContext.sendBroadcast(intent)
    }




    @ReactMethod
    fun sale(amount: String, tip: String, date: String, unique_reference: String, idCommerce: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.putExtra("amount", amount) // Monto a enviar en la transacción solicitada.
            intent.putExtra("operation", "SALE") // Nombre de la operación solicitada en la transacción.
            intent.putExtra("cancel", false) // Campo solicitado con valor en true para que una transacción de cancelación o devolución se ejecute.
            intent.putExtra("reference", "") // “12345a” campo alfanumérico para referenciar la transacción pasada, genérica.
            intent.putExtra("unique_reference", unique_reference) // Campo alfanumérico, para referenciar una única transacción.
            intent.putExtra("tip", tip) // Parámetro para indicar la propina de una venta.
            intent.putExtra("from", "FrqtalPortal") // Parámetro para indicar el nombre del aplicativo que solicita la transacción.
            intent.putExtra("json", jsonConfigPrint) // Parámetro en formato json, del aplicativo, contiene packageName del aplicativo solicitado.
            intent.putExtra("date", date) // Parámetro para indicar la fecha del día en formato “ddmmaaaa”.
            intent.putExtra("idCommerce", idCommerce) // Parámetro para indicar el identificador de comercio que se usa durante la venta.
            intent.putExtra("userNumber", "") // Parámetro para indicar el número de usuario que se usa durante la venta.
            intent.putExtra("userName", "") // Parámetro para indicar el nombre de usuario que se usa en una venta.
            intent.putExtra("fuelType", "") // Parámetro para indicar el nombre de combustible que se usa durante una venta.
            intent.putExtra("liters", "") // Parámetro para indicar el número de litros de combustible que se usa durante una venta.
            intent.putExtra("pricePerLiters", "") // Parámetro para indicar el precio de los litros de combustible que se usa durante una venta.
            intent.putExtra("periphericals", "") // Parámetro para indicar los productos extra (aceite, limpiador de parabrisas) en una venta.
            intent.putExtra("paymentMethod", "card") // Parámetro para indicar el medio de pago (tarjeta, efectivo) seleccionado durante una venta.
            intent.putExtra("promotionPay", "withoutPromotions") // Parámetro para indicar el tipo de promoción de pago (meses sin intereses, skip, sin promociones) durante una venta.
            /* intent.putExtra("promotionPay", "validationOfPromotions") */
            intent.putExtra("promotionSkip", "") // Parámetro que indica el tipo de promoción skip seleccionada para el pago de una venta (meses  sin intereses, pago en una sola exhibición)
            intent.putExtra("monthsToPay", "") // Parámetro que indica la cantidad de meses en los que se divide el pago de una venta, es parte del pago con promociones.
            intent.putExtra("monthsToStartPaying", "") // Parámetro que indica la cantidad de meses para comenzar a pagar una venta, es parte del pago con promociones
            intent.putExtra("printerExtras", "") // Parámetro que recibe una cadena de texto con la estructura “texto1|texto2” o texto1|texto2$$texto3|texto4, etc., estos datos que se manden por este parámetro serán impresos en el ticket. De igual forma, se retornarán como respuesta de la transacción. Si la estructura es incorrecta, se retornará un mensaje de error 10035.
            
            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            
            val activity = reactContext.currentActivity
            if (activity != null) activity.startActivityForResult(intent, REQUEST_CODE_SMART)
            else promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }

    @ReactMethod
    fun cancelTransaction(amount: String, reference: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            intent.putExtra("operation", "CANCEL")
            intent.putExtra("amount", amount)
            intent.putExtra("reference", reference)
            intent.putExtra("cancel", true)
            intent.putExtra("from", "MiAppPOS")
            intent.putExtra("json", jsonConfigNoPrint)
            
            reactContext.currentActivity?.startActivityForResult(intent, REQUEST_CODE_SMART)
                ?: promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }

    @ReactMethod
    fun refundTransaction(amount: String, reference: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            
            intent.putExtra("operation", "TH_REFUND") // o "THE_REFUND"
            intent.putExtra("amount", amount)
            intent.putExtra("reference", reference)
            intent.putExtra("cancel", true)
            intent.putExtra("from", "MiAppPOS")
            intent.putExtra("json", jsonConfigNoPrint)
            
            reactContext.currentActivity?.startActivityForResult(intent, REQUEST_CODE_SMART)
                ?: promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }

    

    @ReactMethod
    fun reprintTicket(reference: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            
            intent.putExtra("operation", "REPRINT")
            intent.putExtra("reference", reference)
            intent.putExtra("amount", "0.00") 
            intent.putExtra("cancel", false)
            intent.putExtra("unique_reference", "")
            intent.putExtra("tip", "0.00")
            intent.putExtra("from", "FrqtalPortal")
            intent.putExtra("json", jsonConfigNoPrint)
            intent.putExtra("date", "")
            intent.putExtra("idCommerce", "")
            intent.putExtra("userNumber", "")
            intent.putExtra("userName", "")
            intent.putExtra("fuelType", "")
            intent.putExtra("liters", "")
            intent.putExtra("pricePerLiters", "")
            intent.putExtra("periphericals", "")
            intent.putExtra("paymentMethod", "")
            intent.putExtra("promotionPay", "")
            intent.putExtra("promotionSkip", "")
            intent.putExtra("monthsToPay", "")
            intent.putExtra("monthsToStartPaying", "")
            intent.putExtra("printerExtras", "")
            
            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            
            val activity = reactContext.currentActivity
            if (activity != null) activity.startActivityForResult(intent, REQUEST_CODE_SMART)
            else promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }



    @ReactMethod
    fun getBalance(printReport: Boolean, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            intent.putExtra("operation", "BALANCE")
            intent.putExtra("print_report", printReport.toString())
            intent.putExtra("from", "MiAppPOS")
            
            reactContext.currentActivity?.startActivityForResult(intent, REQUEST_CODE_SMART)
                ?: promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }


    
    @ReactMethod
    fun queryTransaction(reference: String, date: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            intent.putExtra("operation", "QUERY_TX")
            intent.putExtra("reference", reference)
            intent.putExtra("date", date)
            intent.putExtra("from", "MiAppPOS")
            intent.putExtra("json", jsonConfigNoPrint)
            
            reactContext.currentActivity?.startActivityForResult(intent, REQUEST_CODE_SMART)
                ?: promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }

    
   // IMPLEMENTATION ERROR
   @ReactMethod
    fun queryUniqueTransaction(uniqueReference: String, date: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.putExtra("operation", "QUERY_UNIQUE")
            
            intent.putExtra("amount", "0.00") 
            intent.putExtra("tip", "0.00")
            intent.putExtra("showDetailCheck", true)
            intent.putExtra("cancel", false)
            intent.putExtra("reference", "")
            intent.putExtra("unique_reference", uniqueReference)
            intent.putExtra("from", "FrqtalPortal")
            intent.putExtra("json", jsonConfigPrint)
            intent.putExtra("date", date)
            intent.putExtra("idCommerce", "")
            intent.putExtra("userNumber", "")
            intent.putExtra("userName", "")
            intent.putExtra("fuelType", "")
            intent.putExtra("liters", "")
            intent.putExtra("pricePerLiters", "")
            intent.putExtra("periphericals", "")
            intent.putExtra("paymentMethod", "")
            intent.putExtra("promotionPay", "")
            intent.putExtra("promotionSkip", "")
            intent.putExtra("monthsToPay", "")
            intent.putExtra("monthsToStartPaying", "")
            intent.putExtra("printerExtras", "")
            intent.putExtra("folio", "")

            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")

            val activity = reactContext.currentActivity
            if (activity != null) activity.startActivityForResult(intent, REQUEST_CODE_SMART)
            else promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }
    

    /* 
    @ReactMethod
    fun reauthorization(amount: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.putExtra("operation", "REAUTHORIZATION")
            intent.putExtra("amount", amount)
            intent.putExtra("cancel", false)
            intent.putExtra("reference", "")
            intent.putExtra("unique_reference", "")
            intent.putExtra("tip", "")
            intent.putExtra("from", "FrqtalPortal")
            intent.putExtra("json", jsonConfigNoPrint)
            intent.putExtra("date", "")
            intent.putExtra("idCommerce", "")
            intent.putExtra("userNumber", "")
            intent.putExtra("userName", "")
            intent.putExtra("fuelType", "")
            intent.putExtra("liters", "")
            intent.putExtra("pricePerLiters", "")
            intent.putExtra("periphericals", "")
            intent.putExtra("paymentMethod", "")
            intent.putExtra("promotionPay", "")
            intent.putExtra("promotionSkip", "")
            intent.putExtra("monthsToPay", "")
            intent.putExtra("monthsToStartPaying", "")
            intent.putExtra("printerExtras", "")

            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            
            val activity = reactContext.currentActivity
            if (activity != null) activity.startActivityForResult(intent, REQUEST_CODE_SMART)
            else promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }
    
    @ReactMethod
    fun checkIn(folio: String, amount: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.putExtra("operation", "CHECK_IN")
            intent.putExtra("amount", amount)
            intent.putExtra("cancel", false)
            intent.putExtra("reference", "")
            intent.putExtra("unique_reference", "")
            intent.putExtra("tip", "")
            intent.putExtra("from", "FrqtalPortal")
            intent.putExtra("json", jsonConfigNoPrint)
            intent.putExtra("date", "")
            intent.putExtra("idCommerce", "")
            intent.putExtra("userNumber", "")
            intent.putExtra("userName", "")
            intent.putExtra("fuelType", "")
            intent.putExtra("liters", "")
            intent.putExtra("pricePerLiters", "")
            intent.putExtra("periphericals", "")
            intent.putExtra("paymentMethod", "")
            intent.putExtra("promotionPay", "")
            intent.putExtra("promotionSkip", "")
            intent.putExtra("monthsToPay", "")
            intent.putExtra("monthsToStartPaying", "")
            intent.putExtra("printerExtras", "")
            intent.putExtra("folio", folio)
            intent.putExtra("showDetailCheck", false)

            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            
            val activity = reactContext.currentActivity
            if (activity != null) activity.startActivityForResult(intent, REQUEST_CODE_SMART)
            else promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    }

    @ReactMethod
    fun checkOut(folio: String, amount: String, promise: Promise) {
        currentPromise = promise
        try {
            val intent = Intent()
            intent.putExtra("operation", "CHECK_OUT")
            intent.putExtra("amount", amount)
            intent.putExtra("cancel", false)
            intent.putExtra("reference", "")
            intent.putExtra("unique_reference", "")
            intent.putExtra("tip", "")
            intent.putExtra("from", "FrqtalPortal")
            intent.putExtra("json", jsonConfigNoPrint)
            intent.putExtra("date", "")
            intent.putExtra("idCommerce", "")
            intent.putExtra("userNumber", "")
            intent.putExtra("userName", "")
            intent.putExtra("fuelType", "")
            intent.putExtra("liters", "")
            intent.putExtra("pricePerLiters", "")
            intent.putExtra("periphericals", "")
            intent.putExtra("paymentMethod", "")
            intent.putExtra("promotionPay", "")
            intent.putExtra("promotionSkip", "")
            intent.putExtra("monthsToPay", "")
            intent.putExtra("monthsToStartPaying", "")
            intent.putExtra("printerExtras", "")
            intent.putExtra("folio", folio)
            intent.putExtra("showDetailCheck", false)

            intent.setClassName(APP_ID, "$SMART_PACKAGE_BASE.activities.ContainerActivity")
            
            val activity = reactContext.currentActivity
            if (activity != null) activity.startActivityForResult(intent, REQUEST_CODE_SMART)
            else promise.reject("ACTIVITY_NULL", "Actividad no disponible")
        } catch (e: Exception) { promise.reject("INTENT_ERROR", e.message) }
    } 
    */

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CODE_SMART) {

            if (resultCode != Activity.RESULT_OK) {
                currentPromise?.reject("CANCELED", "Operación cancelada o la terminal falló")
                currentPromise = null
                return
            }

            val status = data?.getBooleanExtra("TX_STATUS", false) ?: false
            
            if (status) {
                val jsonReturn = data?.getStringExtra("TX_JSON_RETURN")
                if (jsonReturn != null) {
                    currentPromise?.resolve(jsonReturn)
                } else {
                    currentPromise?.reject("TX_ERROR", data?.getStringExtra("TX_ERROR") ?: "Respuesta vacía")
                }
            } else {
                val error = data?.getStringExtra("TX_ERROR") ?: "Transacción rechazada"
                currentPromise?.reject("TX_ERROR", error)
            }
            currentPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {
        // Obligatorio por la interfaz, vacío
    }
}