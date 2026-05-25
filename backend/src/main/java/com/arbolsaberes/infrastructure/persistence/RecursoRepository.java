package com.arbolsaberes.infrastructure.persistence;

import com.arbolsaberes.domain.model.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {

    // Trae solo los campos de texto, SIN el bytea
    @Query(value = "SELECT id, titulo, descripcion, area, grado, tipo, " +
            "nombre_archivo, tamano_bytes, subido_por, creado_en " +
            "FROM recursos ORDER BY creado_en DESC",
            nativeQuery = true)
    List<Object[]> findAllSinContenido();

    // Para descarga: trae el recurso completo por ID
    @Query("SELECT r FROM Recurso r WHERE r.id = :id")
    Optional<Recurso> findByIdCompleto(@Param("id") Long id);
}