-- Migración: Agregar campos de información del cliente a la tabla Ticket
-- Fecha: 2025-08-05
-- Descripción: Agrega columnas customer_name y customer_email para guardar información del cliente en el checkout

USE [PointBrewDB]; -- Cambia por el nombre de tu base de datos

-- Agregar columnas para información del cliente
ALTER TABLE Ticket 
ADD customer_name NVARCHAR(255) NULL,
    customer_email NVARCHAR(255) NULL;

-- Opcional: Agregar índice para búsquedas por email del cliente
CREATE INDEX IX_Ticket_CustomerEmail ON Ticket(customer_email);

-- Verificar que las columnas se agregaron correctamente
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Ticket' 
ORDER BY ORDINAL_POSITION;
