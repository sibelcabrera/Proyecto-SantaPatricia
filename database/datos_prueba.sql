-- =====================================================================
--  SANTA PATRICIA - DATOS DE PRUEBA
--  Ejecutar DESPUÉS de esquema.sql.
-- =====================================================================
USE santapatricia_db;

-- ---------------------------------------------------------------------
-- Roles (los 4 definidos en Jira para HU01)
-- ---------------------------------------------------------------------
INSERT INTO roles (codigo, nombre) VALUES
    ('ADMINISTRADOR',        'Administrador'),
    ('ENCARGADO_PRODUCCION', 'Encargado de Producción'),
    ('CAJERO',               'Cajero'),
    ('ALMACENERO',           'Almacenero');

-- ---------------------------------------------------------------------
-- Usuarios de prueba  (correo / contraseña)
-- La contraseña se ve tal cual, por decisión del equipo (ver esquema.sql).
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nombre, correo, password, rol_id, activo)
SELECT v.nombre, v.correo, v.password, r.id, v.activo
FROM (VALUES
    ROW('Valeria Ramos',  'admin@santapatricia.pe',        'Admin123', 'ADMINISTRADOR',        TRUE),
    ROW('Carlos Mendoza', 'produccion@santapatricia.pe',   'Prod123',  'ENCARGADO_PRODUCCION', TRUE),
    ROW('Lucía Torres',   'caja@santapatricia.pe',         'Caja123',  'CAJERO',               TRUE),
    ROW('Jorge Quispe',   'almacen@santapatricia.pe',      'Alma123',  'ALMACENERO',           TRUE),
    ROW('Rosa Huamán',    'rosa.huaman@santapatricia.pe',  'Rosa123',  'CAJERO',               TRUE),
    ROW('Pedro Salas',    'pedro.salas@santapatricia.pe',  'Pedro123', 'ALMACENERO',           FALSE)  -- dado de baja: no puede entrar
) AS v (nombre, correo, password, rol, activo)
JOIN roles r ON r.codigo = v.rol;

-- ---------------------------------------------------------------------
-- Categorías (áreas del negocio)
-- ---------------------------------------------------------------------
INSERT INTO categorias (codigo, nombre) VALUES
    ('COCINA',     'Cocina'),
    ('PANADERIA',  'Panadería'),
    ('PASTELERIA', 'Pastelería'),
    ('CAFETERIA',  'Cafetería'),
    ('MINIMARKET', 'Minimarket');

-- ---------------------------------------------------------------------
-- Productos (51 activos + 1 eliminado)
-- Columnas: sku, nombre, área, unidad, stock actual, stock mínimo, precio (S/), vencimiento
-- Estado que verá el sistema:  stock <= mínimo/2 -> CRÍTICO | stock <= mínimo -> BAJO | si no -> ÓPTIMO
-- ---------------------------------------------------------------------
INSERT INTO productos (sku, nombre, categoria_id, unidad_medida, stock_actual, stock_minimo, precio_unitario, fecha_vencimiento, activo)
SELECT v.sku, v.nombre, c.id, v.unidad, v.stock, v.minimo, v.precio, v.vence, v.activo
FROM (VALUES
    -- PANADERÍA
    ROW('HAR-001', 'Harina de trigo panadera',        'PANADERIA',  'KG',  120.00,   50.00,  3.80, DATE '2027-01-15', TRUE),
    ROW('HAR-002', 'Harina integral',                 'PANADERIA',  'KG',   18.00,   25.00,  4.50, DATE '2026-12-20', TRUE),
    ROW('LEV-001', 'Levadura fresca',                 'PANADERIA',  'KG',    4.00,   10.00, 12.50, DATE '2026-10-20', TRUE),
    ROW('LEV-002', 'Levadura seca instantánea',       'PANADERIA',  'G',  1500.00, 1000.00,  0.05, DATE '2027-03-01', TRUE),
    ROW('SAL-001', 'Sal de mesa',                     'PANADERIA',  'KG',   25.00,   10.00,  1.20, DATE '2028-01-01', TRUE),
    ROW('MAN-001', 'Manteca vegetal',                 'PANADERIA',  'KG',   30.00,   20.00,  8.90, DATE '2027-02-10', TRUE),
    ROW('MEJ-001', 'Mejorador de masa',               'PANADERIA',  'KG',    6.00,    5.00, 18.00, DATE '2027-04-30', TRUE),
    ROW('AJO-001', 'Ajonjolí',                        'PANADERIA',  'KG',    2.00,    3.00, 22.00, DATE '2027-01-31', TRUE),
    ROW('BOL-001', 'Bolsa de papel para pan',         'PANADERIA',  'PAQ',  40.00,   20.00,  6.50, NULL,              TRUE),
    ROW('PAN-001', 'Pan francés (bandeja)',           'PANADERIA',  'UND',  80.00,  120.00,  0.20, DATE '2026-10-12', TRUE),
    -- PASTELERÍA
    ROW('AZU-001', 'Azúcar blanca',                   'PASTELERIA', 'KG',   90.00,   40.00,  3.50, DATE '2027-06-30', TRUE),
    ROW('AZU-002', 'Azúcar rubia',                    'PASTELERIA', 'KG',   15.00,   20.00,  3.20, DATE '2027-06-30', TRUE),
    ROW('AZU-003', 'Azúcar en polvo',                 'PASTELERIA', 'KG',    8.00,   10.00,  6.80, DATE '2027-03-15', TRUE),
    ROW('MAN-002', 'Mantequilla sin sal',             'PASTELERIA', 'KG',    5.00,   12.00, 28.00, DATE '2026-11-05', TRUE),
    ROW('CRE-001', 'Crema de leche',                  'PASTELERIA', 'L',    12.00,   10.00, 16.50, DATE '2026-10-25', TRUE),
    ROW('COB-001', 'Cobertura de chocolate bitter',   'PASTELERIA', 'KG',    7.00,    5.00, 38.00, DATE '2027-02-28', TRUE),
    ROW('CAC-001', 'Cacao en polvo',                  'PASTELERIA', 'KG',    4.00,    4.00, 24.00, DATE '2027-05-10', TRUE),
    ROW('ESE-001', 'Esencia de vainilla',             'PASTELERIA', 'ML',  900.00,  500.00,  0.09, DATE '2027-08-01', TRUE),
    ROW('FRE-001', 'Fresas',                          'PASTELERIA', 'KG',    3.00,    8.00,  9.00, DATE '2026-10-14', TRUE),
    ROW('MAN-003', 'Manjar blanco',                   'PASTELERIA', 'KG',   10.00,    6.00, 14.00, DATE '2026-11-30', TRUE),
    ROW('HUE-001', 'Huevos de gallina',               'PASTELERIA', 'UND', 360.00,  300.00,  0.55, DATE '2026-10-28', TRUE),
    ROW('POL-001', 'Polvo de hornear',                'PASTELERIA', 'G',   800.00,  500.00,  0.04, DATE '2027-07-15', TRUE),
    ROW('TOR-001', 'Torta selva negra mediana',       'PASTELERIA', 'UND',   2.00,    6.00, 55.00, DATE '2026-10-13', TRUE),
    ROW('CAJ-001', 'Caja para torta 20 cm',           'PASTELERIA', 'UND',  45.00,   30.00,  2.80, NULL,              TRUE),
    -- COCINA
    ROW('ACE-001', 'Aceite vegetal',                  'COCINA',     'L',    45.00,   20.00,  9.90, DATE '2027-05-01', TRUE),
    ROW('POL-002', 'Pollo entero',                    'COCINA',     'KG',   12.00,   15.00, 11.50, DATE '2026-10-14', TRUE),
    ROW('PAP-001', 'Papa amarilla',                   'COCINA',     'KG',   20.00,   25.00,  3.40, DATE '2026-10-25', TRUE),
    ROW('CEB-001', 'Cebolla roja',                    'COCINA',     'KG',    9.00,   10.00,  2.60, DATE '2026-10-30', TRUE),
    ROW('AJO-002', 'Ajo pelado',                      'COCINA',     'KG',    1.00,    2.00, 18.00, DATE '2026-11-10', TRUE),
    ROW('ARR-001', 'Arroz extra',                     'COCINA',     'KG',   75.00,   50.00,  4.20, DATE '2027-09-01', TRUE),
    ROW('QUE-001', 'Queso fresco',                    'COCINA',     'KG',    4.00,    6.00, 19.00, DATE '2026-10-18', TRUE),
    ROW('JAM-001', 'Jamón inglés',                    'COCINA',     'KG',    3.00,    4.00, 32.00, DATE '2026-10-22', TRUE),
    ROW('LEC-001', 'Leche evaporada',                 'COCINA',     'UND',  48.00,   24.00,  4.20, DATE '2027-02-10', TRUE),
    -- CAFETERÍA
    ROW('CAF-001', 'Café en grano tostado',           'CAFETERIA',  'KG',    6.00,    5.00, 48.00, DATE '2027-03-31', TRUE),
    ROW('CAF-002', 'Café molido',                     'CAFETERIA',  'KG',    2.00,    4.00, 45.00, DATE '2027-02-28', TRUE),
    ROW('LEC-002', 'Leche fresca entera',             'CAFETERIA',  'L',    24.00,   30.00,  4.60, DATE '2026-10-16', TRUE),
    ROW('LEC-003', 'Leche deslactosada',              'CAFETERIA',  'L',    10.00,   12.00,  5.20, DATE '2026-10-19', TRUE),
    ROW('TEF-001', 'Té filtrante (caja x 100)',       'CAFETERIA',  'PAQ',   6.00,    4.00, 12.00, DATE '2027-12-31', TRUE),
    ROW('MAN-004', 'Manzanilla filtrante',            'CAFETERIA',  'PAQ',   3.00,    4.00, 10.00, DATE '2027-11-30', TRUE),
    ROW('JAR-001', 'Jarabe de vainilla',              'CAFETERIA',  'ML', 1500.00, 1000.00,  0.06, DATE '2027-05-20', TRUE),
    ROW('VAS-001', 'Vaso de papel 8 oz',              'CAFETERIA',  'UND', 300.00,  200.00,  0.25, NULL,              TRUE),
    ROW('TAP-001', 'Tapa para vaso 8 oz',             'CAFETERIA',  'UND',  90.00,  200.00,  0.10, NULL,              TRUE),
    ROW('AZU-004', 'Azúcar en sobre',                 'CAFETERIA',  'UND', 500.00,  300.00,  0.05, DATE '2028-01-31', TRUE),
    -- MINIMARKET
    ROW('GAS-001', 'Gaseosa 500 ml',                  'MINIMARKET', 'UND', 240.00,   60.00,  2.50, DATE '2027-03-30', TRUE),
    ROW('AGU-001', 'Agua mineral 625 ml',             'MINIMARKET', 'UND',  96.00,   48.00,  1.80, DATE '2027-06-30', TRUE),
    ROW('GAL-001', 'Galletas de soda (paquete)',      'MINIMARKET', 'PAQ',  18.00,   24.00,  3.90, DATE '2027-01-20', TRUE),
    ROW('YOG-001', 'Yogurt de fresa 1 L',             'MINIMARKET', 'UND',   6.00,   12.00,  7.50, DATE '2026-10-21', TRUE),
    ROW('CHO-001', 'Chocolate para taza',             'MINIMARKET', 'UND',  30.00,   15.00,  4.80, DATE '2027-04-15', TRUE),
    ROW('MER-001', 'Mermelada de fresa',              'MINIMARKET', 'UND',  14.00,   10.00,  6.20, DATE '2027-08-10', TRUE),
    ROW('DET-001', 'Detergente 1 kg',                 'MINIMARKET', 'UND',   8.00,    6.00,  9.50, NULL,              TRUE),
    ROW('PAP-002', 'Papel higiénico x 4',             'MINIMARKET', 'PAQ',  20.00,   15.00,  5.40, NULL,              TRUE),
    -- Producto ELIMINADO (activo = FALSE): no aparece en la lista, pero queda en la base
    ROW('MAR-001', 'Margarina común (descontinuada)', 'PANADERIA',  'KG',    0.00,   10.00,  5.00, NULL,              FALSE)
) AS v (sku, nombre, categoria, unidad, stock, minimo, precio, vence, activo)
JOIN categorias c ON c.codigo = v.categoria;

-- ---------------------------------------------------------------------
-- Comprobación
-- ---------------------------------------------------------------------
SELECT r.nombre AS rol, u.nombre, u.correo, u.password, u.activo
FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.id;

SELECT c.nombre AS area, COUNT(*) AS productos_activos
FROM productos p JOIN categorias c ON c.id = p.categoria_id
WHERE p.activo
GROUP BY c.nombre ORDER BY c.nombre;
