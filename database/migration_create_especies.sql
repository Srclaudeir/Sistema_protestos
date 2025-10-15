-- Migration: Create especies table
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

-- Add especie_id column to contratos table (optional - for future normalization)
-- ALTER TABLE `contratos` ADD COLUMN `especie_id` int NULL AFTER `especie`;
-- ALTER TABLE `contratos` ADD KEY `especie_id` (`especie_id`);
-- ALTER TABLE `contratos` ADD CONSTRAINT `contratos_ibfk_2` FOREIGN KEY (`especie_id`) REFERENCES `especies` (`id`) ON DELETE SET NULL;
