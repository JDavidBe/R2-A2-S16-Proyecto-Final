package com.arbolsaberes.adapter.in.web;
import com.arbolsaberes.application.dto.UsuarioDTO;
import com.arbolsaberes.application.port.in.GestionUsuariosUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/usuarios") @RequiredArgsConstructor
public class UsuarioController {
    private final GestionUsuariosUseCase service;

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<UsuarioDTO> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActivo(id));
    }
}
