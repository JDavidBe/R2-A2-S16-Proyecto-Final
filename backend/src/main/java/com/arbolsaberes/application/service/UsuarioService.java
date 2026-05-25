package com.arbolsaberes.application.service;

import com.arbolsaberes.application.dto.*;
import com.arbolsaberes.domain.model.Usuario;
import com.arbolsaberes.infrastructure.persistence.UsuarioRepository;
import com.arbolsaberes.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService implements com.arbolsaberes.application.port.in.AuthUseCase, com.arbolsaberes.application.port.in.GestionUsuariosUseCase {

    private final UsuarioRepository repo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;

    @PostConstruct
    public void inicializarUsuarios() {
        actualizarOCrear("Administrador",   "admin@sardinas.edu.co",       "ADMIN");
        actualizarOCrear("Docente Demo",    "docente@sardinas.edu.co",     "DOCENTE");
        actualizarOCrear("Estudiante Demo", "estudiante@sardinas.edu.co",  "ESTUDIANTE");
        actualizarOCrear("Director",        "director@sardinas.edu.co",    "DIRECTIVO");
        System.out.println(">>> Usuarios listos. Contrasena: admin1234 <<<");
    }

    private void actualizarOCrear(String nombre, String correo, String rol) {
        String hashCorrecto = encoder.encode("admin1234");
        repo.findByCorreo(correo).ifPresentOrElse(
                u -> {
                    u.setPassword(hashCorrecto);
                    u.setActivo(true);
                    repo.save(u);
                    System.out.println(">>> Hash actualizado: " + correo);
                },
                () -> {
                    Usuario nuevo = Usuario.builder()
                            .nombre(nombre).correo(correo)
                            .password(hashCorrecto).rol(rol).activo(true).build();
                    repo.save(nuevo);
                    System.out.println(">>> Usuario creado: " + correo);
                }
        );
    }

    public LoginResponse login(LoginRequest req) {
        System.out.println(">>> LOGIN INTENTO: " + req.getCorreo());
        Usuario u = repo.findByCorreo(req.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));
        System.out.println(">>> Usuario hallado: " + u.getNombre() + " activo=" + u.getActivo());
        boolean ok = encoder.matches(req.getPassword(), u.getPassword());
        System.out.println(">>> Password match: " + ok);
        if (!ok) throw new RuntimeException("Credenciales incorrectas");
        if (!u.getActivo()) throw new RuntimeException("Usuario inactivo");
        String token = jwtUtil.generateToken(u.getCorreo(), u.getRol());
        return new LoginResponse(token, toDTO(u));
    }

    public UsuarioDTO registrar(RegistroUsuarioRequest req) {
        if (repo.existsByCorreo(req.getCorreo()))
            throw new RuntimeException("El correo ya está registrado");
        Usuario u = Usuario.builder()
                .nombre(req.getNombre()).correo(req.getCorreo())
                .password(encoder.encode(req.getPassword()))
                .rol(req.getRol() != null ? req.getRol() : "ESTUDIANTE")
                .activo(true).build();
        return toDTO(repo.save(u));
    }

    public List<UsuarioDTO> listar() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public UsuarioDTO toggleActivo(Long id) {
        Usuario u = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setActivo(!u.getActivo());
        return toDTO(repo.save(u));
    }

    public UsuarioDTO toDTO(Usuario u) {
        return new UsuarioDTO(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.getActivo());
    }
}