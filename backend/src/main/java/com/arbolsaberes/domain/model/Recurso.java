package com.arbolsaberes.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recursos")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String descripcion;
    private String area;
    private String grado;
    private String tipo = "PDF";

    @Column(name = "nombre_archivo")
    private String nombreArchivo;

    @Column(name = "contenido_pdf", columnDefinition = "bytea")
    private byte[] contenidoPdf;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subido_por")
    private Usuario subidoPor;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
}