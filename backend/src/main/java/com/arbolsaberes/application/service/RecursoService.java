package com.arbolsaberes.application.service;

import com.arbolsaberes.application.dto.RecursoDTO;
import com.arbolsaberes.domain.model.Descarga;
import com.arbolsaberes.domain.model.Recurso;
import com.arbolsaberes.domain.model.Usuario;
import com.arbolsaberes.infrastructure.persistence.DescargaRepository;
import com.arbolsaberes.infrastructure.persistence.RecursoRepository;
import com.arbolsaberes.infrastructure.persistence.UsuarioRepository;
import com.arbolsaberes.infrastructure.persistence.ValoracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecursoService implements com.arbolsaberes.application.port.in.GestionRecursosUseCase {

    private final RecursoRepository repo;
    private final DescargaRepository descargaRepo;
    private final UsuarioRepository usuarioRepo;
    private final ValoracionRepository valoracionRepo;

    // ── Buscar todos (con filtros) ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RecursoDTO> buscar(String area, String grado, String q) {
        try {
            List<Object[]> rows = repo.findAllSinContenido();
            List<RecursoDTO> todos = rows.stream().map(this::rowToDTO).collect(Collectors.toList());
            return todos.stream().filter(r -> {
                boolean matchArea  = area  == null || area.isBlank()  || area.equalsIgnoreCase(r.getArea());
                boolean matchGrado = grado == null || grado.isBlank() || grado.equalsIgnoreCase(r.getGrado());
                boolean matchQ     = q     == null || q.isBlank()     || (r.getTitulo() != null && r.getTitulo().toLowerCase().contains(q.toLowerCase()));
                return matchArea && matchGrado && matchQ;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println(">>> ERROR buscar: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // ── Buscar por usuario (para DOCENTE/DIRECTIVO: solo los suyos) ────────────
    @Transactional(readOnly = true)
    public List<RecursoDTO> buscarPorUsuario(String correoUsuario) {
        try {
            Usuario u = usuarioRepo.findByCorreo(correoUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            // Admin ve todos
            if (u.getRol().equals("ADMIN")) return buscar(null, null, null);

            List<Object[]> rows = repo.findAllSinContenido();
            return rows.stream()
                    .map(this::rowToDTO)
                    .filter(r -> r.getSubidoPorId() != null && r.getSubidoPorId().equals(u.getId()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println(">>> ERROR buscarPorUsuario: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // ── Detalle por ID ──────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RecursoDTO findById(Long id) {
        Recurso r = repo.findByIdCompleto(id)
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));
        return toDTO(r);
    }

    // ── Crear recurso ────────────────────────────────────────────────────────────
    @Transactional
    public RecursoDTO crear(String titulo, String descripcion, String area,
                            String grado, MultipartFile archivo,
                            String correoUsuario) throws IOException {
        validarPDF(archivo);
        Usuario u = usuarioRepo.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Recurso r = Recurso.builder()
                .titulo(titulo).descripcion(descripcion)
                .area(area).grado(grado).tipo("PDF")
                .nombreArchivo(archivo.getOriginalFilename())
                .contenidoPdf(archivo.getBytes())
                .tamanoBytes(archivo.getSize())
                .subidoPor(u).build();

        return toDTO(repo.save(r));
    }

    // ── Editar recurso (con o sin reemplazar el PDF) ────────────────────────────
    @Transactional
    public RecursoDTO editar(Long id, String titulo, String descripcion,
                             String area, String grado,
                             MultipartFile archivo, String correoUsuario) throws IOException {
        Recurso r = repo.findByIdCompleto(id)
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));

        // Verificar propiedad (no admin)
        verificarPropietario(r, correoUsuario);

        r.setTitulo(titulo);
        r.setDescripcion(descripcion);
        r.setArea(area);
        r.setGrado(grado);

        // Si viene un archivo nuevo, reemplazar el PDF
        if (archivo != null && !archivo.isEmpty()) {
            validarPDF(archivo);
            r.setContenidoPdf(archivo.getBytes());
            r.setNombreArchivo(archivo.getOriginalFilename());
            r.setTamanoBytes(archivo.getSize());
        }

        return toDTO(repo.save(r));
    }

    // ── Eliminar recurso ─────────────────────────────────────────────────────────
    @Transactional
    public void eliminar(Long id, String correoUsuario) {
        Recurso r = repo.findByIdCompleto(id)
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));
        verificarPropietario(r, correoUsuario);
        // Eliminar descargas y valoraciones asociadas primero
        valoracionRepo.deleteByRecursoId(id);
        descargaRepo.deleteByRecursoId(id);
        repo.deleteById(id);
    }

    // ── Descargar PDF ────────────────────────────────────────────────────────────
    @Transactional
    public ResponseEntity<byte[]> descargar(Long id, String correoUsuario) {
        Recurso r = repo.findByIdCompleto(id)
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));
        usuarioRepo.findByCorreo(correoUsuario).ifPresent(u ->
                descargaRepo.save(Descarga.builder().usuario(u).recurso(r).build()));
        String filename = r.getNombreArchivo() != null ? r.getNombreArchivo() : r.getTitulo() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(r.getContenidoPdf());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private void validarPDF(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) throw new RuntimeException("El archivo está vacío");
        String ct = archivo.getContentType();
        if (ct == null || !ct.equals("application/pdf"))
            throw new RuntimeException("Solo se permiten archivos PDF");
        if (archivo.getSize() > 50L * 1024 * 1024)
            throw new RuntimeException("El archivo supera 50 MB");
    }

    private void verificarPropietario(Recurso r, String correoUsuario) {
        Usuario u = usuarioRepo.findByCorreo(correoUsuario).orElse(null);
        if (u == null) return;
        if (u.getRol().equals("ADMIN")) return; // Admin puede todo
        if (r.getSubidoPor() == null || !r.getSubidoPor().getId().equals(u.getId()))
            throw new RuntimeException("No tienes permiso para modificar este recurso");
    }

    // Convierte fila nativa (sin bytea) a DTO
    private RecursoDTO rowToDTO(Object[] row) {
        RecursoDTO dto = new RecursoDTO();
        dto.setId(row[0] != null ? ((Number) row[0]).longValue() : null);
        dto.setTitulo(row[1] != null ? row[1].toString() : null);
        dto.setDescripcion(row[2] != null ? row[2].toString() : null);
        dto.setArea(row[3] != null ? row[3].toString() : null);
        dto.setGrado(row[4] != null ? row[4].toString() : null);
        dto.setTipo(row[5] != null ? row[5].toString() : "PDF");
        dto.setNombreArchivo(row[6] != null ? row[6].toString() : null);
        dto.setTamanoBytes(row[7] != null ? ((Number) row[7]).longValue() : null);
        if (row[8] != null) {
            Long subidoPorId = ((Number) row[8]).longValue();
            dto.setSubidoPorId(subidoPorId);
            usuarioRepo.findById(subidoPorId)
                    .ifPresent(u -> dto.setSubidoPorNombre(u.getNombre()));
        }
        return dto;
    }

    public RecursoDTO toDTO(Recurso r) {
        RecursoDTO dto = new RecursoDTO();
        dto.setId(r.getId());
        dto.setTitulo(r.getTitulo());
        dto.setDescripcion(r.getDescripcion());
        dto.setArea(r.getArea());
        dto.setGrado(r.getGrado());
        dto.setTipo(r.getTipo());
        dto.setNombreArchivo(r.getNombreArchivo());
        dto.setTamanoBytes(r.getTamanoBytes());
        dto.setCreadoEn(r.getCreadoEn());
        try {
            if (r.getSubidoPor() != null) {
                dto.setSubidoPorId(r.getSubidoPor().getId());
                dto.setSubidoPorNombre(r.getSubidoPor().getNombre());
            }
        } catch (Exception ignored) {}
        return dto;
    }
}
