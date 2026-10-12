-- =====================================================================
--  SANTA PATRICIA - Sistema de Inventario (Sprint 1)
--  ESQUEMA de la base de datos: crea la base y sus 6 tablas.
--
--  Cómo usarlo: MySQL Workbench -> File -> Open SQL Script -> este archivo
--               -> botón del rayo (ejecutar todo).
--  Después ejecuta datos_prueba.sql para llenarla con datos.
--
--  ¡OJO! Este script BORRA y vuelve a crear la base santapatricia_db.
--  No toca la base anterior (santa_patricia).
-- =====================================================================

DROP DATABASE IF EXISTS santapatricia_db;

CREATE DATABASE santapatricia_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;   -- "_ci" = no distingue mayúsculas: "Harina" = "harina"

USE santapatricia_db;

-- ---------------------------------------------------------------------
-- 1. ROLES  (HU01)
-- Los 4 perfiles del negocio. Cada usuario tiene uno.
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id          INT          NOT NULL AUTO_INCREMENT,
    codigo      VARCHAR(30)  NOT NULL,   -- lo que usa el sistema:    CAJERO
    nombre      VARCHAR(50)  NOT NULL,   -- lo que ve el usuario:      Cajero
    CONSTRAINT pk_roles        PRIMARY KEY (id),
    CONSTRAINT uk_roles_codigo UNIQUE (codigo)
);

-- ---------------------------------------------------------------------
-- 2. USUARIOS  (HU01)
--
-- NOTA SOBRE LA CONTRASEÑA:
-- Por decisión del equipo (proyecto académico), la contraseña se guarda
-- tal cual se escribe, para que sea fácil de entender y probar.
-- En un sistema real NUNCA se hace así: se guarda un "hash" (por ejemplo
-- BCrypt), que es un texto irreversible; así, si alguien roba la base de
-- datos, no puede leer las contraseñas.
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id                INT          NOT NULL AUTO_INCREMENT,
    nombre            VARCHAR(100) NOT NULL,
    correo            VARCHAR(120) NOT NULL,
    password          VARCHAR(50)  NOT NULL,             -- contraseña visible (ver nota)
    rol_id            INT          NOT NULL,
    activo            BOOLEAN      NOT NULL DEFAULT TRUE, -- FALSE = usuario dado de baja
    intentos_fallidos INT          NOT NULL DEFAULT 0,    -- contraseñas incorrectas seguidas
    bloqueado_hasta   DATETIME     NULL,                  -- bloqueo temporal (5 intentos -> 15 min)
    ultimo_acceso     DATETIME     NULL,
    creado_en         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuarios        PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_correo UNIQUE (correo),
    CONSTRAINT fk_usuarios_rol    FOREIGN KEY (rol_id) REFERENCES roles (id)
);

-- ---------------------------------------------------------------------
-- 2b. TURNOS  (HU01 - ampliación pedida en la revisión del Sprint 1)
-- Los horarios de trabajo del local. Quien inicia sesión elige su turno.
-- ---------------------------------------------------------------------
CREATE TABLE turnos (
    id           INT         NOT NULL AUTO_INCREMENT,
    codigo       VARCHAR(10) NOT NULL,   -- MANANA
    nombre       VARCHAR(30) NOT NULL,   -- Mañana
    hora_inicio  TIME        NOT NULL,   -- 06:00
    hora_fin     TIME        NOT NULL,   -- 14:30
    CONSTRAINT pk_turnos        PRIMARY KEY (id),
    CONSTRAINT uk_turnos_codigo UNIQUE (codigo)
);

-- ---------------------------------------------------------------------
-- 2c. INICIOS_TURNO  (HU01)
-- Cada login correcto deja aquí una fila: QUIÉN entró, en QUÉ turno y CUÁNDO.
-- Lo escribe el sistema (nadie lo llena a mano). En el Sprint 2 los
-- movimientos (entradas/salidas) también guardarán el turno.
-- ---------------------------------------------------------------------
CREATE TABLE inicios_turno (
    id          INT      NOT NULL AUTO_INCREMENT,
    usuario_id  INT      NOT NULL,
    turno_id    INT      NOT NULL,
    inicio      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_inicios_turno         PRIMARY KEY (id),
    CONSTRAINT fk_inicios_turno_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT fk_inicios_turno_turno   FOREIGN KEY (turno_id)   REFERENCES turnos (id)
);

-- ---------------------------------------------------------------------
-- 3. CATEGORIAS  (HU02)  -- las áreas del negocio
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
    id      INT         NOT NULL AUTO_INCREMENT,
    codigo  VARCHAR(20) NOT NULL,   -- PANADERIA
    nombre  VARCHAR(50) NOT NULL,   -- Panadería
    CONSTRAINT pk_categorias        PRIMARY KEY (id),
    CONSTRAINT uk_categorias_codigo UNIQUE (codigo)
);

-- ---------------------------------------------------------------------
-- 4. PRODUCTOS  (HU02)  -- el catálogo: insumos y productos del local
--
-- sku    : código interno. El sistema lo genera solo con las 3 primeras
--          letras del nombre + un número: "Azúcar rubia" -> AZU-001.
-- estado : NO se guarda. El backend lo calcula comparando stock actual
--          con stock mínimo (ÓPTIMO / BAJO / CRÍTICO).
-- activo : FALSE = eliminado. No se borra de verdad, para no perder historial.
-- ---------------------------------------------------------------------
CREATE TABLE productos (
    id                INT           NOT NULL AUTO_INCREMENT,
    sku               VARCHAR(20)   NOT NULL,
    nombre            VARCHAR(100)  NOT NULL,
    categoria_id      INT           NOT NULL,
    unidad_medida     ENUM('KG','G','L','ML','UND','PAQ') NOT NULL,
    stock_actual      DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo      DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_unitario   DECIMAL(10,2) NOT NULL DEFAULT 0,   -- soles por unidad de medida
    fecha_vencimiento DATE          NULL,                 -- NULL = no vence (ej. bolsas)
    activo            BOOLEAN       NOT NULL DEFAULT TRUE,
    creado_en         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_productos           PRIMARY KEY (id),
    CONSTRAINT uk_productos_sku       UNIQUE (sku),
    CONSTRAINT uk_productos_nombre    UNIQUE (nombre),
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id),
    CONSTRAINT ck_productos_stock     CHECK (stock_actual >= 0 AND stock_minimo >= 0),
    CONSTRAINT ck_productos_precio    CHECK (precio_unitario >= 0)
);

SHOW TABLES;
