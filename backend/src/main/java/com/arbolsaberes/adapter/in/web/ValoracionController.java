package com.arbolsaberes.adapter.in.web;

import com.arbolsaberes.application.dto.ResumenValoracionDTO;
import com.arbolsaberes.application.dto.ValoracionDTO;
import com.arbolsaberes.application.dto.ValoracionRequest;
import com.arbolsaberes.application.port.in.ValoracionesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/valoraciones")
@RequiredArgsConstructor
public class ValoracionController {

    private final ValoracionesUseCase service;

    /** POST /api/valoraciones/{recursoId} — crear o actualizar valoración propia */
    @PostMapping("/{recursoId}")
    public ResponseEntity<ValoracionDTO> valorar(
            @PathVariable Long recursoId,
            @RequestBody ValoracionRequest req,
            Authentication auth) {
        ValoracionDTO dto = service.valorar(recursoId, auth.getName(),
                req.getPuntuacion(), req.getComentario());
        return ResponseEntity.ok(dto);
    }

    /** GET /api/valoraciones/{recursoId}/mi-valoracion — obtener la valoración del usuario actual */
    @GetMapping("/{recursoId}/mi-valoracion")
    public ResponseEntity<?> miValoracion(
            @PathVariable Long recursoId, Authentication auth) {
        ValoracionDTO dto = service.getMiValoracion(recursoId, auth.getName());
        if (dto == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(dto);
    }

    /** GET /api/valoraciones/{recursoId}/resumen — promedio y total */
    @GetMapping("/{recursoId}/resumen")
    public ResponseEntity<ResumenValoracionDTO> resumen(@PathVariable Long recursoId) {
        return ResponseEntity.ok(service.getResumen(recursoId));
    }

    /** GET /api/valoraciones/{recursoId}/comentarios — lista de comentarios */
    @GetMapping("/{recursoId}/comentarios")
    public ResponseEntity<List<ValoracionDTO>> comentarios(@PathVariable Long recursoId) {
        return ResponseEntity.ok(service.getComentarios(recursoId));
    }
}
