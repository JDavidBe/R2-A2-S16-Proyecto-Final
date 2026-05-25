package com.arbolsaberes.application.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RecursoDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String area;
    private String grado;
    private String tipo;
    private String nombreArchivo;
    private Long tamanoBytes;
    private Long subidoPorId;
    private String subidoPorNombre;
    private LocalDateTime creadoEn;
}
