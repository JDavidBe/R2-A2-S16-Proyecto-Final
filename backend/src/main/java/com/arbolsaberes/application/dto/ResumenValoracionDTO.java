package com.arbolsaberes.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class ResumenValoracionDTO {
    private Long recursoId;
    private Double promedio;
    private Long total;
}
