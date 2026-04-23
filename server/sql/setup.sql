-- ======================================================================================
-- DATABASE SCHEMA: autopecas_db
-- Target: Microsoft SQL Server (MSSQL)
-- Description: Distributed Auto Parts Management System
-- ======================================================================================

-- 1. Categories Table
CREATE TABLE categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    criado_em DATETIME DEFAULT GETDATE()
);

-- 2. Suppliers Table
CREATE TABLE fornecedores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    ativo BIT DEFAULT 1,
    criado_em DATETIME DEFAULT GETDATE()
);

-- 3. Parts Table
CREATE TABLE pecas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(500),
    preco_custo DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    estoque_atual INT DEFAULT 0,
    estoque_minimo INT DEFAULT 5,
    categoria_id INT FOREIGN KEY REFERENCES categorias(id),
    fornecedor_id INT FOREIGN KEY REFERENCES fornecedores(id),
    ativo BIT DEFAULT 1,
    criado_em DATETIME DEFAULT GETDATE(),
    atualizado_em DATETIME DEFAULT GETDATE()
);

-- 4. Users Table
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- Hash bcrypt
    perfil VARCHAR(20) CHECK (perfil IN ('admin', 'operador', 'consulta')),
    ativo BIT DEFAULT 1,
    criado_em DATETIME DEFAULT GETDATE()
);

-- 5. Stock Movements Table
CREATE TABLE movimentacoes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo VARCHAR(10) CHECK (tipo IN ('entrada', 'saida')),
    quantidade INT NOT NULL,
    motivo VARCHAR(255),
    peca_id INT FOREIGN KEY REFERENCES pecas(id),
    usuario_id INT FOREIGN KEY REFERENCES usuarios(id),
    criado_em DATETIME DEFAULT GETDATE()
);

-- ======================================================================================
-- ACID TRANSACTION EXAMPLE (Stored Procedure for Stock Movement)
-- This ensures that updating stock and logging movement is an atomic operation.
-- ======================================================================================

GO
CREATE PROCEDURE sp_RegisterStockMovement
    @peca_id INT,
    @usuario_id INT,
    @quantidade INT,
    @tipo VARCHAR(10),
    @motivo VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Update stock
        IF @tipo = 'saida'
        BEGIN
            -- Check if enough stock exists
            IF (SELECT estoque_atual FROM pecas WHERE id = @peca_id) < @quantidade
            BEGIN
                RAISERROR('Insufficient stock for this operation.', 16, 1);
            END
            UPDATE pecas SET estoque_atual = estoque_atual - @quantidade WHERE id = @peca_id;
        END
        ELSE IF @tipo = 'entrada'
        BEGIN
            UPDATE pecas SET estoque_atual = estoque_atual + @quantidade WHERE id = @peca_id;
        END

        -- 2. Log movement
        INSERT INTO movimentacoes (tipo, quantidade, motivo, peca_id, usuario_id, criado_em)
        VALUES (@tipo, @quantidade, @motivo, @peca_id, @usuario_id, GETDATE());

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
