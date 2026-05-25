package com.arbolsaberes.adapter.in.web;
import com.arbolsaberes.application.dto.*;
import com.arbolsaberes.application.port.in.ReportesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/reportes") @RequiredArgsConstructor
public class ReporteController {
    private final ReportesUseCase service;

    @GetMapping("/resumen")
    public ResponseEntity<ResumenReporteDTO> resumen() {
        return ResponseEntity.ok(service.resumen());
    }

    @GetMapping("/top-recursos")
    public ResponseEntity<List<TopRecursoDTO>> top() {
        return ResponseEntity.ok(service.topRecursos());
    }
}
