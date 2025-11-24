--=================================================================
-- CREACION TABLA CATEGORIA_SERVICIO
--=================================================================
CREATE TABLE CATEGORIA_SERVICIO 
(
  id_categ_serv     INTEGER      NOT NULL,
  nombre_categ_serv VARCHAR(50) NOT NULL
);
-- PK DE CATEGORIA_SERVICIO
ALTER TABLE CATEGORIA_SERVICIO 
  ADD CONSTRAINT CATEGORIA_SERVICIO_PK PRIMARY KEY (id_categ_serv);

--=================================================================
-- CREACION TABLA CERTIFICACION
--=================================================================
CREATE TABLE CERTIFICACION 
(
  id_certificacion  INTEGER       NOT NULL,
  nom_certificado   VARCHAR(50) NOT NULL,
  entidad_emisora   VARCHAR(50) NOT NULL,
  fecha_emision     DATE              NOT NULL,
  url_verificacion  VARCHAR(250) NOT NULL,
  PERFIL_id_perfil  INTEGER       NOT NULL,
  id_perfil         INTEGER            NOT NULL,
  id_perfil1        INTEGER            NOT NULL
);
-- PK DE CERTIFICACION
ALTER TABLE CERTIFICACION 
  ADD CONSTRAINT CERTIFICACION_PK PRIMARY KEY (id_certificacion);

--=================================================================
-- CREACION TABLA PAIS
--=================================================================
CREATE TABLE PAIS 
(
  id_pais     INTEGER       NOT NULL,
  nombre_pais VARCHAR(25) NOT NULL
);
-- PK DE PAIS
ALTER TABLE PAIS 
  ADD CONSTRAINT PAIS_PK PRIMARY KEY (id_pais);

--=================================================================
-- CREACION TABLA REGION
--=================================================================
CREATE TABLE REGION 
(
  id_region     INTEGER       NOT NULL,
  nombre_region VARCHAR(25) NOT NULL,
  PAIS_id_pais  INTEGER       NOT NULL
);
-- PK DE REGION
ALTER TABLE REGION 
  ADD CONSTRAINT REGION_PK PRIMARY KEY (id_region);

--=================================================================
-- CREACION TABLA CIUDAD
--=================================================================
CREATE TABLE CIUDAD 
(
  id_ciudad           INTEGER       NOT NULL,
  nombre_ciudad       VARCHAR(25) NOT NULL,
  REGION_id_region    INTEGER       NOT NULL,
  REGION_PAIS_id_pais INTEGER       NOT NULL
);
-- PK DE CIUDAD
ALTER TABLE CIUDAD 
  ADD CONSTRAINT CIUDAD_PK PRIMARY KEY (id_ciudad);

--=================================================================
-- CREACION TABLA PERSONA
--=================================================================
CREATE TABLE PERSONA 
(
  id_persona             INTEGER       NOT NULL,
  p_nombre               VARCHAR(25) NOT NULL,
  s_nombre               VARCHAR(25) NOT NULL,
  ap_paterno             VARCHAR(25) NOT NULL,
  ap_materno             VARCHAR(25) NOT NULL,
  email                  VARCHAR(25) NOT NULL,
  telefono               VARCHAR(25) NOT NULL,
  fecha_nacimiento       DATE              NOT NULL,
  MEMBRESIA_id_membresia INTEGER           NOT NULL
);
-- PK DE PERSONA
ALTER TABLE PERSONA 
  ADD CONSTRAINT PERSONA_PK PRIMARY KEY (id_persona);

--=================================================================
-- CREACION TABLA MEMBRESIA
--=================================================================
CREATE TABLE MEMBRESIA 
(
  id_membresia     INTEGER          NOT NULL,
  nombre_membresia VARCHAR(25) NOT NULL
);
-- PK DE MEMBRESIA
ALTER TABLE MEMBRESIA 
  ADD CONSTRAINT MEMBRESIA_PK PRIMARY KEY (id_membresia);

--=================================================================
-- CREACION TABLA CLIENTE
--=================================================================
CREATE TABLE CLIENTE 
(
  id_persona   INTEGER NOT NULL,
  id_cliente   INTEGER      NOT NULL,
  id_membresia INTEGER      NOT NULL
);
--PK DE CLIENTE
ALTER TABLE CLIENTE 
  ADD CONSTRAINT CLIENTE_PK PRIMARY KEY (id_persona, id_membresia);
-- ATRIBUTO UNICO: id_cliente
ALTER TABLE CLIENTE 
  ADD CONSTRAINT CLIENTE_UK UNIQUE (id_cliente);

--=================================================================
-- CREACION TABLA TRABAJADOR
--=================================================================
CREATE TABLE TRABAJADOR 
(
  id_persona    INTEGER NOT NULL,
  id_trabajador INTEGER NOT NULL,
  id_membresia  INTEGER      NOT NULL
);
-- PK DE TRABAJADOR
ALTER TABLE TRABAJADOR 
  ADD CONSTRAINT TRABAJADOR_PK PRIMARY KEY (id_persona, id_membresia);
-- ATRIBUTO UNICO: id_trabajador
ALTER TABLE TRABAJADOR 
  ADD CONSTRAINT TRABAJADOR_UK UNIQUE (id_trabajador);

--=================================================================
-- CREACION TABLA COMUNA
--=================================================================
CREATE TABLE COMUNA 
(
  id_comuna        INTEGER       NOT NULL,
  nombre_comuna    VARCHAR(25) NOT NULL,  
  CIUDAD_id_ciudad INTEGER       NOT NULL
);
-- PK: id_comuna
ALTER TABLE COMUNA 
  ADD CONSTRAINT COMUNA_PK PRIMARY KEY (id_comuna);

--=================================================================
-- CREACION TABLA COMUNA_CLIENTE
--=================================================================
CREATE TABLE COMUNA_CLIENTE 
(
  COMUNA_id_comuna     INTEGER NOT NULL,
  CLIENTE_id_persona   INTEGER NOT NULL,
  CLIENTE_id_membresia INTEGER      NOT NULL
);
-- PK DE COMUNA_CLIENTE
ALTER TABLE COMUNA_CLIENTE 
  ADD CONSTRAINT COMUNA_CLIENTE_PK PRIMARY KEY (COMUNA_id_comuna, CLIENTE_id_persona, CLIENTE_id_membresia);

--=================================================================
-- CREACION TABLA SERVICIO
--=================================================================
CREATE TABLE SERVICIO 
(
  id_servicio     INTEGER        NOT NULL,
  nombre_servicio VARCHAR(50)  NOT NULL,
  descripcion     VARCHAR(250),
  estado          CHAR(1)            NOT NULL
);
-- PK DE SERVICIO
ALTER TABLE SERVICIO 
  ADD CONSTRAINT SERVICIO_PK PRIMARY KEY (id_servicio);

--=================================================================
-- CREACION TABLA SERVICIO_CATEGORIA_SERVICIO
--=================================================================
CREATE TABLE SERVICIO_CATEGORIA_SERVICIO 
(
  SERVICIO_id_servicio INTEGER NOT NULL,
  CATEG_SERV_ID        INTEGER NOT NULL  
);
-- PK DE SERVICIO_CATEGORIA_SERVICIO
ALTER TABLE SERVICIO_CATEGORIA_SERVICIO 
  ADD CONSTRAINT SCS_PK PRIMARY KEY (SERVICIO_id_servicio, CATEG_SERV_ID);

--=================================================================
-- CREACION TABLA TRABAJADOR_COMUNA
--=================================================================
CREATE TABLE TRABAJADOR_COMUNA 
(
  TRABAJADOR_id_persona   INTEGER NOT NULL,
  TRABAJADOR_id_membresia INTEGER      NOT NULL,
  COMUNA_id_comuna        INTEGER NOT NULL
);
-- PK DE TRABAJADOR_COMUNA
ALTER TABLE TRABAJADOR_COMUNA 
  ADD CONSTRAINT TRABAJADOR_COMUNA_PK PRIMARY KEY (TRABAJADOR_id_persona, TRABAJADOR_id_membresia, COMUNA_id_comuna);

--=================================================================
-- CREACION TABLA TRABAJADOR_SERVICIO
--=================================================================
CREATE TABLE TRABAJADOR_SERVICIO 
(
  TRABAJADOR_id_persona   INTEGER NOT NULL,
  TRABAJADOR_id_membresia INTEGER      NOT NULL,
  SERVICIO_id_servicio    INTEGER NOT NULL
);
-- PK DE TRABAJADOR_SERVICIO
ALTER TABLE TRABAJADOR_SERVICIO 
  ADD CONSTRAINT TRABAJADOR_SERVICIO_PK PRIMARY KEY (TRABAJADOR_id_persona, TRABAJADOR_id_membresia, SERVICIO_id_servicio);

--=================================================================
-- CREACION TABLA TRABAJADOR_CERTIFICACION
--=================================================================
CREATE TABLE TRABAJADOR_CERTIFICACION 
(
  TRABAJADOR_id_persona          INTEGER NOT NULL,
  TRABAJADOR_id_membresia        INTEGER      NOT NULL,
  CERTIFICACION_id_certificacion INTEGER NOT NULL
);
-- PK DE TRABAJADOR_CERTIFICACION
ALTER TABLE TRABAJADOR_CERTIFICACION 
  ADD CONSTRAINT TRABAJADOR_CERTIFICACION_PK PRIMARY KEY (TRABAJADOR_id_persona, TRABAJADOR_id_membresia, CERTIFICACION_id_certificacion);

--=================================================================
-- CREACION TABLA CURRICULUM
--=================================================================
CREATE TABLE CURRICULUM 
(
  id_curriculum            INTEGER       NOT NULL,
  resumen_cv               VARCHAR(250) NOT NULL,
  experiencia_json         TEXT              NOT NULL,
  TRABAJADOR_id_trabajador INTEGER       NOT NULL,
  PERFIL_id_perfil         INTEGER       NOT NULL
);
-- CREACION INDICE UNICO EN CURRICULM
CREATE UNIQUE INDEX CURRICULUM__IDX ON CURRICULUM (PERFIL_id_perfil ASC);
-- PK DE CURRICULUM
ALTER TABLE CURRICULUM 
  ADD CONSTRAINT CURRICULUM_PK PRIMARY KEY (id_curriculum);

--=================================================================
-- CREACION TABLA PERFIL
--=================================================================
CREATE TABLE PERFIL 
(
  id_perfil                INTEGER      NOT NULL,
  descripcion              VARCHAR(250),
  username                 VARCHAR(25)     NOT NULL,
  CLIENTE_id_cliente       INTEGER           NOT NULL,
  TRABAJADOR_id_trabajador INTEGER      NOT NULL,
  id_categoria             INTEGER           NOT NULL,
  id_tipo_ofrecimiento     INTEGER           NOT NULL,
  id_categoria2            INTEGER      NOT NULL,
  id_tipo_ofrecimiento2    INTEGER      NOT NULL
);
-- PK DE PERFIL
ALTER TABLE PERFIL 
  ADD CONSTRAINT PERFIL_PK PRIMARY KEY (id_perfil);

--=================================================================
-- CREACION TABLA PUBLICACION
--=================================================================
CREATE TABLE PUBLICACION 
(
  id_publicacion      INTEGER    NOT NULL,
  tipo_publicacion    VARCHAR(50)   NOT NULL,
  creada_en           TIMESTAMP           NOT NULL,
  actualizada_en      TIMESTAMP           NOT NULL,
  PERFIL_id_perfil    INTEGER    NOT NULL,
  id_curriculum       INTEGER    NOT NULL,
  precio_min          DOUBLE PRECISION          NOT NULL,
  precio_max          DOUBLE PRECISION          NOT NULL,
  tipo_presio         DOUBLE PRECISION          NOT NULL,   
  moneda              VARCHAR(25) NOT NULL,
  duracion_estimada   VARCHAR(25) NOT NULL,
  id_oferta_servicio  INTEGER         NOT NULL,
  id_oferta_servicio1 INTEGER         NOT NULL,
  id_oferta_servicio2 INTEGER         NOT NULL
);
-- PK DE PUBLICACION
ALTER TABLE PUBLICACION 
  ADD CONSTRAINT PUBLICACION_PK PRIMARY KEY (id_publicacion);

-- FK CIUDAD_REGION
ALTER TABLE CIUDAD
  ADD CONSTRAINT CIUDAD_REGION_FK FOREIGN KEY (REGION_id_region)
  REFERENCES REGION (id_region);

-- FK CIUDAD_PAIS
ALTER TABLE CIUDAD
  ADD CONSTRAINT CIUDAD_PAIS_FK FOREIGN KEY (REGION_PAIS_id_pais)
  REFERENCES PAIS (id_pais);

-- FK CLIENTE_PERSONA
ALTER TABLE CLIENTE
  ADD CONSTRAINT CLIENTE_PERSONA_FK FOREIGN KEY (id_persona)
  REFERENCES PERSONA (id_persona);

-- FK CLIENTE_SERVICIO
-- NOTE: CLIENTE_SERVICIO table is not defined in the schema, causing errors. 
-- Commenting out to allow execution.
-- ALTER TABLE CLIENTE_SERVICIO
--   ADD CONSTRAINT CLS_CLIE_FK FOREIGN KEY (CLIENTE_id_persona, CLIENTE_id_membresia)
--   REFERENCES CLIENTE (id_persona, id_membresia);
-- ALTER TABLE CLIENTE_SERVICIO
--   ADD CONSTRAINT CLS_SERV_FK FOREIGN KEY (SERVICIO_id_servicio)
--   REFERENCES SERVICIO (id_servicio);

-- FK COMUNA_CIUDAD
ALTER TABLE COMUNA
  ADD CONSTRAINT COMUNA_CIUDAD_FK FOREIGN KEY (CIUDAD_id_ciudad)
  REFERENCES CIUDAD (id_ciudad);

-- FK COMUNA_CLIENTE
ALTER TABLE COMUNA_CLIENTE
  ADD CONSTRAINT CMC_CLIE_FK FOREIGN KEY (CLIENTE_id_persona, CLIENTE_id_membresia)
  REFERENCES CLIENTE (id_persona, id_membresia);
ALTER TABLE COMUNA_CLIENTE
  ADD CONSTRAINT CMC_COMU_FK FOREIGN KEY (COMUNA_id_comuna)
  REFERENCES COMUNA (id_comuna);

-- FK CURRICULUM_PERFIL
ALTER TABLE CURRICULUM
  ADD CONSTRAINT CURR_PERFIL_FK FOREIGN KEY (PERFIL_id_perfil)
  REFERENCES PERFIL (id_perfil);
ALTER TABLE CURRICULUM
  ADD CONSTRAINT CURR_TRAB_UK_FK FOREIGN KEY (TRABAJADOR_id_trabajador)
  REFERENCES TRABAJADOR (id_trabajador);

-- FK PERFIL_CLIENTE
ALTER TABLE PERFIL
  ADD CONSTRAINT PERFIL_CLIENTE_FK FOREIGN KEY (CLIENTE_id_cliente)
  REFERENCES CLIENTE (id_cliente);
-- FK PERFIL_TRABAJADOR
ALTER TABLE PERFIL
  ADD CONSTRAINT PERFIL_TRAB_UK_FK FOREIGN KEY (TRABAJADOR_id_trabajador)
  REFERENCES TRABAJADOR (id_trabajador);

-- FK PERSONA_MEMBRESIA
ALTER TABLE PERSONA
  ADD CONSTRAINT PERSONA_MEMBRESIA_FK FOREIGN KEY (MEMBRESIA_id_membresia)
  REFERENCES MEMBRESIA (id_membresia);

-- FK PUBLICACION_PERFIL
ALTER TABLE PUBLICACION
  ADD CONSTRAINT PUBLICACION_PERFIL_FK FOREIGN KEY (PERFIL_id_perfil)
  REFERENCES PERFIL (id_perfil);

-- FK REGION_PAIS
ALTER TABLE REGION
  ADD CONSTRAINT REGION_PAIS_FK FOREIGN KEY (PAIS_id_pais)
  REFERENCES PAIS (id_pais);

-- FK SERVICIO_CATEGORIA_SERVICIO
ALTER TABLE SERVICIO_CATEGORIA_SERVICIO
  ADD CONSTRAINT FK_SCS_CAT_SERV FOREIGN KEY (CATEG_SERV_ID)
  REFERENCES CATEGORIA_SERVICIO (id_categ_serv);
ALTER TABLE SERVICIO_CATEGORIA_SERVICIO
  ADD CONSTRAINT FK_SCS_SERV FOREIGN KEY (SERVICIO_id_servicio)
  REFERENCES SERVICIO (id_servicio);

-- FK TRABAJADOR_CERTIFICACION
ALTER TABLE TRABAJADOR_CERTIFICACION
  ADD CONSTRAINT FK_TRAB_CERT_CERT FOREIGN KEY (CERTIFICACION_id_certificacion)
  REFERENCES CERTIFICACION (id_certificacion);
ALTER TABLE TRABAJADOR_CERTIFICACION
  ADD CONSTRAINT FK_TRAB_CERT_TRAB FOREIGN KEY (TRABAJADOR_id_persona, TRABAJADOR_id_membresia)
  REFERENCES TRABAJADOR (id_persona, id_membresia);

-- FK TRABAJADOR_COMUNA
ALTER TABLE TRABAJADOR_COMUNA
  ADD CONSTRAINT FK_TRAB_COMU_COMU FOREIGN KEY (COMUNA_id_comuna)
  REFERENCES COMUNA (id_comuna);
ALTER TABLE TRABAJADOR_COMUNA
  ADD CONSTRAINT FK_TRAB_COMU_TRAB FOREIGN KEY (TRABAJADOR_id_persona, TRABAJADOR_id_membresia)
  REFERENCES TRABAJADOR (id_persona, id_membresia);

-- FK TRABAJADOR_SERVICIO
ALTER TABLE TRABAJADOR_SERVICIO
  ADD CONSTRAINT FK_TRAB_SERV_SERV FOREIGN KEY (SERVICIO_id_servicio)
  REFERENCES SERVICIO (id_servicio);
ALTER TABLE TRABAJADOR_SERVICIO
  ADD CONSTRAINT FK_TRAB_SERV_TRAB FOREIGN KEY (TRABAJADOR_id_persona, TRABAJADOR_id_membresia)
  REFERENCES TRABAJADOR (id_persona, id_membresia);

-- FK TRABAJADOR_PERSONA
ALTER TABLE TRABAJADOR
  ADD CONSTRAINT TRABAJADOR_PERSONA_FK FOREIGN KEY (id_persona)
  REFERENCES PERSONA (id_persona);
  
--tabla REPORTE_MEMBRESIA_TRABAJADOR para el bloque plsql

--=====================================================================
-- CREACION TABLA REPORTE_MEMBRESIA_TRABAJADOR PARA EJECUCION PL/SQL
--=====================================================================
CREATE TABLE REPORTE_MEMBRESIA_TRABAJADOR (
    id_trabajador           BIGINT NOT NULL,
    id_persona              BIGINT NOT NULL,
    nombre_completo         VARCHAR(100) NOT NULL,
    servicio                VARCHAR(50) NOT NULL,
    id_membresia            BIGINT NOT NULL,
    nombre_membresia        VARCHAR(25) NOT NULL,
    cuota_mensual           BIGINT NOT NULL,
    descuento_pct           BIGINT NOT NULL,
    ahorro_anual            BIGINT NOT NULL,
    prioridad               BIGINT NOT NULL,
    fecha_reporte           DATE       NOT NULL
);
