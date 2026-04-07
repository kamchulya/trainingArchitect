export interface LessonText {
  title: string;
  instructions: string;
  successCondition: string;
}

export interface Lesson {
  id: number;
  workspaceType: 'info' | 'form' | 'terminal' | 'code' | 'knowledge';
  successCheck: (state: any) => boolean;
  ru: LessonText;
  en: LessonText;
}

export const LESSONS: Lesson[] = [
  {
    id: 1,
    workspaceType: 'info',
    successCheck: (state) => state.readArchitecture,
    ru: {
      title: "Архитектура и Инструменты",
      successCondition: "Нажми 'Я готов начать'",
      instructions: `### Шаг 1: Как это работает?

Ты сейчас создашь **настоящего** WhatsApp-бота, который будет отвечать твоим клиентам вместо тебя — 24/7, без выходных.

Никакого программирования учить не нужно. Весь код за тебя напишет **AI Ментор** (чат внизу). Твоя задача — понять логику и следовать инструкциям.

---

#### Как это будет работать?

Клиент пишет тебе в WhatsApp → сообщение попадает на твой сервер → нейросеть читает твою базу знаний → отвечает клиенту автоматически.

Всё. Ты при этом можешь спать.

---

#### Из чего состоит бот?

**Meta / WhatsApp** — это дверь. Через неё приходят сообщения от клиентов.

**Railway** — это комната, где живёт твой бот. Сервер в интернете, который работает круглосуточно.

**OpenAI (GPT)** — это мозг. Он читает твою базу знаний и придумывает ответы.

**GitHub** — это шкаф с документами. Там хранится код бота, Railway берёт его оттуда.

---

#### Что ты сделаешь в этом курсе?

1. Создашь аккаунты на GitHub и Railway (бесплатно)
2. Напишешь боту "личность" и базу знаний о своём бизнесе
3. Попросишь ментора внизу написать код — скопируешь его
4. Подключишь WhatsApp через Meta
5. Запустишь бота

Кодить не нужно. Читать код не нужно. Просто следуй шагам.

---

Нажми кнопку ниже когда готов начать 👇`,
    },
    en: {
      title: "Architecture & Tools",
      successCondition: "Click 'I'm ready to start'",
      instructions: `### Step 1: How does this work?

You are about to build a **real** WhatsApp bot that will reply to your clients for you — 24/7, no days off.

No coding knowledge required. Your **AI Mentor** (chat below) will write all the code. Your only job is to understand the logic and follow the steps.

---

#### How will it work?

A client messages you on WhatsApp → the message reaches your server → the AI reads your knowledge base → it replies to the client automatically.

That's it. You can be asleep the whole time.

---

#### What is the bot made of?

**Meta / WhatsApp** — the door. This is where your clients' messages come in.

**Railway** — the room where your bot lives. A server on the internet that runs 24/7.

**OpenAI (GPT)** — the brain. It reads your knowledge base and crafts replies.

**GitHub** — the filing cabinet. Your bot's code is stored here; Railway pulls it from there.

---

#### What will you do in this course?

1. Create accounts on GitHub and Railway (both free)
2. Write your bot's "personality" and a knowledge base about your business
3. Ask the mentor below to write the code — you just copy and paste it
4. Connect WhatsApp through Meta
5. Launch the bot

No coding. No reading code. Just follow the steps.

---

Click the button below when you're ready to start 👇`,
    },
  },
  {
    id: 2,
    workspaceType: 'form',
    successCheck: (state) => !!state.githubRepo && !!state.vpsIp,
    ru: {
      title: "GitHub и Railway: регистрация",
      successCondition: "Заполни оба поля и нажми Verify",
      instructions: `### Шаг 2: Создаём два аккаунта — займёт 10 минут

Тебе нужны два сервиса. Оба бесплатны.

---

#### 1. GitHub — здесь будет храниться код бота

**Что делать:**
1. Перейди на [github.com](https://github.com) и зарегистрируйся
2. Нажми **"New"** (зелёная кнопка)
3. Название: **whatsapp-bot**, выбери **Private**
4. Поставь галочку **"Add a README file"** → **"Create repository"**
5. Скопируй адрес: \`https://github.com/твоё_имя/whatsapp-bot\`

Вставь адрес в поле справа 👉

---

#### 2. Railway — здесь будет жить бот

**Что делать:**
1. Перейди на [railway.app](https://railway.app)
2. **"Login"** → войди через GitHub
3. **"New Project"** → **"Deploy from GitHub repo"** → выбери **whatsapp-bot**
4. Скопируй адрес сервера: \`https://whatsapp-bot-xxxx.up.railway.app\`

Вставь в поле "VPS / Railway URL" справа 👉

---

Застрял? Напиши ментору: *"Помоги найти адрес Railway"*`,
    },
    en: {
      title: "GitHub & Railway: Sign Up",
      successCondition: "Fill in both fields and click Verify",
      instructions: `### Step 2: Create two accounts — takes about 10 minutes

You need two services. Both are free.

---

#### 1. GitHub — this is where your bot's code will be stored

**What to do:**
1. Go to [github.com](https://github.com) and sign up
2. Click the green **"New"** button
3. Name: **whatsapp-bot**, choose **Private**
4. Check **"Add a README file"** → **"Create repository"**
5. Copy the URL: \`https://github.com/your_name/whatsapp-bot\`

Paste that URL into the field on the right 👉

---

#### 2. Railway — this is where your bot will live

**What to do:**
1. Go to [railway.app](https://railway.app)
2. **"Login"** → sign in with GitHub
3. **"New Project"** → **"Deploy from GitHub repo"** → select **whatsapp-bot**
4. Copy the server address: \`https://whatsapp-bot-xxxx.up.railway.app\`

Paste it into the "VPS / Railway URL" field on the right 👉

---

Stuck? Ask the mentor: *"Help me find my Railway server address"*`,
    },
  },
  {
    id: 3,
    workspaceType: 'knowledge',
    successCheck: (state) => !!state.systemPrompt && !!state.knowledgeBase,
    ru: {
      title: "Личность и знания бота",
      successCondition: "Напиши промпт и базу знаний",
      instructions: `### Шаг 3: Объясняем боту кто он и что знает

---

#### Промпт — "должностная инструкция" для бота

*Ты — Айгерим, вежливый помощник студии маникюра "Лепесток". Отвечай коротко, на русском языке. Если клиент хочет записаться — уточни дату и время.*

Замени имя и название на свои.

---

#### База знаний — что бот будет рассказывать клиентам

\`\`\`
УСЛУГИ И ЦЕНЫ:
Маникюр классический — 4000 тг
Маникюр с покрытием — 6000 тг
Педикюр — 7000 тг

ВРЕМЯ РАБОТЫ:
Пн-Сб: 10:00 — 20:00, Вс: выходной

АДРЕС: г. Алматы, ул. Желтоксан 55, 3 этаж

КАК ЗАПИСАТЬСЯ: написать в WhatsApp
\`\`\`

Чем больше информации — тем умнее бот.

Заполни оба поля справа 👉`,
    },
    en: {
      title: "Bot Personality & Knowledge",
      successCondition: "Write a prompt and knowledge base",
      instructions: `### Step 3: Tell the bot who it is and what it knows

---

#### The Prompt — your bot's "job description"

*You are Emily, a friendly assistant for the nail studio "Blossom". Reply briefly, in English. If a client wants to book — ask for their preferred date and time.*

Replace the name and studio name with your own.

---

#### The Knowledge Base — what the bot will tell clients

\`\`\`
SERVICES & PRICES:
Classic manicure — $25
Gel manicure — $40
Pedicure — $45

WORKING HOURS:
Mon–Sat: 10 AM – 8 PM, Sunday: closed

ADDRESS: 123 Main Street, Suite 3, New York

HOW TO BOOK: message us on WhatsApp
\`\`\`

The more detail, the smarter the bot.

Fill in both fields on the right 👉`,
    },
  },
  {
    id: 4,
    workspaceType: 'code',
    successCheck: (state) => state.files?.includes('main.py'),
    ru: {
      title: "Получаем код у ментора",
      successCondition: "Сохрани файл main.py",
      instructions: `### Шаг 4: Получаем ключ OpenAI и код бота

---

#### 🔑 Сначала получи ключ OpenAI

Бот использует GPT для ответов клиентам — для этого нужен API ключ.

**1.** Зайди на [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**2.** Нажми **"Create new secret key"** → дай имя → скопируй ключ (он начинается с \`sk-...\`)

⚠️ Ключ показывается **только один раз** — сразу сохрани его в надёжное место!

---

#### 🛡️ Техника безопасности

- **Никому не отправляй ключ** — ни в чат, ни в GitHub, ни в код напрямую
- Храни только в **переменных окружения** (Railway → Variables) — именно так мы и сделаем на шаге 5
- Если ключ утёк — немедленно удали его и создай новый

---

#### 💻 Теперь получи код у ментора

**1. Напиши ментору:**

> *Сгенерируй полный файл main.py для WhatsApp бота. Используй мой промпт и базу знаний из урока 3. Добавь функцию отправки логов. Код должен быть полным.*

**2. Скопируй весь код** который пришлёт ментор.

**3. Вставь в поле справа** (там написано "Файл пуст")

**4. Нажми "Save File"** ✅

---

💡 Ключ OpenAI мы добавим в Railway на следующем шаге — в код его вставлять не нужно.

Что-то не так? Напиши ментору: *"Код не работает, вот ошибка: [текст ошибки]"*`,
    },
    en: {
      title: "Get the Code from the Mentor",
      successCondition: "Save the main.py file",
      instructions: `### Step 4: Get your OpenAI key and the bot code

---

#### 🔑 First, get your OpenAI API key

The bot uses GPT to reply to clients — you need an API key for that.

**1.** Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**2.** Click **"Create new secret key"** → give it a name → copy the key (it starts with \`sk-...\`)

⚠️ The key is shown **only once** — save it somewhere safe immediately!

---

#### 🛡️ Security rules

- **Never share your key** — not in chat, not in GitHub, not directly in code
- Store it only in **environment variables** (Railway → Variables) — that's exactly what we'll do in step 5
- If your key leaks — delete it immediately and create a new one

---

#### 💻 Now get the code from the mentor

**1. Send the mentor this:**

> *Generate a complete main.py file for a WhatsApp bot. Use my prompt and knowledge base from lesson 3. Add a log-sending function. The code must be complete.*

**2. Copy all the code** the mentor sends you.

**3. Paste it into the field on the right** (where it says "File is empty")

**4. Click "Save File"** ✅

---

💡 We'll add the OpenAI key to Railway in the next step — no need to put it in the code.

Something wrong? Tell the mentor: *"The code isn't working, here's the error: [error text]"*`,
    },
  },
  {
    id: 5,
    workspaceType: 'terminal',
    successCheck: (state) => state.gitPushed,
    ru: {
      title: "Загружаем бота на сервер",
      successCondition: "Выполни git push",
      instructions: `### Шаг 5: Отправляем код на Railway

**1. Установи Git**
- Windows: [git-scm.com](https://git-scm.com/download/win)
- Mac: открой Terminal → \`git --version\`

**2. Создай папку на Рабочем столе**

- Правой кнопкой мыши на Рабочем столе → **"Создать папку"**
- Назови её: \`whatsapp-bot\`
- Положи внутрь файл \`main.py\` (из прошлого шага)

---

**3. Получи остальные файлы у ментора**

Напиши ментору внизу:
> *"Напиши мне готовые файлы requirements.txt и Procfile для WhatsApp бота на FastAPI"*

Скопируй содержимое каждого файла и создай их в папке \`whatsapp-bot\`.

Папка должна выглядеть так:
\`\`\`
whatsapp-bot/
  main.py
  requirements.txt
  Procfile
\`\`\`

---

**4. Открой терминал прямо из папки**

- Зайди в папку \`whatsapp-bot\` на Рабочем столе
- Нажми **правой кнопкой мыши** на пустом месте внутри папки
- Выбери **"Git Bash Here"** (или "Открыть в терминале")

⚠️ Важно: терминал должен открыться **внутри папки whatsapp-bot**, а не где-то ещё! Проверь — в строке терминала должно быть написано \`whatsapp-bot\`.

---

**5. Выполни команды одну за другой:**

\`\`\`
git init
git add .
git commit -m "my bot"
git remote add origin ВСТАВЬ_ССЫЛКУ_НА_GITHUB
git push -u origin main
\`\`\`

💡 Жди знака \`$\` после каждой команды — это значит команда выполнена и можно вводить следующую.

Railway запустит бота автоматически через 1-2 минуты.`,
    },
    en: {
      title: "Deploy the Bot to the Server",
      successCondition: "Run git push",
      instructions: `### Step 5: Upload the code to Railway

**1. Install Git**
- Windows: [git-scm.com](https://git-scm.com/download/win)
- Mac: open Terminal → \`git --version\`

**2. Create a folder on your Desktop**

- Right-click on the Desktop → **"New Folder"**
- Name it: \`whatsapp-bot\`
- Put your \`main.py\` file inside (from the previous step)

---

**3. Get the remaining files from the mentor**

Type this to the mentor below:
> *"Write me the ready-to-use contents of requirements.txt and Procfile for a WhatsApp bot on FastAPI"*

Copy each file's content and create them inside the \`whatsapp-bot\` folder.

The folder should look like:
\`\`\`
whatsapp-bot/
  main.py
  requirements.txt
  Procfile
\`\`\`

---

**4. Open the terminal directly from the folder**

- Open the \`whatsapp-bot\` folder on your Desktop
- Right-click on an **empty area** inside the folder
- Choose **"Git Bash Here"** (or "Open in Terminal")

⚠️ Important: the terminal must open **inside the whatsapp-bot folder**, not somewhere else! Check — the terminal line should show \`whatsapp-bot\`.

---

**5. Run these commands one by one:**

\`\`\`
git init
git add .
git commit -m "my bot"
git remote add origin PASTE_YOUR_GITHUB_LINK_HERE
git push -u origin main
\`\`\`

💡 Wait for the \`$\` sign after each command — it means the command finished and you can type the next one.

Railway will launch the bot automatically in 1–2 minutes.`,
    },
  },
  {
    id: 6,
    workspaceType: 'info',
    successCheck: (state) => state.webhookVerified,
    ru: {
      title: "Подключаем WhatsApp (Meta)",
      successCondition: "Нажми Verify Webhook после настройки",
      instructions: `### Шаг 6: Подключаем WhatsApp

**1. Создай приложение**
- [developers.facebook.com](https://developers.facebook.com) → **"Create App"** → **"Business"**

**2. Добавь WhatsApp**
- **"Add Products"** → WhatsApp → **"Set Up"** → **Configuration**

**3. Настрой Webhook**
- Callback URL: адрес Railway + \`/webhook\`
- Verify Token: придумай слово → добавь в Railway: \`VERIFY_TOKEN = слово\`
- Нажми **"Verify and Save"**

**4. Подпишись:** Webhook fields → \`messages\` → **"Subscribe"**

**5. Скопируй токен:** WhatsApp → API Setup → добавь в Railway: \`WHATSAPP_TOKEN = токен\`

---

Нажми **"Verify Webhook"** справа внизу ↘`,
    },
    en: {
      title: "Connect WhatsApp (Meta)",
      successCondition: "Click Verify Webhook after setup",
      instructions: `### Step 6: Connect WhatsApp

**1. Create an app**
- [developers.facebook.com](https://developers.facebook.com) → **"Create App"** → **"Business"**

**2. Add WhatsApp**
- **"Add Products"** → WhatsApp → **"Set Up"** → **Configuration**

**3. Set up Webhook**
- Callback URL: your Railway address + \`/webhook\`
- Verify Token: make up a word → add to Railway: \`VERIFY_TOKEN = word\`
- Click **"Verify and Save"**

**4. Subscribe:** Webhook fields → \`messages\` → **"Subscribe"**

**5. Copy token:** WhatsApp → API Setup → add to Railway: \`WHATSAPP_TOKEN = token\`

---

Click **"Verify Webhook"** at the bottom right ↘`,
    },
  },
  {
    id: 7,
    workspaceType: 'info',
    successCheck: (state) => state.permanentTokenCreated,
    ru: {
      title: "Вечный токен — бот работает навсегда",
      successCondition: "Подтверди создание вечного токена",
      instructions: `### Шаг 7: Делаем бота постоянным

Временный токен истекает через 24 часа. Сейчас это исправим.

**1.** Перейди на [business.facebook.com](https://business.facebook.com)

**2. Создай системного пользователя:**
Настройки → Пользователи → Системные пользователи → **"Добавить"**
Имя: \`bot-user\`, роль: **Администратор**

**3. Дай доступ:** нажми на пользователя → **"Добавить ресурсы"** → Приложения → твоё приложение → **Полный доступ**

**4. Сгенерируй токен:**
**"Создать токен"** → выбери приложение → отметь \`whatsapp_business_messaging\` и \`whatsapp_business_management\` → **Сразу скопируй!**

**5. Замени в Railway:** Variables → \`WHATSAPP_TOKEN\` → вставь новый токен

---

### 🎉 Готово! Твой бот работает 24/7!

Нажми кнопку ниже 👇`,
    },
    en: {
      title: "Permanent Token — Bot Runs Forever",
      successCondition: "Confirm permanent token creation",
      instructions: `### Step 7: Make the bot permanent

The temporary token expires in 24 hours. Let's fix that now.

**1.** Go to [business.facebook.com](https://business.facebook.com)

**2. Create a system user:**
Settings → Users → System Users → **"Add"**
Name: \`bot-user\`, role: **Admin**

**3. Grant access:** click the user → **"Add Assets"** → Apps → your app → **Full Control**

**4. Generate a token:**
**"Generate New Token"** → select your app → check \`whatsapp_business_messaging\` and \`whatsapp_business_management\` → **Copy immediately!**

**5. Replace in Railway:** Variables → \`WHATSAPP_TOKEN\` → paste the new token

---

### 🎉 You're done! Your bot runs 24/7!

Click the button below 👇`,
    },
  },
];
