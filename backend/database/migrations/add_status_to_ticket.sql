-- Migración: Agregar estado de pedido a la tabla Ticket
-- Fecha: 2025-08-05
-- Descripción: Agrega columna status para manejar el estado del pedido (pending, preparing, ready, completed, cancelled)

USE [PointBrewDB]; -- Cambia por el nombre de tu base de datos

-- Agregar columna de estado al ticket
ALTER TABLE Ticket 
ADD status NVARCHAR(50) NOT NULL DEFAULT 'pending';

-- Agregar índice para búsquedas por estado
CREATE INDEX IX_Ticket_Status ON Ticket(status);

-- Verificar que la columna se agregó correctamente
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Ticket' AND COLUMN_NAME = 'status';

-- Actualizar tickets existentes para que tengan estado 'pending'
UPDATE Ticket SET status = 'pending' WHERE status IS NULL;
