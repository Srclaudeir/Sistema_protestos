-- Execute this script directly in MySQL to create the especies table
-- Run: mysql -u root -p protestos_db < run_migration_especies.sql

USE protestos_db;

-- Create especies table
CREATE TABLE IF NOT EXISTS `especies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL UNIQUE,
  `descricao` text,
  `ativo` boolean DEFAULT TRUE,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default especies
INSERT INTO `especies` (`nome`, `descricao`, `ativo`) VALUES
('CARTAO', 'Cartão de crédito', TRUE),
('VEICULO', 'Financiamento de veículo', TRUE),
('PRONAMPE', 'Programa Nacional de Apoio ao Microempreendedor', TRUE),
('BNDES', 'Financiamento BNDES', TRUE),
('CAPITAL DE GIRO', 'Capital de giro empresarial', TRUE),
('CHEQUE ESPECIAL', 'Cheque especial', TRUE),
('ANTECIPACAO', 'Antecipação de recebíveis', TRUE),
('FINANCIAMENTO', 'Financiamento geral', TRUE),
('PRONAMP', 'Programa Nacional de Apoio ao Médio Produtor Rural', TRUE);

-- Show the created table
SELECT * FROM especies;
