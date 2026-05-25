package com.arbolsaberes.infrastructure.persistence;

import com.arbolsaberes.domain.model.Valoracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {

    Optional<Valoracion> findByUsuarioIdAndRecursoId(Long usuarioId, Long recursoId);

    List<Valoracion> findByRecursoIdOrderByCreadoEnDesc(Long recursoId);

    @Query("SELECT AVG(v.puntuacion) FROM Valoracion v WHERE v.recurso.id = :recursoId")
    Double promedioByRecursoId(@Param("recursoId") Long recursoId);

    @Query("SELECT COUNT(v) FROM Valoracion v WHERE v.recurso.id = :recursoId")
    Long totalByRecursoId(@Param("recursoId") Long recursoId);

    @Modifying
    @Query("DELETE FROM Valoracion v WHERE v.recurso.id = :recursoId")
    void deleteByRecursoId(@Param("recursoId") Long recursoId);
}
