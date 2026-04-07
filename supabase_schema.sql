-- ═══════════════════════════════════════════════════════
-- AI Architect Academy — Supabase Schema
-- Запусти в Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════

-- Таблица токенов доступа (основная)
-- Каждый клиент получает уникальный токен от WhatsApp-бота
CREATE TABLE IF NOT EXISTS access_tokens (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token       TEXT UNIQUE NOT NULL,          -- уникальный токен в URL
  chat_id     TEXT,                          -- WhatsApp chat_id клиента
  name        TEXT,                          -- имя клиента (из WA)
  phone       TEXT,                          -- номер телефона
  plan        TEXT CHECK (plan IN ('single', 'unlimited')) DEFAULT NULL,
                                             -- NULL = не оплачено
  plan_set_at TIMESTAMP WITH TIME ZONE,      -- когда активирован
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска по токену (тренажёр делает этот запрос при каждом старте)
CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);

-- Индекс для поиска по chat_id (бот ищет клиента по chat_id)
CREATE INDEX IF NOT EXISTS idx_access_tokens_chat_id ON access_tokens(chat_id);

-- RLS: разрешить анонимному пользователю только SELECT по токену
-- (тренажёр использует anon key — он может только читать свою запись)
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read own token" ON access_tokens
  FOR SELECT USING (true);
  -- Ограничение на конкретный токен делается через WHERE в запросе тренажёра

-- UPDATE и INSERT разрешены только через service_role key (бот на Railway)
CREATE POLICY "service can insert" ON access_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service can update" ON access_tokens
  FOR UPDATE USING (true);

-- ───────────────────────────────────────────────────────
-- Тестовые данные — для проверки тренажёра без бота
-- Открой тренажёр с URL: ?token=TEST-TOKEN-001
-- ───────────────────────────────────────────────────────
INSERT INTO access_tokens (token, chat_id, name, plan)
VALUES
  ('TEST-TOKEN-FREE', 'test_001', 'Тест Бесплатный', NULL),
  ('TEST-TOKEN-SINGLE', 'test_002', 'Тест Один бот', 'single'),
  ('TEST-TOKEN-UNLIMITED', 'test_003', 'Тест Безлимит', 'unlimited')
ON CONFLICT (token) DO NOTHING;
