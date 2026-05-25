package com.arbolsaberes.infrastructure.config;

import com.arbolsaberes.infrastructure.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Autenticación pública
                .requestMatchers("/api/auth/**").permitAll()

                // Catálogo: todos los autenticados
                .requestMatchers(HttpMethod.GET, "/api/recursos").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/recursos/{id}").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/recursos/{id}/descargar").authenticated()

                // Mis recursos: ADMIN, DOCENTE, DIRECTIVO
                .requestMatchers(HttpMethod.GET, "/api/recursos/mis-recursos")
                    .hasAnyRole("ADMIN","DOCENTE","DIRECTIVO")

                // Crear recurso: ADMIN, DOCENTE, DIRECTIVO
                .requestMatchers(HttpMethod.POST, "/api/recursos")
                    .hasAnyRole("ADMIN","DOCENTE","DIRECTIVO")

                // Editar / Eliminar: ADMIN, DOCENTE, DIRECTIVO (ownership verificado en servicio)
                .requestMatchers(HttpMethod.PUT, "/api/recursos/**")
                    .hasAnyRole("ADMIN","DOCENTE","DIRECTIVO")
                .requestMatchers(HttpMethod.DELETE, "/api/recursos/**")
                    .hasAnyRole("ADMIN","DOCENTE","DIRECTIVO")

                // Valoraciones: cualquier autenticado puede valorar y leer
                .requestMatchers("/api/valoraciones/**").authenticated()

                // Reportes: ADMIN, DIRECTIVO
                .requestMatchers("/api/reportes/**").hasAnyRole("ADMIN","DIRECTIVO")

                // Usuarios: solo ADMIN
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
