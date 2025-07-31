-- Insert default roles
INSERT INTO Role (role_name) VALUES 
('admin'),
('customer'),
('employee');

-- Insert default payment methods
INSERT INTO PaymentMethod (method_name) VALUES 
('efectivo'),
('tarjeta'),
('transferencia');

-- Insert default payment statuses
INSERT INTO PaymentStatus (status_name) VALUES 
('pendiente'),
('completado'),
('cancelado');

-- Insert default turn statuses
INSERT INTO TurnStatus (status_name) VALUES 
('espera'),
('preparando'),
('listo'),
('entregado'),
('cancelado');
