package com.frqtalportal

import CTOS.CtPrint
import CTOS.CtPrinterException
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.drawable.BitmapDrawable
import android.util.Log
import android.widget.Toast
import com.google.zxing2.BarcodeFormat

const val LINE_SPACE = 4
const val PRINTER_WIDTH = 384
const val MARGIN_SIZE = 2

// Estructura de cada línea de impresión
data class PrintLine(
    val text: String = "",
    val alignment: Int = 1, // 0 = Izquierda, 1 = Centro, 2 = Derecha
    val isBold: Boolean = false,
    val isUnderlined: Boolean = false,
    val textSize: Int = 1, // 0 = Small, 1 = Normal, 2 = Big
    val type: Int = 0, // 0 = Texto, 1 = Imagen, 2 = Línea, 3 = QR,4 = LineFeed
    val isDashed: Boolean = false,
    val width: Int = 1,
    val height: Int = 1,
    val imageResId: Int = 0,
    val bitmap: Bitmap? = null // 👇 NUEVO: Agregamos esto para soportar imágenes en memoria
)

/**
 * Herramienta para gestionar la impresión en dispositivos compatibles con `CtPrint`.
 *
 * @param context Contexto de la aplicación para acceder a los recursos.
 */
class PrnTool (private val context: Context){

    private val printer = CtPrint()
    private val linesToPrint = mutableListOf<PrintLine>() // Lista de líneas a imprimir
    var decreasedMargin: Boolean
    var heatLevel: Int = 0
    var font = Typeface.MONOSPACE//Typeface.create("sans-serif-monospace", Typeface.NORMAL)

    init {
        printer.initPage(100) // Inicializa la impresora
        decreasedMargin = false

    }

    /**
     * Agrega una línea de texto a la lista de impresión.
     *
     * @param text Texto a imprimir.
     * @param alignment Alineación del texto (`PRT_ALIGNLEFT`, `PRT_ALIGNCENTER`, `PRT_ALIGNRIGHT`).
     * @param isBold Define si el texto debe imprimirse en negrita.
     * @param isUnderlined Define si el texto debe imprimirse subrayado.
     * @param textSize Tamaño del texto (`PRT_SIZE_SMALL`, `PRT_SIZE_NORMAL`, `PRT_SIZE_BIG`).
     */
    fun printText(text: String, alignment: Int = 0, isBold: Boolean = false, isUnderlined: Boolean = false, textSize: Int = 1) {
        
        // 1. Definimos cuántos caracteres caben exactamente en el papel según el tamaño de letra
        val maxChars = when (textSize) {
            PRT_SIZE_SMALL -> 36
            PRT_SIZE_NORMAL -> 32
            PRT_SIZE_BIG -> 27
            else -> 32
        }

        // 2. Si el texto cabe perfectamente en una línea, lo imprimimos normal y terminamos
        if (text.length <= maxChars) {
            linesToPrint.add(PrintLine(text, alignment, isBold, isUnderlined, textSize, PRT_TEXT))
            return
        }

        // 3. Si el texto es muy largo, lo rebanamos inteligentemente
        var remainingText = text
        while (remainingText.isNotEmpty()) {
            
            // Si el pedazo que sobra ya cabe, lo imprimimos y salimos del ciclo
            if (remainingText.length <= maxChars) {
                linesToPrint.add(PrintLine(remainingText, alignment, isBold, isUnderlined, textSize, PRT_TEXT))
                break
            }

            // Buscamos el último ESPACIO EN BLANCO antes de llegar al límite del papel
            // Esto evita que una palabra se corte a la mitad (ej. "Cuerna-vaca")
            var cutIndex = remainingText.lastIndexOf(' ', maxChars)

            // Si es una palabra gigante sin espacios, no nos queda de otra más que cortarla a la fuerza
            if (cutIndex == -1) {
                cutIndex = maxChars
            }

            // Extraemos el pedazo de texto, lo mandamos a imprimir, y preparamos el sobrante
            val chunk = remainingText.substring(0, cutIndex)
            linesToPrint.add(PrintLine(chunk, alignment, isBold, isUnderlined, textSize, PRT_TEXT))

            // El sobrante será todo lo que sigue después del corte (.trimStart() quita el espacio inicial)
            remainingText = remainingText.substring(cutIndex).trimStart()
        }
    }

    /**
     * Agrega un salto de línea a la impresión.
     *
     * @param textSize Tamaño del salto (`PRT_SIZE_SMALL`, `PRT_SIZE_NORMAL`, `PRT_SIZE_BIG`).
     */
    fun printLineFeed(textSize: Int = 1) {
        linesToPrint.add(PrintLine(type = PRT_LINEFEED,textSize = textSize))
    }

    /**
     * Agrega una línea con dos columnas de texto alineadas.
     *
     * @param leftText Texto en la columna izquierda.
     * @param rightText Texto en la columna derecha.
     * @param isBold Define si el texto debe imprimirse en negrita.
     * @param isUnderlined Define si el texto debe imprimirse subrayado.
     * @param textSize Tamaño del texto (`PRT_SIZE_SMALL`, `PRT_SIZE_NORMAL`, `PRT_SIZE_BIG`).
     */
    fun printTwoColumn(leftText: String = "", rightText: String= "", isBold: Boolean = false, isUnderlined: Boolean = false, textSize: Int = 1) {

        var maxChars = 0

        when (textSize) {
            PRT_SIZE_SMALL-> maxChars = 36
            PRT_SIZE_NORMAL-> maxChars = 32
            PRT_SIZE_BIG-> maxChars = 27
        }

        val leftTrimmed = if (leftText.length > maxChars / 2) leftText.substring(0, maxChars / 2 - 1) else leftText
        val rightTrimmed = if (rightText.length > maxChars / 2) rightText.substring(0, maxChars / 2 - 1) else rightText
        val spacesNeeded = maxChars - leftTrimmed.length - rightTrimmed.length
        val formattedText = "$leftTrimmed${" ".repeat(spacesNeeded)}$rightTrimmed"
        printText(formattedText, CtPrint.PRT_ALIGNLEFT,isBold, isUnderlined,textSize)
    }

    /**
     * Agrega una línea con texto centrado.
     */
    private fun addCenteredText(text: String,isBold: Boolean = false, isUnderlined: Boolean = false,textSize: Int = 1) {
        printText(text, CtPrint.PRT_ALIGNCENTER,isBold, isUnderlined,textSize)
    }

    /**
     * Agrega una línea horizontal a la lista de impresión.
     *
     * @param isDashed Indica si la línea debe ser punteada (`true`) o sólida (`false`). Por defecto es `false` (línea sólida).
     * @param width Ancho de la línea en píxeles. Por defecto, se usa el ancho máximo de la impresora (`PRINTER_WIDTH`).
     * @param height Altura de la línea en píxeles. Por defecto, 3 píxeles.
     */
    fun printLine(isDashed:Boolean = false, width: Int = PRINTER_WIDTH, height: Int = 3) {
        linesToPrint.add(PrintLine(type = PRT_LINE, isDashed = isDashed, width = width, height = height ))
    }

    private fun getCanvasSize():Int{
        var canvasSize = 5

        for ((text, alignment, isBold, isUnderlined,textSize,type,isDashed,width,height) in linesToPrint) {

            when (type) {
                PRT_TEXT -> {
                    canvasSize += when (textSize) {
                        PRT_SIZE_SMALL -> if(decreasedMargin) 16 - MARGIN_SIZE else 16
                        PRT_SIZE_NORMAL -> if(decreasedMargin) 20 - MARGIN_SIZE else 20
                        PRT_SIZE_BIG -> if(decreasedMargin) 24 - MARGIN_SIZE else 24
                        else -> if(decreasedMargin) 20 - MARGIN_SIZE else 20
                    }
                    canvasSize += LINE_SPACE // Espaciado entre líneas
                }

                PRT_LINE -> {
                    canvasSize += height + LINE_SPACE
                }

                PRT_QR, PRT_IMAGE -> {
                    canvasSize += height + LINE_SPACE
                }

                PRT_LINEFEED -> {
                    canvasSize += height + LINE_SPACE + when (textSize) {
                        PRT_SIZE_SMALL -> 16
                        PRT_SIZE_NORMAL -> 20
                        PRT_SIZE_BIG -> 24
                        else -> 20
                    }
                }
            }
        }

        canvasSize += 40

        Log.d("PRNMNG", String.format("canvasSize:%d", canvasSize) )
        return canvasSize
    }


    /**
     * Imprime todas las líneas almacenadas en la lista.
     *
     * @return Código de estado de la impresora (`0x00` si la impresión fue exitosa).
     */
    fun printAll():Int {

        printer.initPage(getCanvasSize())
        printer.heatLevel = 0x05

        var yPos = 5

        for ((text, alignment, isBold, isUnderlined,textSize,type,isDashed,width,height,imageResId, bitmap) in linesToPrint) {

            when (type) {
                PRT_TEXT -> {
                    val fontSize = when (textSize) {
                        PRT_SIZE_SMALL -> if(decreasedMargin) 16 - MARGIN_SIZE else 16
                        PRT_SIZE_NORMAL -> if(decreasedMargin) 20 - MARGIN_SIZE else 20
                        PRT_SIZE_BIG -> if(decreasedMargin) 24 - MARGIN_SIZE else 24
                        else -> if(decreasedMargin) 20 - MARGIN_SIZE else 20
                    }

                    printer.setAlign(
                        when (alignment) {
                            Companion.PRT_ALIGNNORMAL -> CtPrint.PRT_ALIGNNORMAL
                            PRT_ALIGNLEFT -> CtPrint.PRT_ALIGNLEFT
                            PRT_ALIGNCENTER -> CtPrint.PRT_ALIGNCENTER
                            PRT_ALIGNRIGHT -> CtPrint.PRT_ALIGNRIGHT
                            else -> CtPrint.PRT_ALIGNNORMAL
                        }
                    )
                    printer.drawText(
                        0, yPos + fontSize, text, fontSize, alignment, 0xFF000000.toInt(),
                        isBold, 0f, isUnderlined, false, font
                    )

                    printer.drawText(
                        0, yPos + fontSize, text, fontSize, alignment, 0xFF000000.toInt(),
                        isBold, 0f, isUnderlined, false, font
                    )

                    yPos += fontSize + LINE_SPACE // Espaciado entre líneas
                }

                PRT_LINE -> {
                    val lineBitmap = if (!isDashed) createSolidLineBitmap(width, height)
                    else createDashedLineBitmap(width, height, 10, 10)

                    printer.drawImage(lineBitmap, 0, yPos) //- 20)
                    yPos += height + LINE_SPACE
                }

                PRT_QR -> {
                    try {
                        val bitmap = printer.encodeToBitmap(text, BarcodeFormat.QR_CODE, width, height)
                        printer.drawImage(bitmap, 0, yPos)
                        yPos += height + LINE_SPACE
                    } catch (e: CtPrinterException) {
                        e.showStatus()
                        Toast.makeText(context, e.getError(), Toast.LENGTH_LONG).show()
                    }
                }
                PRT_IMAGE -> {
                    try {
                        // Si hay un bitmap dinámico lo usamos, si no, buscamos en los recursos
                        val originalBitmap = bitmap ?: run {
                            val drawable = context.resources.getDrawable(imageResId, null)
                            if (drawable is android.graphics.drawable.BitmapDrawable) {
                                drawable.bitmap
                            } else {
                                throw IllegalArgumentException("No es un BitmapDrawable válido")
                            }
                        }

                        val newBitmap = createCenteredBitmap(originalBitmap)
                        printer.drawImage(newBitmap, 0, yPos)
                        
                        yPos += newBitmap.height + LINE_SPACE
                        
                    } catch (e: Exception) {
                        android.util.Log.d("PRNMNG", String.format("Exception:%s", e.toString()))
                    }
                }

                PRT_LINEFEED -> {
                    yPos += height + 5 + when (textSize) {
                        PRT_SIZE_SMALL -> 16
                        PRT_SIZE_NORMAL -> 20
                        PRT_SIZE_BIG -> 24
                        else -> 20
                    }
                }
            }
        }
        Log.d("PRNMNG", String.format("Final yPos:%d", yPos) )
        Log.d("PRNMNG", String.format("HeatLevel:%d", printer.heatLevel) )

        var status = printer.printPageEx()

        if (status != 0x00) {
            Log.d("PRNMNG", String.format("Status Impresora:%d", status))
            return status
        }

        linesToPrint.clear() // Limpiar la lista después de imprimir

        return 0x00 // Impresión exitosa
    }

    private fun convertToBlackAndWhite(originalBitmap: Bitmap): Bitmap {
        val width = originalBitmap.width
        val height = originalBitmap.height

        // Crear un nuevo Bitmap en blanco y negro
        val bwBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

        for (x in 0 until width) {
            for (y in 0 until height) {
                val pixel = originalBitmap.getPixel(x, y)
                val gray = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3 // Convertir a escala de grises

                // Aplicar umbral (si el gris es menor que 128, es negro; si no, es blanco)
                val newPixel = if (gray < 60) Color.BLACK else Color.WHITE
                bwBitmap.setPixel(x, y, newPixel)
            }
        }

        return bwBitmap
    }

    private fun createCenteredBitmap(originalBitmap: Bitmap): Bitmap {
        val newWidth = 384
        val originalWidth = originalBitmap.width
        val originalHeight = originalBitmap.height

        var bwBitmap = convertToBlackAndWhite(originalBitmap)

        // Escalar la imagen si es más grande que 384px
        val scaledBitmap = if (originalWidth > newWidth) {
            Bitmap.createScaledBitmap(bwBitmap, newWidth, originalHeight, true)
        } else {
            bwBitmap
        }

        val newBitmap = Bitmap.createBitmap(newWidth, originalHeight, Bitmap.Config.RGB_565)
        val canvas = Canvas(newBitmap)
        canvas.drawColor(Color.WHITE)

        // Calcular el desplazamiento X para centrar
        val xOffset = (newWidth - scaledBitmap.width) / 2

        // Dibujar la imagen escalada centrada
        canvas.drawBitmap(scaledBitmap, xOffset.toFloat(), 0f, Paint())

        return newBitmap
    }

    /**
     * Genera un Bitmap con una línea horizontal sólida.
     */
    private fun createSolidLineBitmap(width: Int, height: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply {
            color = Color.BLACK
            style = Paint.Style.FILL
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)
        return bitmap
    }

    /**
     * Genera un Bitmap con una línea punteada.
     */
    private fun createDashedLineBitmap(width: Int, height: Int, dotSize: Int, gapSize: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply {
            color = Color.BLACK
            style = Paint.Style.FILL
        }
        var x = 0
        while (x < width) {
            canvas.drawRect(x.toFloat(), 0f, (x + dotSize).toFloat(), height.toFloat(), paint)
            x += dotSize + gapSize
        }
        return bitmap
    }

    /**
     * Agrega un código QR a la lista de impresión.
     *
     * @param text El contenido del código QR (por defecto "www.castles.com").
     * @param height Altura del código QR en píxeles (por defecto la mitad del ancho de la impresora).
     * @param width Ancho del código QR en píxeles (por defecto la mitad del ancho de la impresora).
     */
    fun printQRCode(text: String="www.castles.com",height: Int =PRINTER_WIDTH/2,width: Int=PRINTER_WIDTH/2)
    {
        linesToPrint.add(PrintLine(text = text, height= height, width = width, type = PRT_QR))
    }

    /**
     * Agrega una imagen desde los recursos (`res/drawable`) a la lista de impresión.
     *
     * @param imageResId ID del recurso de la imagen (por ejemplo, `R.drawable.logo`).
     */
    fun printImageFromResources(imageResId: Int) {

        val (width, height) = getDrawableDimensions(imageResId) ?: Pair(0, 0)

        Log.d("PRNMNG", String.format("imageFromResources ID:%d width:%d, height:%d",imageResId, width, height) )

        linesToPrint.add(PrintLine( type = PRT_IMAGE,imageResId= imageResId,width = width, height = height))

    }

    /**
     * Agrega una imagen dinámica desde un Bitmap en memoria.
     */
    fun printImageFromBitmap(bitmap: Bitmap, desiredWidth: Int = 0) {
        // Si nos mandan un ancho deseado, y es menor que el original, encogemos la imagen
        val finalBitmap = if (desiredWidth > 0 && desiredWidth < bitmap.width) {
            // Calculamos la altura proporcional para que no se deforme
            val ratio = bitmap.height.toFloat() / bitmap.width.toFloat()
            val newHeight = (desiredWidth * ratio).toInt()
            
            Bitmap.createScaledBitmap(bitmap, desiredWidth, newHeight, true)
        } else {
            bitmap // Si no mandan ancho, la dejamos original
        }

        linesToPrint.add(PrintLine(type = PRT_IMAGE, bitmap = finalBitmap, width = finalBitmap.width, height = finalBitmap.height))
    }

   private fun getDrawableDimensions(imageResId: Int): Pair<Int, Int>? {
        val drawable = context.resources.getDrawable(imageResId, null)

        return if (drawable is BitmapDrawable) {
            val bitmap = drawable.bitmap
            Pair(bitmap.width, bitmap.height) // Retorna (ancho, alto)
        } else {
            null // Si no es un BitmapDrawable, retorna null
        }
    }

    companion object {
        public const val PRT_ALIGNNORMAL: Int = 0
        public const val PRT_ALIGNLEFT: Int = 1
        public const val PRT_ALIGNCENTER: Int = 2
        public const val PRT_ALIGNRIGHT: Int = 3

        public const val PRT_SIZE_SMALL: Int = 0
        public const val PRT_SIZE_NORMAL: Int = 1
        public const val PRT_SIZE_BIG: Int = 2

        public const val PRT_TEXT: Int = 0
        public const val PRT_IMAGE: Int = 1
        public const val PRT_LINE: Int = 2
        public const val PRT_QR: Int = 3
        public const val PRT_LINEFEED: Int = 4
    }
}
