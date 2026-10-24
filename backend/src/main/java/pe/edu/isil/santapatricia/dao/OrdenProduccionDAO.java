
package pe.edu.isil.santapatricia.dao;

import java.util.List;
import pe.edu.isil.santapatricia.dto.OrdenProduccionDTO;

public interface OrdenProduccionDAO {

    List<Integer> listarIdsDisponibles();

    boolean existeOrdenDisponible(int ordenId);

    List<OrdenProduccionDTO> listarEnProceso();

}
