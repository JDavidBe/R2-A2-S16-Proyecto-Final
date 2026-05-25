package com.arbolsaberes.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "valoraciones",
    uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id","recurso_id"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Valoracion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recurso_id", nullable = false)
    private Recurso recurso;

    @Column(nullable = false)
    private Integer puntuacion; // 1-5

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Builder.Default
    @Column(name = "creado_en")
    private LocalDateTime creadoEn = LocalDateTime.now();
}
