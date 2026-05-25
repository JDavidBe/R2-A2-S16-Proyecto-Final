package com.arbolsaberes.application.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ValoracionDTO {
    private Long id;
    private Long recursoId;
    private String nombreUsuario;
    private Integer puntuacion;
    private String comentario;
    private LocalDateTime fechaCreacion;
}
