package com.arbolsaberes.adapter.in.web;
import com.arbolsaberes.application.dto.*;
import com.arbolsaberes.application.port.in.AuthUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthUseCase service;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(service.login(req));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioDTO> registro(@RequestBody RegistroUsuarioRequest req) {
        return ResponseEntity.status(201).body(service.registrar(req));
    }
}
