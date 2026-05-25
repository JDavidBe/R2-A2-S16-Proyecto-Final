package com.arbolsaberes.application.service;

import com.arbolsaberes.application.dto.ResumenValoracionDTO;
import com.arbolsaberes.application.dto.ValoracionDTO;
import com.arbolsaberes.domain.model.Recurso;
import com.arbolsaberes.domain.model.Usuario;
import com.arbolsaberes.domain.model.Valoracion;
import com.arbolsaberes.infrastructure.persistence.RecursoRepository;
import com.arbolsaberes.infrastructure.persistence.UsuarioRepository;
import com.arbolsaberes.infrastructure.persistence.ValoracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ValoracionService implements com.arbolsaberes.application.port.in.ValoracionesUseCase {

    private final ValoracionRepository repo;
    private final RecursoRepository recursoRepo;
    private final UsuarioRepository usuarioRepo;

    @Transactional
    public ValoracionDTO valorar(Long recursoId, String correoUsuario,
                                  Integer puntuacion, String comentario) {
        if (puntuacion < 1 || puntuacion > 5)
            throw new RuntimeException("La puntuación debe ser entre 1 y 5");

        Recurso recurso = recursoRepo.findById(recursoId)
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));
        Usuario usuario = usuarioRepo.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Upsert: si ya existe actualizar
        Valoracion v = repo.findByUsuarioIdAndRecursoId(usuario.getId(), recursoId)
                .orElse(Valoracion.builder().usuario(usuario).recurso(recurso).build());
        v.setPuntuacion(puntuacion);
        v.setComentario(comentario);

        return toDTO(repo.save(v));
    }

    @Transactional(readOnly = true)
    public ValoracionDTO getMiValoracion(Long recursoId, String correoUsuario) {
        Usuario u = usuarioRepo.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return repo.findByUsuarioIdAndRecursoId(u.getId(), recursoId)
                .map(this::toDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ResumenValoracionDTO getResumen(Long recursoId) {
        Double promedio = repo.promedioByRecursoId(recursoId);
        Long total      = repo.totalByRecursoId(recursoId);
        return new ResumenValoracionDTO(recursoId,
                promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0,
                total != null ? total : 0L);
    }

    @Transactional(readOnly = true)
    public List<ValoracionDTO> getComentarios(Long recursoId) {
        return repo.findByRecursoIdOrderByCreadoEnDesc(recursoId)
                .stream()
                .filter(v -> v.getComentario() != null && !v.getComentario().isBlank())
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ValoracionDTO toDTO(Valoracion v) {
        ValoracionDTO dto = new ValoracionDTO();
        dto.setId(v.getId());
        dto.setRecursoId(v.getRecurso().getId());
        dto.setNombreUsuario(v.getUsuario().getNombre());
        dto.setPuntuacion(v.getPuntuacion());
        dto.setComentario(v.getComentario());
        dto.setFechaCreacion(v.getCreadoEn());
        return dto;
    }
}
