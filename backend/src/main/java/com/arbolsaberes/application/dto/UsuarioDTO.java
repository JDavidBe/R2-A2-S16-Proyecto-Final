package com.arbolsaberes.application.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data @AllArgsConstructor @NoArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String correo;
    private String rol;
    private Boolean activo;
}
