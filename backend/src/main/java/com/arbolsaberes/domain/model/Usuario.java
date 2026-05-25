package com.arbolsaberes.domain.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "usuarios")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String nombre;
    @Column(nullable = false, unique = true) private String correo;
    @Column(nullable = false) private String password;
    @Column(nullable = false) private String rol;
    @Column(nullable = false) private Boolean activo = true;
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
}
