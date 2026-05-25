package com.arbolsaberes.application.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data @AllArgsConstructor @NoArgsConstructor
public class TopRecursoDTO {
    private Long id;
    private String titulo;
    private String area;
    private Long totalDescargas;
}
