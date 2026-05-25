package com.arbolsaberes.infrastructure.persistence;

import com.arbolsaberes.application.dto.TopRecursoDTO;
import com.arbolsaberes.domain.model.Descarga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DescargaRepository extends JpaRepository<Descarga, Long> {

    List<Descarga> findByRecursoId(Long recursoId);

    @Modifying
    @Query("DELETE FROM Descarga d WHERE d.recurso.id = :recursoId")
    void deleteByRecursoId(@Param("recursoId") Long recursoId);

    @Query("SELECT COUNT(d) FROM Descarga d WHERE d.recurso.id = :recursoId")
    Long countByRecursoId(@Param("recursoId") Long recursoId);

    @Query("SELECT new com.arbolsaberes.application.dto.TopRecursoDTO(r.id, r.titulo, r.area, COUNT(d.id)) " +
           "FROM Descarga d JOIN d.recurso r GROUP BY r.id, r.titulo, r.area ORDER BY COUNT(d.id) DESC")
    List<TopRecursoDTO> findTopRecursos();
}
