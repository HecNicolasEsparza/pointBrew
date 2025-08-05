CREATE TABLE Role (
  role_id    INT            PRIMARY KEY IDENTITY,
  role_name  VARCHAR(50)    NOT NULL UNIQUE
);

CREATE TABLE PaymentMethod (
  method_id   INT           PRIMARY KEY IDENTITY,
  method_name VARCHAR(50)   NOT NULL UNIQUE
);

CREATE TABLE PaymentStatus (
  status_id    INT           PRIMARY KEY IDENTITY,
  status_name  VARCHAR(20)   NOT NULL UNIQUE
);

CREATE TABLE TurnStatus (
  status_id    INT           PRIMARY KEY IDENTITY,
  status_name  VARCHAR(20)   NOT NULL UNIQUE
);

-- 2. Entidades principales
CREATE TABLE [User] (
  user_id      INT           PRIMARY KEY IDENTITY,
  full_name    VARCHAR(100)  NOT NULL,
  email        VARCHAR(100)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  image_url    VARCHAR(500)  NULL,
  role_id      INT           NOT NULL
    REFERENCES Role(role_id),
  created_at   DATETIME      DEFAULT GETDATE(),
  updated_at   DATETIME      DEFAULT GETDATE()
);

CREATE TABLE Branch (
  branch_id    INT           PRIMARY KEY IDENTITY,
  name         VARCHAR(100)  NOT NULL,
  address      VARCHAR(150)  NOT NULL,
  created_at   DATETIME      DEFAULT GETDATE(),
  updated_at   DATETIME      DEFAULT GETDATE()
);

CREATE TABLE Store (
  store_id     INT           PRIMARY KEY IDENTITY,
  branch_id    INT           NOT NULL
    REFERENCES Branch(branch_id),
  name         VARCHAR(100)  NOT NULL,
  description  VARCHAR(500)  NULL,
  image_url    VARCHAR(500)  NULL,
  owner_id     INT           NULL
    REFERENCES [User](user_id),
  created_at   DATETIME      DEFAULT GETDATE(),
  updated_at   DATETIME      DEFAULT GETDATE()
);

CREATE TABLE Category (
  category_id  INT           PRIMARY KEY IDENTITY,
  name         VARCHAR(50)   NOT NULL UNIQUE
);

CREATE TABLE Product (
  product_id     INT          PRIMARY KEY IDENTITY,
  store_id       INT          NOT NULL
    REFERENCES Store(store_id),
  category_id    INT          NULL
    REFERENCES Category(category_id),
  name           VARCHAR(100) NOT NULL,
  price          DECIMAL(10,2)NOT NULL,
  image_url      VARCHAR(500) NULL,
  available      BIT          NOT NULL DEFAULT 1,
  created_at     DATETIME     DEFAULT GETDATE(),
  updated_at     DATETIME     DEFAULT GETDATE()
);

CREATE TABLE Ticket (
  ticket_id    INT            PRIMARY KEY IDENTITY,
  user_id      INT            NOT NULL
    REFERENCES [User](user_id),
  store_id     INT            NOT NULL
    REFERENCES Store(store_id),
  ticket_date  DATETIME       NOT NULL DEFAULT GETDATE(),
  total_amount DECIMAL(10,2)  NOT NULL,
  created_at   DATETIME       DEFAULT GETDATE(),
  updated_at   DATETIME       DEFAULT GETDATE()
);

CREATE TABLE TicketProduct (
  id            INT           PRIMARY KEY IDENTITY,
  ticket_id     INT           NOT NULL
    REFERENCES Ticket(ticket_id),
  product_id    INT           NOT NULL
    REFERENCES Product(product_id),
  quantity      INT           NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL
);

CREATE TABLE Payment (
  payment_id    INT           PRIMARY KEY IDENTITY,
  ticket_id     INT           NOT NULL
    REFERENCES Ticket(ticket_id),
  method_id     INT           NOT NULL
    REFERENCES PaymentMethod(method_id),
  status_id     INT           NOT NULL
    REFERENCES PaymentStatus(status_id),
  amount        DECIMAL(10,2) NOT NULL,
  paid_at       DATETIME      NULL,
  created_at    DATETIME      DEFAULT GETDATE()
);

CREATE TABLE Turn (
  turn_id       INT           PRIMARY KEY IDENTITY,
  ticket_id     INT           NOT NULL
    REFERENCES Ticket(ticket_id),
  branch_id     INT           NOT NULL
    REFERENCES Branch(branch_id),
  user_id       INT           NOT NULL
    REFERENCES [User](user_id),
  queue_number  INT           NOT NULL,
  status_id     INT           NOT NULL
    REFERENCES TurnStatus(status_id),
  requested_at  DATETIME      NOT NULL DEFAULT GETDATE(),
  desired_pickup DATETIME     NULL
);


CREATE TABLE Cart (
  cart_id       INT           PRIMARY KEY IDENTITY,
  user_id       INT           NOT NULL
    REFERENCES [User](user_id),
  product_id    INT           NOT NULL
    REFERENCES Product(product_id),
  quantity      INT           NOT NULL DEFAULT 1,
  added_at      DATETIME      DEFAULT GETDATE(),
  updated_at    DATETIME      DEFAULT GETDATE(),
  UNIQUE(user_id, product_id)  -- Un usuario no puede tener el mismo producto duplicado
);

-- Tabla para relacionar empleados con tiendas
CREATE TABLE StoreEmployee (
  id              INT           PRIMARY KEY IDENTITY,
  store_id        INT           NOT NULL
    REFERENCES Store(store_id),
  user_id         INT           NOT NULL
    REFERENCES [User](user_id),
  position        VARCHAR(50)   NULL,
  hire_date       DATE          NOT NULL DEFAULT GETDATE(),
  is_active       BIT           NOT NULL DEFAULT 1,
  is_manager      BIT           NOT NULL DEFAULT 0,
  created_at      DATETIME      DEFAULT GETDATE(),
  updated_at      DATETIME      DEFAULT GETDATE(),
  UNIQUE(store_id, user_id)  -- Un empleado no puede estar duplicado en la misma tienda

);

-- Insert initial data
INSERT INTO Role (role_name) VALUES ('Admin'), ('Customer'), ('Employee');
INSERT INTO PaymentMethod (method_name) VALUES ('Cash'), ('Credit Card'), ('Debit Card'), ('Mobile Payment');
INSERT INTO PaymentStatus (status_name) VALUES ('Pending'), ('Completed'), ('Failed'), ('Refunded');
INSERT INTO TurnStatus (status_name) VALUES ('Waiting'), ('In Progress'), ('Ready'), ('Completed'), ('Cancelled');

-- Tabla para almacenar métodos de pago de los usuarios
CREATE TABLE UserPaymentMethod (
  user_payment_id    INT           PRIMARY KEY IDENTITY,
  user_id            INT           NOT NULL
    REFERENCES [User](user_id),
  method_id          INT           NOT NULL
    REFERENCES PaymentMethod(method_id),
  card_holder_name   VARCHAR(100)  NULL,
  card_number_last4  VARCHAR(4)    NULL,  -- Solo los últimos 4 dígitos
  card_expiry        VARCHAR(7)    NULL,  -- MM/YYYY
  card_brand         VARCHAR(20)   NULL,  -- Visa, Mastercard, etc.
  is_default         BIT           NOT NULL DEFAULT 0,
  is_active          BIT           NOT NULL DEFAULT 1,
  created_at         DATETIME      DEFAULT GETDATE(),
  updated_at         DATETIME      DEFAULT GETDATE(),
  UNIQUE(user_id, card_number_last4, card_expiry) -- Evitar tarjetas duplicadas
);

-- Insert default categories
INSERT INTO Category (name) VALUES 
('Bebidas'),
('Comida'),
('Postres'),
('Aperitivos'),
('Otro');

-- Queries útiles para manejo de empleados

-- 1. Obtener todos los empleados de una tienda específica
-- SELECT u.user_id, u.full_name, u.email, se.position, se.hire_date, se.is_manager
-- FROM [User] u
-- INNER JOIN StoreEmployee se ON u.user_id = se.user_id
-- INNER JOIN Role r ON u.role_id = r.role_id
-- WHERE se.store_id = @store_id AND r.role_name = 'Employee' AND se.is_active = 1
-- ORDER BY se.is_manager DESC, u.full_name;

-- 2. Obtener todas las tiendas donde trabaja un empleado
-- SELECT s.store_id, s.name AS store_name, b.name AS branch_name, se.position, se.is_manager
-- FROM Store s
-- INNER JOIN StoreEmployee se ON s.store_id = se.store_id
-- INNER JOIN Branch b ON s.branch_id = b.branch_id
-- WHERE se.user_id = @user_id AND se.is_active = 1;

-- 3. Lista completa de empleados con sus tiendas
-- SELECT u.user_id, u.full_name, u.email, s.name AS store_name, 
--        b.name AS branch_name, se.position, se.is_manager, se.hire_date
-- FROM [User] u
-- INNER JOIN StoreEmployee se ON u.user_id = se.user_id
-- INNER JOIN Store s ON se.store_id = s.store_id
-- INNER JOIN Branch b ON s.branch_id = b.branch_id
-- INNER JOIN Role r ON u.role_id = r.role_id
-- WHERE r.role_name = 'Employee' AND se.is_active = 1
-- ORDER BY b.name, s.name, se.is_manager DESC, u.full_name;
