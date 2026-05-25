package com.arbolsaberes.infrastructure.persistence;
import com.arbolsaberes.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    long countByActivoTrue();
}
