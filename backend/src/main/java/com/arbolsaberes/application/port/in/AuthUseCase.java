package com.arbolsaberes.application.port.in;

import com.arbolsaberes.application.dto.LoginRequest;
import com.arbolsaberes.application.dto.LoginResponse;
import com.arbolsaberes.application.dto.RegistroUsuarioRequest;
import com.arbolsaberes.application.dto.UsuarioDTO;

public interface AuthUseCase {
    LoginResponse login(LoginRequest req);
    UsuarioDTO registrar(RegistroUsuarioRequest req);
}
