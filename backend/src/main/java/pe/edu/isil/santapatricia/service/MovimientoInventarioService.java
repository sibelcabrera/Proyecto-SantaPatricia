package pe.edu.isil.santapatricia.service;

import java.math.BigDecimal;

public interface MovimientoInventarioService {

    void registrarIngreso(
        int productoId,
        int usuarioId,
        BigDecimal cantidad,
        String motivo
    );

    void registrarSalidaVenta(
        int productoId,
        int usuarioId,
        BigDecimal cantidad,
        String motivo
    );

    void registrarSalidaProduccion(
        int productoId,
        int usuarioId,
        BigDecimal cantidad,
        String motivo
    );
    
    void registrarConsumoOrden(
        int ordenProduccionId,
        int productoId,
        int usuarioId,
        java.math.BigDecimal cantidad,
        String motivo
    );
    
}