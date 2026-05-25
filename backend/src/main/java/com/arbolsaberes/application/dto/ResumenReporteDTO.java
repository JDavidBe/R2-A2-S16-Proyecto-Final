package com.arbolsaberes.application.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data @AllArgsConstructor @NoArgsConstructor
public class ResumenReporteDTO {
    private Long totalDescargas;
    private Long totalUsuariosActivos;
    private Long totalRecursos;
}
