const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FitControl API',
      description: 'API REST para el sistema de gestión de gimnasios FitControl.',
      version: '1.0.0',
      contact: {
        name: 'Equipo FitControl'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Desarrollo'
      }
      // Agregar aquí la URL de producción cuando esté disponible:
      // { url: 'https://api.fitcontrol.com', description: 'Produccion' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT con el prefijo Bearer. Ejemplo: Bearer eyJhbGciOiJIUzI1NiIs...'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            mensaje: { type: 'string', description: 'Mensaje descriptivo del error' },
            error: { type: 'string', description: 'Detalle técnico del error (opcional)' },
            codigo: { type: 'string', description: 'Código interno de error (opcional)' },
            errores: { type: 'array', items: { type: 'string' }, description: 'Errores de validación (opcional)' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID del usuario' },
            nombre: { type: 'string', description: 'Nombre del usuario' },
            apellido: { type: 'string', description: 'Apellido del usuario' },
            email: { type: 'string', format: 'email', description: 'Correo electrónico' },
            rol: { type: 'object', description: 'Objeto Rol con nombre' },
            estado: { type: 'string', enum: ['activo', 'inactivo'], description: 'Estado de la cuenta' },
            fechaCreacion: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'Token JWT de acceso' },
            refreshToken: { type: 'string', description: 'Token para renovar el acceso' },
            usuario: { $ref: '#/components/schemas/Usuario' }
          }
        },
        Membresia: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            cliente: { type: 'object', description: 'Objeto Cliente' },
            tipo: { type: 'string', description: 'Tipo de membresía (Diaria, Semanal, Mensual, etc.)' },
            plan: { type: 'object', description: 'Plan asociado' },
            fechaInicio: { type: 'string', format: 'date-time' },
            fechaVencimiento: { type: 'string', format: 'date-time' },
            estado: { type: 'string', enum: ['activa', 'vencida', 'cancelada'] },
            precio: { type: 'number' },
            metodoPago: { type: 'string' }
          }
        },
        Plan: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nombre: { type: 'string', description: 'Nombre del plan' },
            precio: { type: 'number', description: 'Precio en COP' },
            duracionDias: { type: 'integer', description: 'Duración en días' },
            beneficios: { type: 'array', items: { type: 'string' }, description: 'Lista de beneficios' },
            descripcion: { type: 'string' },
            activo: { type: 'boolean' }
          }
        },
        Rutina: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            nivel: { type: 'string', enum: ['Principiante', 'Intermedio', 'Avanzado'] },
            objetivo: { type: 'string' },
            grupoMuscularPrincipal: { type: 'string' },
            grupoMuscularSecundario: { type: 'string' },
            ejercicios: { type: 'array', items: { type: 'object' } },
            esPlantilla: { type: 'boolean' },
            creadoPor: { type: 'object' }
          }
        },
        RutinaAsignada: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            rutina: { $ref: '#/components/schemas/Rutina' },
            cliente: { type: 'object' },
            asignadoPor: { type: 'object' },
            estado: { type: 'string', enum: ['activa', 'completada', 'cancelada'] },
            fechaAsignacion: { type: 'string', format: 'date-time' }
          }
        },
        SolicitudRutina: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            clienteId: { type: 'object', description: 'Cliente que solicita' },
            edad: { type: 'integer' },
            peso: { type: 'number' },
            estatura: { type: 'number' },
            experiencia: { type: 'string' },
            tiempoEntrenando: { type: 'string' },
            diasDisponibles: { type: 'string' },
            objetivo: { type: 'string' },
            metaPersonal: { type: 'string' },
            estado: { type: 'string', enum: ['Pendiente', 'En revision', 'Rutina asignada', 'Rechazada'] },
            entrenadorId: { type: 'object' },
            rutinaAsignada: { type: 'object' },
            fechaSolicitud: { type: 'string', format: 'date-time' }
          }
        },
        Asistencia: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            cliente: { type: 'object', description: 'Cliente que registra asistencia' },
            fecha: { type: 'string', format: 'date-time' },
            horaEntrada: { type: 'string' },
            horaSalida: { type: 'string' },
            metodo: { type: 'string', enum: ['QR', 'Manual'] },
            presente: { type: 'boolean' }
          }
        },
        Pago: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            cliente: { type: 'object' },
            membresia: { type: 'object' },
            valor: { type: 'number' },
            fechaPago: { type: 'string', format: 'date-time' },
            metodoPago: { type: 'string', enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Registro', 'Otro'] }
          }
        },
        Notificacion: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            usuario: { type: 'object', description: 'Usuario destinatario' },
            tipo: { type: 'string', enum: ['email', 'whatsapp', 'in-app'] },
            severidad: { type: 'string', enum: ['info', 'warning', 'urgent'] },
            asunto: { type: 'string' },
            mensaje: { type: 'string' },
            leida: { type: 'boolean' },
            fechaEnvio: { type: 'string', format: 'date-time' }
          }
        },
        Progreso: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            cliente: { type: 'object' },
            fecha: { type: 'string', format: 'date-time' },
            peso: { type: 'number' },
            altura: { type: 'number' },
            porcentajeGrasa: { type: 'number' },
            medidas: {
              type: 'object',
              properties: {
                brazo: { type: 'number' },
                pierna: { type: 'number' },
                cintura: { type: 'number' },
                pecho: { type: 'number' }
              }
            },
            observaciones: { type: 'string' }
          }
        }
      }
    },
    paths: {
      // ──────────────────────────────────────────────
      // AUTENTICACIÓN
      // ──────────────────────────────────────────────
      '/api/auth/registro': {
        post: {
          tags: ['Autenticacion'],
          summary: 'Registrar un nuevo usuario',
          description: 'Crea un nuevo usuario en el sistema con rol Cliente por defecto.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'usuario@example.com' },
                    password: { type: 'string', minLength: 6, example: 'miPassword123' },
                    nombre: { type: 'string', example: 'Juan' },
                    apellido: { type: 'string', example: 'Perez' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario registrado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Error de validacion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            409: { description: 'El email ya esta registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/iniciar-sesion': {
        post: {
          tags: ['Autenticacion'],
          summary: 'Iniciar sesion',
          description: 'Autentica un usuario con email y password, devuelve token JWT y refresh token.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'usuario@example.com' },
                    password: { type: 'string', example: 'miPassword123' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Inicio de sesion exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Credenciales invalidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'Cuenta desactivada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/renovar-token': {
        post: {
          tags: ['Autenticacion'],
          summary: 'Renovar token de acceso',
          description: 'Genera un nuevo token JWT usando un refresh token valido.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Token renovado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Refresh token invalido o expirado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/cerrar-sesion': {
        post: {
          tags: ['Autenticacion'],
          summary: 'Cerrar sesion',
          description: 'Invalida el refresh token del usuario autenticado.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Sesion cerrada exitosamente' },
            401: { description: 'Token no proporcionado o invalido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // USUARIOS
      // ──────────────────────────────────────────────
      '/api/users/perfil': {
        get: {
          tags: ['Usuarios'],
          summary: 'Obtener perfil propio',
          description: 'Devuelve los datos del usuario autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Perfil del usuario', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        put: {
          tags: ['Usuarios'],
          summary: 'Actualizar perfil propio',
          description: 'Actualiza los datos del usuario autenticado (nombre, apellido, email).',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nombre: { type: 'string', example: 'Juan' },
                    apellido: { type: 'string', example: 'Perez' },
                    email: { type: 'string', format: 'email', example: 'nuevo@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Perfil actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/users/lista': {
        get: {
          tags: ['Usuarios'],
          summary: 'Listar todos los usuarios',
          description: 'Devuelve el listado completo de usuarios del sistema. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de usuarios', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado - se requiere rol Administrador', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/users/{id}': {
        put: {
          tags: ['Usuarios'],
          summary: 'Actualizar un usuario',
          description: 'Actualiza los datos de un usuario especifico. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del usuario' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nombre: { type: 'string', example: 'Juan' },
                    apellido: { type: 'string', example: 'Perez' },
                    email: { type: 'string', format: 'email' },
                    estado: { type: 'string', enum: ['activo', 'inactivo'] }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/users/{id}/desactivar': {
        put: {
          tags: ['Usuarios'],
          summary: 'Desactivar un usuario',
          description: 'Cambia el estado de un usuario a inactivo. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del usuario' }
          ],
          responses: {
            200: { description: 'Usuario desactivado' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/users/{id}/activar': {
        put: {
          tags: ['Usuarios'],
          summary: 'Activar un usuario',
          description: 'Cambia el estado de un usuario a activo. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del usuario' }
          ],
          responses: {
            200: { description: 'Usuario activado' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/users/{id}/rol': {
        put: {
          tags: ['Usuarios'],
          summary: 'Cambiar rol de un usuario',
          description: 'Cambia el rol de un usuario. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del usuario' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['rol'],
                  properties: {
                    rol: { type: 'string', example: 'Entrenador', description: 'Nombre del rol (Administrador, Entrenador, Cliente)' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Rol actualizado' },
            400: { description: 'Rol invalido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // MEMBRESÍAS
      // ──────────────────────────────────────────────
      '/api/memberships': {
        post: {
          tags: ['Membresias'],
          summary: 'Crear una membresia',
          description: 'Crea una nueva membresia para un cliente.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['cliente', 'tipo'],
                  properties: {
                    cliente: { type: 'string', description: 'ID del cliente' },
                    tipo: { type: 'string', example: 'Mensual', description: 'Tipo de membresia (Diaria, Semanal, Mensual, Trimestral, Anual)' },
                    plan: { type: 'string', description: 'ID del plan (opcional)' },
                    metodoPago: { type: 'string', example: 'Efectivo' },
                    precio: { type: 'number', example: 120000 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Membresia creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Membresia' } } } },
            400: { description: 'Error de validacion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        get: {
          tags: ['Membresias'],
          summary: 'Listar todas las membresias',
          description: 'Devuelve el listado completo de membresias.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de membresias', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Membresia' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/semaforo': {
        get: {
          tags: ['Membresias'],
          summary: 'Obtener semaforo de membresias',
          description: 'Devuelve el conteo de membresias activas, por vencer y vencidas.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Datos del semaforo' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/active': {
        get: {
          tags: ['Membresias'],
          summary: 'Membresias activas',
          description: 'Devuelve las membresias activas del sistema.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de membresias activas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Membresia' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/expired': {
        get: {
          tags: ['Membresias'],
          summary: 'Membresias vencidas',
          description: 'Devuelve las membresias vencidas del sistema.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de membresias vencidas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Membresia' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/my-plan': {
        get: {
          tags: ['Membresias'],
          summary: 'Mi plan actual',
          description: 'Devuelve el plan actual del cliente autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Plan actual del cliente' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/my-plan-enhanced': {
        get: {
          tags: ['Membresias'],
          summary: 'Mi plan actual (mejorado)',
          description: 'Devuelve el plan actual del cliente con informacion detallada.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Plan actual del cliente (detallado)' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/my': {
        get: {
          tags: ['Membresias'],
          summary: 'Mis membresias',
          description: 'Devuelve las membresias del cliente autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de membresias del cliente', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Membresia' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/prices': {
        get: {
          tags: ['Membresias'],
          summary: 'Obtener precios',
          description: 'Devuelve la configuracion de precios de membresias.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Configuracion de precios' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        put: {
          tags: ['Membresias'],
          summary: 'Actualizar precios',
          description: 'Actualiza los precios de membresias. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    Diaria: { type: 'number', example: 10000 },
                    Semanal: { type: 'number', example: 50000 },
                    Mensual: { type: 'number', example: 120000 },
                    Trimestral: { type: 'number', example: 300000 },
                    Anual: { type: 'number', example: 600000 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Precios actualizados' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/change-plan': {
        put: {
          tags: ['Membresias'],
          summary: 'Cambiar de plan',
          description: 'Permite al cliente cambiar a un plan superior.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nuevoTipo: { type: 'string', example: 'Premium', description: 'Nuevo tipo de membresia' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Plan cambiado exitosamente' },
            400: { description: 'No se puede cambiar a un plan inferior', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/history': {
        get: {
          tags: ['Membresias'],
          summary: 'Historial de membresias',
          description: 'Devuelve el historial de cambios de membresia del cliente autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Historial de membresias' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/{id}': {
        put: {
          tags: ['Membresias'],
          summary: 'Actualizar una membresia',
          description: 'Actualiza los datos de una membresia especifica.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la membresia' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tipo: { type: 'string' },
                    estado: { type: 'string', enum: ['activa', 'vencida', 'cancelada'] },
                    fechaVencimiento: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Membresia actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Membresia' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Membresia no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/{id}/renew': {
        put: {
          tags: ['Membresias'],
          summary: 'Renovar membresia',
          description: 'Renueva una membresia existente.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la membresia' }
          ],
          responses: {
            200: { description: 'Membresia renovada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Membresia' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Membresia no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/memberships/{id}/cancel': {
        put: {
          tags: ['Membresias'],
          summary: 'Cancelar membresia',
          description: 'Cancela una membresia existente.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la membresia' }
          ],
          responses: {
            200: { description: 'Membresia cancelada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Membresia' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Membresia no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // PLANES
      // ──────────────────────────────────────────────
      '/api/plans': {
        get: {
          tags: ['Planes'],
          summary: 'Listar todos los planes',
          description: 'Devuelve todos los planes de membresia disponibles.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de planes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Plan' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        post: {
          tags: ['Planes'],
          summary: 'Crear un plan',
          description: 'Crea un nuevo plan de membresia. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'precio', 'duracionDias'],
                  properties: {
                    nombre: { type: 'string', example: 'Premium' },
                    precio: { type: 'number', example: 180000 },
                    duracionDias: { type: 'integer', example: 30 },
                    descripcion: { type: 'string', example: 'La experiencia completa' },
                    beneficios: { type: 'array', items: { type: 'string' }, example: ['Acceso ilimitado', 'Entrenador personal'] },
                    activo: { type: 'boolean', example: true }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Plan creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Plan' } } } },
            400: { description: 'Error de validacion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/plans/{id}': {
        get: {
          tags: ['Planes'],
          summary: 'Obtener un plan por ID',
          description: 'Devuelve los datos de un plan especifico.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del plan' }
          ],
          responses: {
            200: { description: 'Datos del plan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Plan' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Plan no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        put: {
          tags: ['Planes'],
          summary: 'Actualizar un plan',
          description: 'Actualiza los datos de un plan existente. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del plan' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nombre: { type: 'string' },
                    precio: { type: 'number' },
                    duracionDias: { type: 'integer' },
                    descripcion: { type: 'string' },
                    beneficios: { type: 'array', items: { type: 'string' } },
                    activo: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Plan actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Plan' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Plan no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        delete: {
          tags: ['Planes'],
          summary: 'Eliminar un plan',
          description: 'Elimina un plan del sistema. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del plan' }
          ],
          responses: {
            200: { description: 'Plan eliminado' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Plan no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/public/plans': {
        get: {
          tags: ['Planes'],
          summary: 'Planes publicos',
          description: 'Devuelve los planes activos sin necesidad de autenticacion.',
          responses: {
            200: { description: 'Lista de planes activos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Plan' } } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // RUTINAS
      // ──────────────────────────────────────────────
      '/api/routines': {
        get: {
          tags: ['Rutinas'],
          summary: 'Listar todas las rutinas',
          description: 'Devuelve todas las rutinas plantilla disponibles.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de rutinas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Rutina' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        post: {
          tags: ['Rutinas'],
          summary: 'Crear una rutina',
          description: 'Crea una nueva rutina plantilla.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'nivel', 'objetivo', 'grupoMuscularPrincipal', 'ejercicios'],
                  properties: {
                    nombre: { type: 'string', example: 'Rutina de pecho y triceps' },
                    descripcion: { type: 'string', example: 'Rutina enfocada en pecho y triceps' },
                    nivel: { type: 'string', enum: ['Principiante', 'Intermedio', 'Avanzado'], example: 'Intermedio' },
                    objetivo: { type: 'string', example: 'Hipertrofia' },
                    grupoMuscularPrincipal: { type: 'string', example: 'Pecho' },
                    grupoMuscularSecundario: { type: 'string', example: 'Triceps' },
                    ejercicios: { type: 'array', items: { type: 'object' }, description: 'Lista de ejercicios con series, repeticiones' },
                    esPlantilla: { type: 'boolean', example: true }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Rutina creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Rutina' } } } },
            400: { description: 'Error de validacion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routines/mi-rutina': {
        get: {
          tags: ['Rutinas'],
          summary: 'Mi rutina activa',
          description: 'Devuelve la rutina activa asignada al cliente autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Rutina activa del cliente', content: { 'application/json': { schema: { $ref: '#/components/schemas/RutinaAsignada' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routines/clientes/lista': {
        get: {
          tags: ['Rutinas'],
          summary: 'Lista de clientes',
          description: 'Devuelve la lista de clientes para asignar rutinas.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de clientes' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routines/{id}': {
        get: {
          tags: ['Rutinas'],
          summary: 'Obtener una rutina por ID',
          description: 'Devuelve los datos de una rutina especifica.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la rutina' }
          ],
          responses: {
            200: { description: 'Datos de la rutina', content: { 'application/json': { schema: { $ref: '#/components/schemas/Rutina' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Rutina no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        put: {
          tags: ['Rutinas'],
          summary: 'Actualizar una rutina',
          description: 'Actualiza los datos de una rutina existente.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la rutina' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nombre: { type: 'string' },
                    descripcion: { type: 'string' },
                    nivel: { type: 'string', enum: ['Principiante', 'Intermedio', 'Avanzado'] },
                    objetivo: { type: 'string' },
                    ejercicios: { type: 'array', items: { type: 'object' } }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Rutina actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Rutina' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Rutina no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        delete: {
          tags: ['Rutinas'],
          summary: 'Eliminar una rutina',
          description: 'Elimina una rutina y sus asignaciones asociadas.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la rutina' }
          ],
          responses: {
            200: { description: 'Rutina eliminada' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Rutina no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routines/{id}/assign': {
        post: {
          tags: ['Rutinas'],
          summary: 'Asignar rutina a un cliente',
          description: 'Asigna una rutina existente a un cliente.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la rutina' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['clienteId'],
                  properties: {
                    clienteId: { type: 'string', description: 'ID del cliente', example: '60f7b1b...' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Rutina asignada exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/RutinaAsignada' } } } },
            400: { description: 'El cliente ya tiene esta rutina asignada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Rutina o cliente no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // SOLICITUDES DE RUTINAS
      // ──────────────────────────────────────────────
      '/api/routine-requests': {
        post: {
          tags: ['SolicitudesRutinas'],
          summary: 'Crear solicitud de rutina',
          description: 'Crea una nueva solicitud de rutina personalizada. Solo accesible por Clientes.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['edad', 'peso', 'estatura', 'experiencia', 'tiempoEntrenando', 'diasDisponibles', 'objetivo', 'metaPersonal'],
                  properties: {
                    edad: { type: 'integer', example: 25 },
                    peso: { type: 'number', example: 75.5 },
                    estatura: { type: 'number', example: 175 },
                    experiencia: { type: 'string', example: 'Intermedio' },
                    tiempoEntrenando: { type: 'string', example: '6 meses' },
                    diasDisponibles: { type: 'string', example: 'Lunes, Miercoles, Viernes' },
                    objetivo: { type: 'string', example: 'Hipertrofia' },
                    otroObjetivo: { type: 'string', example: 'Mejorar resistencia' },
                    metaPersonal: { type: 'string', example: 'Ganar 5kg de musculo en 3 meses' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Solicitud creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/SolicitudRutina' } } } },
            400: { description: 'Error de validacion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        get: {
          tags: ['SolicitudesRutinas'],
          summary: 'Listar solicitudes pendientes',
          description: 'Devuelve todas las solicitudes de rutina. Solo accesible por Administradores y Entrenadores.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de solicitudes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SolicitudRutina' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routine-requests/mis': {
        get: {
          tags: ['SolicitudesRutinas'],
          summary: 'Mis solicitudes de rutina',
          description: 'Devuelve las solicitudes del cliente autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de solicitudes del cliente', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SolicitudRutina' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routine-requests/{id}': {
        get: {
          tags: ['SolicitudesRutinas'],
          summary: 'Obtener solicitud por ID',
          description: 'Devuelve una solicitud especifica. Los clientes solo ven sus propias solicitudes.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la solicitud' }
          ],
          responses: {
            200: { description: 'Datos de la solicitud', content: { 'application/json': { schema: { $ref: '#/components/schemas/SolicitudRutina' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'No autorizado para ver esta solicitud', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Solicitud no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routine-requests/{id}/approve': {
        put: {
          tags: ['SolicitudesRutinas'],
          summary: 'Aprobar solicitud',
          description: 'Marca la solicitud como "En revision" por el entrenador.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la solicitud' }
          ],
          responses: {
            200: { description: 'Solicitud aprobada', content: { 'application/json': { schema: { $ref: '#/components/schemas/SolicitudRutina' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Solicitud no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routine-requests/{id}/reject': {
        put: {
          tags: ['SolicitudesRutinas'],
          summary: 'Rechazar solicitud',
          description: 'Rechaza una solicitud con un motivo opcional.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la solicitud' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    motivo: { type: 'string', example: 'Faltan datos medicos' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Solicitud rechazada', content: { 'application/json': { schema: { $ref: '#/components/schemas/SolicitudRutina' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Solicitud no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/routine-requests/{id}/assign-routine': {
        post: {
          tags: ['SolicitudesRutinas'],
          summary: 'Asignar rutina a solicitud',
          description: 'Asigna una rutina a la solicitud y la marca como completada.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la solicitud' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['rutinaId'],
                  properties: {
                    rutinaId: { type: 'string', description: 'ID de la rutina a asignar' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Rutina asignada a la solicitud', content: { 'application/json': { schema: { $ref: '#/components/schemas/SolicitudRutina' } } } },
            400: { description: 'Datos invalidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Solicitud o rutina no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // ASISTENCIA
      // ──────────────────────────────────────────────
      '/api/attendance/qr': {
        get: {
          tags: ['Asistencia'],
          summary: 'Generar codigo QR',
          description: 'Genera un token QR para que el cliente registre su asistencia.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Token QR generado' },
            403: { description: 'Membresia inactiva o vencida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        post: {
          tags: ['Asistencia'],
          summary: 'Registrar asistencia por QR',
          description: 'Registra la asistencia utilizando los datos de un codigo QR escaneado.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['qrData'],
                  properties: {
                    qrData: { type: 'string', description: 'Datos del QR escaneado (JSON string u objeto)', example: '{"clienteId":"60f7...","qrToken":"abc123","fecha":"2026-07-09"}' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Asistencia registrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Asistencia' } } } },
            400: { description: 'Datos invalidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/attendance/manual': {
        post: {
          tags: ['Asistencia'],
          summary: 'Registrar asistencia manual',
          description: 'Registra asistencia manualmente para un cliente.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['clienteId'],
                  properties: {
                    clienteId: { type: 'string', description: 'ID del cliente', example: '60f7b1b...' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Asistencia registrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Asistencia' } } } },
            400: { description: 'Datos invalidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/attendance/my': {
        get: {
          tags: ['Asistencia'],
          summary: 'Mi historial de asistencia',
          description: 'Devuelve las ultimas 30 asistencias del cliente autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Historial de asistencia', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Asistencia' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/attendance': {
        get: {
          tags: ['Asistencia'],
          summary: 'Listar todas las asistencias',
          description: 'Devuelve todas las asistencias registradas. Opcionalmente filtra por fecha.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'fecha', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filtrar por fecha (YYYY-MM-DD)' }
          ],
          responses: {
            200: { description: 'Lista de asistencias', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Asistencia' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // NOTIFICACIONES
      // ──────────────────────────────────────────────
      '/api/notifications': {
        post: {
          tags: ['Notificaciones'],
          summary: 'Crear notificacion',
          description: 'Crea una nueva notificacion para un usuario. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['usuarioId', 'asunto', 'mensaje'],
                  properties: {
                    usuarioId: { type: 'string', description: 'ID del usuario destinatario' },
                    asunto: { type: 'string', example: 'Bienvenido al gimnasio' },
                    mensaje: { type: 'string', example: 'Tu membresia ha sido activada' },
                    severidad: { type: 'string', enum: ['info', 'warning', 'urgent'], example: 'info' },
                    tipo: { type: 'string', enum: ['email', 'whatsapp', 'in-app'], example: 'in-app' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Notificacion creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Notificacion' } } } },
            400: { description: 'Error de validacion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        get: {
          tags: ['Notificaciones'],
          summary: 'Listar todas las notificaciones',
          description: 'Devuelve todas las notificaciones del sistema. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de notificaciones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notificacion' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/notifications/my': {
        get: {
          tags: ['Notificaciones'],
          summary: 'Mis notificaciones',
          description: 'Devuelve las notificaciones del usuario autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de notificaciones del usuario', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notificacion' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/notifications/unread-count': {
        get: {
          tags: ['Notificaciones'],
          summary: 'Contar notificaciones no leidas',
          description: 'Devuelve el numero de notificaciones no leidas del usuario autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Conteo de no leidas' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/notifications/read-all': {
        put: {
          tags: ['Notificaciones'],
          summary: 'Marcar todas como leidas',
          description: 'Marca todas las notificaciones del usuario autenticado como leidas.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Todas marcadas como leidas' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/notifications/{id}/read': {
        put: {
          tags: ['Notificaciones'],
          summary: 'Marcar notificacion como leida',
          description: 'Marca una notificacion especifica como leida.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID de la notificacion' }
          ],
          responses: {
            200: { description: 'Notificacion marcada como leida' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Notificacion no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // ESTADÍSTICAS / DASHBOARD
      // ──────────────────────────────────────────────
      '/api/dashboard/stats': {
        get: {
          tags: ['Estadisticas'],
          summary: 'Obtener estadisticas del dashboard',
          description: 'Devuelve estadisticas generales del gimnasio. Solo accesible por Administradores.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Estadisticas del dashboard' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Acceso denegado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },

      // ──────────────────────────────────────────────
      // PROGRESO
      // ──────────────────────────────────────────────
      '/api/progress': {
        post: {
          tags: ['Progreso'],
          summary: 'Registrar progreso',
          description: 'Registra una nueva medicion de progreso fisico.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    peso: { type: 'number', example: 75.5 },
                    altura: { type: 'number', example: 175 },
                    porcentajeGrasa: { type: 'number', example: 15 },
                    medidas: {
                      type: 'object',
                      properties: {
                        brazo: { type: 'number', example: 35 },
                        pierna: { type: 'number', example: 55 },
                        cintura: { type: 'number', example: 80 },
                        pecho: { type: 'number', example: 100 }
                      }
                    },
                    observaciones: { type: 'string', example: 'Buena progresion esta semana' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Progreso registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Progreso' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        },
        get: {
          tags: ['Progreso'],
          summary: 'Listar progreso',
          description: 'Devuelve el historial de progreso. Si se especifica clienteId, filtra por cliente.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'clienteId', in: 'query', schema: { type: 'string' }, description: 'ID del cliente (opcional)' }
          ],
          responses: {
            200: { description: 'Lista de progreso', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Progreso' } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/progress/last': {
        get: {
          tags: ['Progreso'],
          summary: 'Ultimo registro de progreso',
          description: 'Devuelve el ultimo registro de progreso del usuario autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Ultimo progreso registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Progreso' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            500: { description: 'Error interno del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsDoc(swaggerOptions);
