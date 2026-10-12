package pe.edu.isil.santapatricia.model;

import java.math.BigDecimal;

/**
 * Semáforo del stock. NO se guarda en la base: se calcula cada vez.
 *   CRÍTICO : stock actual <= la mitad del mínimo
 *   BAJO    : stock actual <= el mínimo
 *   ÓPTIMO  : stock actual mayor que el mínimo
 */
public enum EstadoStock {
    OPTIMO, BAJO, CRITICO;

    public static EstadoStock calcular(BigDecimal stockActual, BigDecimal stockMinimo) {
        BigDecimal mitadDelMinimo = stockMinimo.divide(BigDecimal.valueOf(2));
        if (stockActual.compareTo(mitadDelMinimo) <= 0) {
            return CRITICO;
        }
        if (stockActual.compareTo(stockMinimo) <= 0) {
            return BAJO;
        }
        return OPTIMO;
    }
}
