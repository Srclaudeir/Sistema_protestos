-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS protestos_db;
USE protestos_db;

-- Table structure for table `usuarios`
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `role` enum('admin', 'operador', 'supervisor') DEFAULT 'operador',
  `ativo` BOOLEAN DEFAULT TRUE,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `clientes`
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf_cnpj` varchar(18) UNIQUE,
  `tipo_conta` enum('PF','PJ') NOT NULL,
  `cidade` varchar(100),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `contratos`
CREATE TABLE IF NOT EXISTS `contratos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_contrato_sisbr` varchar(50),
  `numero_contrato_legado` varchar(50),
  `especie` varchar(50),
  `ponto_atendimento` varchar(100),
  `cidade` varchar(100),
  `cliente_id` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `contratos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `protestos`
CREATE TABLE IF NOT EXISTS `protestos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `valor_protestado` decimal(15,2) NOT NULL,
  `numero_parcela` varchar(50),
  `data_registro` date,
  `protocolo` varchar(50),
  `status` varchar(255) DEFAULT NULL,
  `situacao` text,
  `data_baixa_cartorio` varchar(255) NULL,
  `contrato_id` int,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `contrato_id` (`contrato_id`),
  CONSTRAINT `protestos_ibfk_1` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `avalistas`
CREATE TABLE IF NOT EXISTS `avalistas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255),
  `cpf_cnpj` varchar(18),
  `protesto_id` int,
  PRIMARY KEY (`id`),
  KEY `protesto_id` (`protesto_id`),
  CONSTRAINT `avalistas_ibfk_1` FOREIGN KEY (`protesto_id`) REFERENCES `protestos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
-- Password is 'admin123' hashed with bcrypt
INSERT INTO `usuarios` (`username`, `email`, `password`, `nome`, `role`, `ativo`) VALUES
('admin', 'admin@protestos.com', '$2a$12$w8NR4S.k3dC2.jZQ.3hB.eKckq1VMF3tqoZQ2f5w8oL60N9Kq3y3W', 'Administrador do Sistema', 'admin', 1);

INSERT INTO `clientes` (`nome`, `cpf_cnpj`, `tipo_conta`, `cidade`) VALUES
('João Silva', '123.456.789-00', 'PF', 'Dourados'),
('Maria Santos', '987.654.321-00', 'PF', 'Nova Andradina'),
('Empresa XYZ Ltda', '12.345.678/0001-99', 'PJ', 'Ivinhema');

INSERT INTO `contratos` (`numero_contrato_sisbr`, `numero_contrato_legado`, `especie`, `ponto_atendimento`, `cliente_id`) VALUES
('CT123456', 'LEG001', 'CARTÃO', 'Agência Central', 1),
('CT789012', 'LEG002', 'VEICULO', 'Agência Norte', 2);

INSERT INTO `protestos` (`valor_protestado`, `numero_parcela`, `data_registro`, `protocolo`, `status`, `contrato_id`) VALUES
(1500.00, '1/12', '2024-01-15', 'PROT001', 'PROTESTADO', 1),
(8500.00, '3/24', '2024-02-20', 'PROT002', 'PROTESTADO', 2);

INSERT INTO `avalistas` (`nome`, `cpf_cnpj`, `protesto_id`) VALUES
('Carlos Oliveira', '111.222.333-44', 1);

