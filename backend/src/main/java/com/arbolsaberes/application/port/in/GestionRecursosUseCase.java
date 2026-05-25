package com.arbolsaberes.application.port.in;

import com.arbolsaberes.application.dto.RecursoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface GestionRecursosUseCase {
    List<RecursoDTO> buscar(String area, String grado, String q);
    List<RecursoDTO> buscarPorUsuario(String correoUsuario);
    RecursoDTO findById(Long id);
    RecursoDTO crear(String titulo, String descripcion, String area, String grado, MultipartFile archivo, String correoUsuario) throws IOException;
    RecursoDTO editar(Long id, String titulo, String descripcion, String area, String grado, MultipartFile archivo, String correoUsuario) throws IOException;
    void eliminar(Long id, String correoUsuario);
    ResponseEntity<byte[]> descargar(Long id, String correoUsuario);
}
