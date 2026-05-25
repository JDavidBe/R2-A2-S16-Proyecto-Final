package com.arbolsaberes.application.port.in;

import com.arbolsaberes.application.dto.UsuarioDTO;
import java.util.List;

public interface GestionUsuariosUseCase {
    List<UsuarioDTO> listar();
    UsuarioDTO toggleActivo(Long id);
}
