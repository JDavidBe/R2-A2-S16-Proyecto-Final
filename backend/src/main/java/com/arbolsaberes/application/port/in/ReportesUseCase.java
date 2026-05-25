package com.arbolsaberes.application.port.in;

import com.arbolsaberes.application.dto.ResumenReporteDTO;
import com.arbolsaberes.application.dto.TopRecursoDTO;
import java.util.List;

public interface ReportesUseCase {
    ResumenReporteDTO resumen();
    List<TopRecursoDTO> topRecursos();
}
