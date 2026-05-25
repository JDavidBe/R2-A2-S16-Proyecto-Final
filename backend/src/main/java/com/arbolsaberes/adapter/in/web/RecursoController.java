package com.arbolsaberes.adapter.in.web;

import com.arbolsaberes.application.dto.RecursoDTO;
import com.arbolsaberes.application.port.in.GestionRecursosUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/recursos")
@RequiredArgsConstructor
public class RecursoController {

    private final GestionRecursosUseCase service;

    /** GET /api/recursos — listar (todos los autenticados) */
    @GetMapping
    public ResponseEntity<List<RecursoDTO>> listar(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String grado,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(service.buscar(area, grado, q));
    }

    /**
     * GET /api/recursos/mis-recursos
     * Docente/Directivo: solo los suyos. Admin: todos.
     */
    @GetMapping("/mis-recursos")
    @PreAuthorize("hasAnyRole('ADMIN','DOCENTE','DIRECTIVO')")
    public ResponseEntity<List<RecursoDTO>> misRecursos(Authentication auth) {
        return ResponseEntity.ok(service.buscarPorUsuario(auth.getName()));
    }

    /** GET /api/recursos/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<RecursoDTO> detalle(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    /**
     * POST /api/recursos — crear (ADMIN, DOCENTE, DIRECTIVO)
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN','DOCENTE','DIRECTIVO')")
    public ResponseEntity<RecursoDTO> crear(
            @RequestParam String titulo,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String grado,
            @RequestParam("archivo") MultipartFile archivo,
            Authentication auth) throws IOException {
        return ResponseEntity.status(201).body(
            service.crear(titulo, descripcion, area, grado, archivo, auth.getName()));
    }

    /**
     * PUT /api/recursos/{id} — editar (multipart: puede incluir nuevo PDF opcional)
     * ADMIN puede editar cualquiera. DOCENTE/DIRECTIVO solo los suyos.
     */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN','DOCENTE','DIRECTIVO')")
    public ResponseEntity<RecursoDTO> editar(
            @PathVariable Long id,
            @RequestParam String titulo,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String grado,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo,
            Authentication auth) throws IOException {
        return ResponseEntity.ok(
            service.editar(id, titulo, descripcion, area, grado, archivo, auth.getName()));
    }

    /**
     * DELETE /api/recursos/{id} — eliminar
     * ADMIN puede eliminar cualquiera. DOCENTE/DIRECTIVO solo los suyos.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCENTE','DIRECTIVO')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication auth) {
        service.eliminar(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    /** GET /api/recursos/{id}/descargar */
    @GetMapping("/{id}/descargar")
    public ResponseEntity<byte[]> descargar(@PathVariable Long id, Authentication auth) {
        return service.descargar(id, auth.getName());
    }
}
