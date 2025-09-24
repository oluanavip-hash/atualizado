/*
          # [Structural] Atualiza o esquema de perfis para o novo modelo de assinatura
          Este script adapta a tabela `profiles` para o novo modelo de negócio "Free vs. Pro".

          ## Query Description: 
          - Adiciona a coluna `subscription_tier` para rastrear se um usuário é 'free' ou 'pro'.
          - **Atenção:** Remove as colunas `subscription_status` e `trial_expires_at` que não são mais necessárias. Esta ação é destrutiva e removerá os dados dessas colunas permanentemente. Recomenda-se backup se esses dados forem importantes.

          ## Metadata:
          - Schema-Category: "Dangerous"
          - Impact-Level: "Medium"
          - Requires-Backup: true
          - Reversible: false (os dados das colunas removidas não podem ser recuperados)

          ## Structure Details:
          - Tabela afetada: `profiles`
          - Coluna adicionada: `subscription_tier` (TEXT, NOT NULL, DEFAULT 'free')
          - Colunas removidas: `subscription_status`, `trial_expires_at`

          ## Security Implications:
          - RLS Status: Sem alterações.
          - Policy Changes: Não.
          - Auth Requirements: N/A.

          ## Performance Impact:
          - Indexes: Sem alterações.
          - Triggers: Sem alterações.
          - Estimated Impact: Baixo. A operação é rápida em tabelas de tamanho moderado.
*/

-- Adiciona a nova coluna se ela não existir
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free';

-- Remove as colunas antigas se elas existirem
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS trial_expires_at;
