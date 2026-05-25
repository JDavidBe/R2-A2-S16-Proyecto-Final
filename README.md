# 🌳 Árbol de Saberes — v2

Plataforma de biblioteca digital offline para la institución educativa Sardinas.

## ✨ Novedades v2

### Frontend
- **Editar recursos** — modal completo con reemplazo de PDF opcional (drag & drop)
- **Eliminar con confirmación** — dialog dedicado, no `window.confirm()`
- **Docente y Directivo pueden subir PDFs** — acceso a "Mis Recursos"
- **Sistema de valoraciones** ⭐ — 1 a 5 estrellas + comentarios por recurso
- **Catálogo mejorado** — tarjetas con hover, promedio de estrellas visible
- **Toast notifications** — feedback elegante sin alertas del browser
- **Filtros de búsqueda mejorados** — área + grado en gestión de recursos
- **Navbar con indicadores de rol** — badges de color por rol

### Backend (nuevas APIs)
| Endpoint | Método | Descripción |
|---|---|---|
| `/api/recursos/mis-recursos` | GET | Recursos propios (Docente/Directivo) |
| `/api/recursos/{id}` | PUT (multipart) | Editar metadatos + reemplazar PDF opcional |
| `/api/valoraciones/{id}` | POST | Crear/actualizar valoración (1-5 ⭐) |
| `/api/valoraciones/{id}/mi-valoracion` | GET | Valoración del usuario actual |
| `/api/valoraciones/{id}/resumen` | GET | Promedio y total de valoraciones |
| `/api/valoraciones/{id}/comentarios` | GET | Lista de comentarios |

### Roles y permisos
| Acción | Estudiante | Docente | Directivo | Admin |
|---|:---:|:---:|:---:|:---:|
| Ver catálogo | ✅ | ✅ | ✅ | ✅ |
| Descargar | ✅ | ✅ | ✅ | ✅ |
| Valorar recursos | ✅ | ✅ | ✅ | ✅ |
| Subir PDFs | ❌ | ✅ | ✅ | ✅ |
| Editar sus recursos | ❌ | ✅ | ✅ | ✅ |
| Eliminar sus recursos | ❌ | ✅ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ✅ |
| Ver reportes | ❌ | ❌ | ✅ | ✅ |

## 🚀 Ejecución

### Backend (Spring Boot)
```bash
cd backend
# Configura tu BD en application.properties o variables de entorno
./mvnw spring-boot:run
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### Variables de entorno backend
```
DB_URL=jdbc:postgresql://localhost:5432/arbol_saberes
JWT_SECRET=ArbolSaberes2025SecretKeyMustBe32CharsLong!!
ALLOWED_ORIGINS=http://localhost:5173
```

### Variables de entorno frontend (.env)
```
VITE_API_URL=http://localhost:8080
```

## Base de datos
Ejecuta `backend/src/main/resources/schema.sql` en pgAdmin.

**Usuarios demo (password: admin1234)**
- `admin@sardinas.edu.co` — ADMIN
- `docente@sardinas.edu.co` — DOCENTE  
- `director@sardinas.edu.co` — DIRECTIVO
- `estudiante@sardinas.edu.co` — ESTUDIANTE
