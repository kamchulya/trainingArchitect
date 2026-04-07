# AI Architect Academy

Интерактивный тренажёр для обучения созданию WhatsApp-ботов.

## Стек

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **API**: Vercel Serverless Functions (папка `/api`)
- **База данных**: Supabase (токены доступа)
- **Хостинг**: Vercel

---

## Деплой на Vercel (5 минут)

### 1. Загрузи на GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/ТВО_ИМЯ/ai-architect-academy
git push -u origin main
```

### 2. Подключи к Vercel

1. Зайди на [vercel.com](https://vercel.com) → **Add New Project**
2. Выбери репозиторий `ai-architect-academy`
3. Framework Preset: **Vite**
4. Нажми **Deploy** (первый деплой без переменных, потом добавим)

### 3. Добавь переменные окружения

В Vercel → Settings → Environment Variables:

| Имя | Значение | Где взять |
|-----|----------|-----------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API → anon public |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | То же |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...` | Supabase → Settings → API → service_role |

После добавления переменных — нажми **Redeploy**.

### 4. Настрой Supabase

В Supabase → SQL Editor запусти файл `supabase_schema.sql`.

---

## Локальная разработка

```bash
npm install
npm install -g vercel      # один раз
vercel login               # один раз

cp .env.example .env.local
# заполни .env.local своими ключами

npm run dev                # запускает vercel dev (фронт + API вместе)
```

Открывай: `http://localhost:3000`

### Тестовые URL

```
http://localhost:3000?token=TEST-TOKEN-FREE       # урок 1 + пейволл
http://localhost:3000?token=TEST-TOKEN-SINGLE     # уроки 2-7, тариф "Один бот"
http://localhost:3000?token=TEST-TOKEN-UNLIMITED  # уроки 2-7, тариф "Безлимит"
```

---

## Структура проекта

```
├── src/
│   ├── App.tsx          # главный React компонент + весь UI
│   └── lessons.ts       # контент уроков (тексты, логика)
├── api/
│   ├── terminal.ts      # симулятор терминала (урок 5)
│   ├── check/
│   │   ├── openai.ts    # проверка формата OpenAI ключа
│   │   └── webhook.ts   # симуляция проверки webhook
│   └── logs/
│       ├── index.ts     # GET/DELETE логов
│       └── ingest.ts    # POST от WhatsApp бота
├── supabase_schema.sql  # схема БД
├── vercel.json          # конфиг Vercel
└── .env.example         # пример переменных окружения
```

---

## Переменная WHATSAPP_NUMBER

В файле `src/App.tsx`, строка 6:

```ts
const WHATSAPP_NUMBER = '77001234567'; // ← замени на свой номер
```
