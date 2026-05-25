package com.arbolsaberes.application.port.in;

import com.arbolsaberes.application.dto.ResumenValoracionDTO;
import com.arbolsaberes.application.dto.ValoracionDTO;
import java.util.List;

public interface ValoracionesUseCase {
    ValoracionDTO valorar(Long recursoId, String correoUsuario, Integer puntuacion, String comentario);
    ValoracionDTO getMiValoracion(Long recursoId, String correoUsuario);
    ResumenValoracionDTO getResumen(Long recursoId);
    List<ValoracionDTO> getComentarios(Long recursoId);
}
