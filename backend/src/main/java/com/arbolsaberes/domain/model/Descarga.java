package com.arbolsaberes.domain.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "descargas")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Descarga {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false) private Usuario usuario;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recurso_id", nullable = false) private Recurso recurso;
    @Column(name = "descargado_en")
    private LocalDateTime descargadoEn = LocalDateTime.now();
}
