package com.arbolsaberes.application.dto;
import lombok.Data;
@Data
public class RegistroUsuarioRequest {
    private String nombre;
    private String correo;
    private String password;
    private String rol;
}
