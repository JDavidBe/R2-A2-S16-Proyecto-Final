package com.arbolsaberes.application.service;
import com.arbolsaberes.application.dto.ResumenReporteDTO;
import com.arbolsaberes.application.dto.TopRecursoDTO;
import com.arbolsaberes.infrastructure.persistence.DescargaRepository;
import com.arbolsaberes.infrastructure.persistence.RecursoRepository;
import com.arbolsaberes.infrastructure.persistence.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class ReporteService implements com.arbolsaberes.application.port.in.ReportesUseCase {
    private final DescargaRepository descargaRepo;
    private final RecursoRepository recursoRepo;
    private final UsuarioRepository usuarioRepo;

    public ResumenReporteDTO resumen() {
        return new ResumenReporteDTO(
            descargaRepo.count(),
            usuarioRepo.countByActivoTrue(),
            recursoRepo.count()
        );
    }

    public List<TopRecursoDTO> topRecursos() {
        return descargaRepo.findTopRecursos().stream().limit(5).toList();
    }
}
