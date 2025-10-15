-- Migration: Ajustar tamanho do campo STATUS em protestos
-- Data: 2025-10-10
-- Objetivo: permitir armazenar exatamente o texto da planilha, sem truncar

ALTER TABLE `protestos`
  MODIFY `status` VARCHAR(255) NULL;
