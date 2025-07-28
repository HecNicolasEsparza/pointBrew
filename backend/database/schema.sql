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
  description  VARCHAR(50)   NULL,
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

-- Insert initial data
INSERT INTO Role (role_name) VALUES ('Admin'), ('Customer'), ('Employee');
INSERT INTO PaymentMethod (method_name) VALUES ('Cash'), ('Credit Card'), ('Debit Card'), ('Mobile Payment');
INSERT INTO PaymentStatus (status_name) VALUES ('Pending'), ('Completed'), ('Failed'), ('Refunded');
INSERT INTO TurnStatus (status_name) VALUES ('Waiting'), ('In Progress'), ('Ready'), ('Completed'), ('Cancelled');
