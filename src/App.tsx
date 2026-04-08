import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { LESSONS, Lesson } from './lessons';

// ---------- Config — замени на свои значения ----------
const WHATSAPP_NUMBER = '77773971282'; // ← твой номер (без +)
const SUPABASE_URL  = (import.meta as any).env?.VITE_SUPABASE_URL    ?? '';
const SUPABASE_ANON = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? '';

// ---------- Supabase helper ----------
async function fetchTokenPlan(token: string): Promise<'single' | 'unlimited' | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/access_tokens?token=eq.${encodeURIComponent(token)}&select=plan`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    );
    const rows = await res.json();
    return (rows?.[0]?.plan as 'single' | 'unlimited') ?? null;
  } catch { return null; }
}

// ---------- Types ----------
type Lang = 'ru' | 'en';
type LessonState = Record<string, any>;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Log {
  timestamp: string;
  level: string;
  message: string;
}

// ---------- Helpers ----------
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// ---------- Mobile block screen ----------
function MobileBlock() {
  return (
    <div className="fixed inset-0 bg-luxury-graphite flex flex-col items-center justify-center p-8 text-center z-50">
      <div className="text-6xl mb-6">💻</div>
      <div className="text-luxury-gold font-bold text-xl mb-3">
        AI Architect Academy
      </div>
      <div className="text-white font-semibold text-lg mb-4">
        Тренажёр работает только на компьютере или ноутбуке
      </div>
      <div className="text-luxury-silver/60 text-sm leading-relaxed max-w-xs mb-8">
        Открой эту ссылку на ПК или ноутбуке — и начнём. Мобильная версия не поддерживается, потому что здесь нужен полноценный рабочий экран.
      </div>
      <div className="bg-black/30 border border-white/10 rounded-2xl p-5 w-full max-w-xs">
        <div className="text-luxury-silver/50 text-xs mb-3 uppercase tracking-wider">Скопируй ссылку и открой на ПК</div>
        <div className="bg-black/40 border border-luxury-gold/20 rounded-lg px-3 py-2 text-luxury-gold text-xs font-mono break-all select-all">
          {window.location.href}
        </div>
      </div>
    </div>
  );
}

// ---------- Markdown renderer ----------
function MD({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h3: ({ children }) => <h3 className="text-lg font-bold text-luxury-gold mb-3 mt-4 first:mt-0">{children}</h3>,
        h4: ({ children }) => <h4 className="text-base font-semibold text-luxury-silver mb-2 mt-3">{children}</h4>,
        p: ({ children }) => <p className="text-luxury-silver/90 leading-relaxed mb-3">{children}</p>,
        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
        em: ({ children }) => <em className="text-luxury-silver/80 italic">{children}</em>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-luxury-gold underline hover:text-luxury-gold/80 transition-colors">
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          return isBlock ? (
            <pre className="bg-black/40 border border-white/10 rounded-lg p-3 my-3 overflow-x-auto">
              <code className="text-green-400 text-sm font-mono">{children}</code>
            </pre>
          ) : (
            <code className="bg-black/40 text-green-400 text-sm font-mono px-1.5 py-0.5 rounded">{children}</code>
          );
        },
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 ml-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">{children}</ol>,
        li: ({ children }) => <li className="text-luxury-silver/90">{children}</li>,
        hr: () => <hr className="border-white/10 my-4" />,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-luxury-gold pl-4 my-3 italic text-luxury-silver/70">
            {children}
          </blockquote>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

// ---------- Sidebar ----------
function Sidebar({
  lessons,
  currentId,
  completedIds,
  lang,
  onSelect,
}: {
  lessons: Lesson[];
  currentId: number;
  completedIds: number[];
  lang: Lang;
  onSelect: (id: number) => void;
}) {
  return (
    <aside className="w-64 bg-black/30 border-r border-white/10 flex flex-col shrink-0">
      <div className="p-4 border-b border-white/10">
        <div className="text-luxury-gold font-bold text-lg">AI Architect</div>
        <div className="text-luxury-silver/50 text-xs mt-0.5">WhatsApp Bot Academy</div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {lessons.map((lesson) => {
          const done = completedIds.includes(lesson.id);
          const active = lesson.id === currentId;
          const accessible = lesson.id <= currentId;
          return (
            <button
              key={lesson.id}
              onClick={() => accessible && onSelect(lesson.id)}
              disabled={!accessible}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 flex items-start gap-2.5',
                active && 'bg-luxury-gold/20 border border-luxury-gold/40',
                !active && accessible && 'hover:bg-white/5',
                !accessible && 'opacity-30 cursor-not-allowed',
              )}
            >
              <span className={cn(
                'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border',
                done ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                  active ? 'bg-luxury-gold/20 border-luxury-gold/50 text-luxury-gold' :
                    'border-white/20 text-white/30',
              )}>
                {done ? '✓' : lesson.id}
              </span>
              <span className={cn(
                'text-sm leading-tight',
                active ? 'text-luxury-gold' : done ? 'text-white/70' : 'text-luxury-silver/60',
              )}>
                {lesson[lang].title}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10 text-center">
        <div className="text-luxury-silver/30 text-xs">
          {completedIds.length}/{lessons.length} {lang === 'ru' ? 'завершено' : 'completed'}
        </div>
        <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-luxury-gold/60 rounded-full transition-all duration-500"
            style={{ width: `${(completedIds.length / lessons.length) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

// ---------- Workspace: Info ----------
function InfoWorkspace({
  lesson,
  lang,
  state,
  onStateChange,
}: {
  lesson: Lesson;
  lang: Lang;
  state: LessonState;
  onStateChange: (updates: Partial<LessonState>) => void;
}) {
  const txt = lesson[lang];
  const successKey =
    lesson.id === 1 ? 'readArchitecture' :
      lesson.id === 6 ? 'webhookVerified' :
        'permanentTokenCreated';
  const done = state[successKey];

  const buttonLabel = lang === 'ru'
    ? (lesson.id === 1 ? 'Я готов начать →' : lesson.id === 6 ? 'Verify Webhook ✓' : 'Готово! ✓')
    : (lesson.id === 1 ? "I'm ready to start →" : lesson.id === 6 ? 'Verify Webhook ✓' : 'Done! ✓');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <MD>{txt.instructions}</MD>
      </div>
      <div className="p-4 border-t border-white/10 flex justify-end">
        {done ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <span>✓</span>
            <span>{lang === 'ru' ? 'Выполнено' : 'Completed'}</span>
          </div>
        ) : (
          <button
            onClick={() => onStateChange({ [successKey]: true })}
            className="px-5 py-2.5 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-luxury-gold/80 transition-colors text-sm"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Workspace: Form ----------
function FormWorkspace({
  lesson,
  lang,
  state,
  onStateChange,
}: {
  lesson: Lesson;
  lang: Lang;
  state: LessonState;
  onStateChange: (updates: Partial<LessonState>) => void;
}) {
  const txt = lesson[lang];
  const [github, setGithub] = useState(state.githubRepo || '');
  const [vps, setVps] = useState(state.vpsIp || '');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(!!(state.githubRepo && state.vpsIp));

  function handleVerify() {
    if (!github.trim()) {
      setError(lang === 'ru' ? 'Введи ссылку на GitHub репозиторий' : 'Enter your GitHub repository URL');
      return;
    }
    if (!vps.trim()) {
      setError(lang === 'ru' ? 'Введи адрес Railway сервера' : 'Enter your Railway server URL');
      return;
    }
    setError('');
    setVerified(true);
    onStateChange({ githubRepo: github.trim(), vpsIp: vps.trim() });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <MD>{txt.instructions}</MD>
      </div>
      <div className="p-4 border-t border-white/10 space-y-3">
        <div>
          <label className="text-xs text-luxury-silver/60 mb-1.5 block">
            {lang === 'ru' ? 'GitHub репозиторий' : 'GitHub Repository URL'}
          </label>
          <input
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-luxury-gold/50 transition-colors"
            placeholder="https://github.com/your-name/whatsapp-bot"
            value={github}
            onChange={e => setGithub(e.target.value)}
            disabled={verified}
          />
        </div>
        <div>
          <label className="text-xs text-luxury-silver/60 mb-1.5 block">
            {lang === 'ru' ? 'VPS / Railway URL' : 'VPS / Railway URL'}
          </label>
          <input
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-luxury-gold/50 transition-colors"
            placeholder="https://whatsapp-bot-xxxx.up.railway.app"
            value={vps}
            onChange={e => setVps(e.target.value)}
            disabled={verified}
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {verified ? (
          <div className="text-green-400 text-sm font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{lang === 'ru' ? 'Данные сохранены!' : 'Data saved!'}</span>
          </div>
        ) : (
          <button
            onClick={handleVerify}
            className="w-full py-2.5 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-luxury-gold/80 transition-colors text-sm"
          >
            {lang === 'ru' ? 'Проверить и сохранить →' : 'Verify & Save →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Workspace: Knowledge ----------
function KnowledgeWorkspace({
  lesson,
  lang,
  state,
  onStateChange,
}: {
  lesson: Lesson;
  lang: Lang;
  state: LessonState;
  onStateChange: (updates: Partial<LessonState>) => void;
}) {
  const txt = lesson[lang];
  const [prompt, setPrompt] = useState(state.systemPrompt || '');
  const [kb, setKb] = useState(state.knowledgeBase || '');
  const saved = !!(state.systemPrompt && state.knowledgeBase);

  function handleSave() {
    if (!prompt.trim() || !kb.trim()) return;
    onStateChange({ systemPrompt: prompt.trim(), knowledgeBase: kb.trim() });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <MD>{txt.instructions}</MD>
        <div>
          <label className="text-xs font-semibold text-luxury-gold mb-1.5 block uppercase tracking-wider">
            {lang === 'ru' ? 'Промпт (личность бота)' : 'System Prompt (bot personality)'}
          </label>
          <textarea
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-luxury-gold/50 transition-colors resize-none"
            placeholder={lang === 'ru' ? 'Ты — Айгерим, вежливый помощник...' : 'You are Emily, a friendly assistant...'}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-luxury-gold mb-1.5 block uppercase tracking-wider">
            {lang === 'ru' ? 'База знаний' : 'Knowledge Base'}
          </label>
          <textarea
            rows={8}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-luxury-gold/50 transition-colors resize-none font-mono"
            placeholder={lang === 'ru' ? 'УСЛУГИ И ЦЕНЫ:\nМаникюр — 4000 тг\n...' : 'SERVICES & PRICES:\nManicure — $25\n...'}
            value={kb}
            onChange={e => setKb(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 border-t border-white/10 flex justify-end">
        {saved ? (
          <div className="text-green-400 text-sm font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{lang === 'ru' ? 'Сохранено' : 'Saved'}</span>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={!prompt.trim() || !kb.trim()}
            className="px-5 py-2.5 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-luxury-gold/80 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {lang === 'ru' ? 'Сохранить →' : 'Save →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Workspace: Code (Lesson 4) ----------
function CodeWorkspace({
  lesson,
  lang,
  state,
  onStateChange,
}: {
  lesson: Lesson;
  lang: Lang;
  state: LessonState;
  onStateChange: (updates: Partial<LessonState>) => void;
}) {
  const [code, setCode] = useState('');
  const [openaiKey, setOpenaiKey] = useState(state.openaiKey || '');
  const [keyChecked, setKeyChecked] = useState(!!state.openaiKey);
  const [keyError, setKeyError] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const saved = state.files?.includes('main.py');

  async function checkKey() {
    const key = openaiKey.trim();
    if (!key) return;
    if (!key.startsWith('sk-')) {
      setKeyError(lang === 'ru' ? 'Ключ должен начинаться с sk-...' : 'Key must start with sk-...');
      return;
    }
    setKeyLoading(true);
    setKeyError('');
    try {
      const res = await fetch('/api/check/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (data.valid) {
        setKeyChecked(true);
        onStateChange({ openaiKey: key });
      } else {
        setKeyError(data.error || (lang === 'ru' ? 'Неверный ключ' : 'Invalid key'));
      }
    } catch {
      setKeyError(lang === 'ru' ? 'Ошибка проверки. Попробуй ещё раз.' : 'Check failed. Try again.');
    } finally {
      setKeyLoading(false);
    }
  }

  function handleSave() {
    if (!code.trim()) return;
    onStateChange({ files: ['main.py'], savedCode: code });
  }

  const railwaySteps = lang === 'ru'
    ? [
        'Зайди в свой проект на railway.app',
        'Нажми на сервис → вкладка **Variables**',
        'Нажми **+ New Variable**',
        'Name: `OPENAI_API_KEY` — Value: вставь ключ',
        'Railway автоматически перезапустит бота ✅',
      ]
    : [
        'Open your project on railway.app',
        'Click your service → **Variables** tab',
        'Click **+ New Variable**',
        'Name: `OPENAI_API_KEY` — Value: paste your key',
        'Railway will restart the bot automatically ✅',
      ];

  return (
    <div className="flex flex-col h-full overflow-y-auto divide-y divide-white/10">

      {/* ── Step 1: Get OpenAI key ── */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0',
            keyChecked
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-luxury-gold/20 border-luxury-gold/50 text-luxury-gold',
          )}>
            {keyChecked ? '✓' : '1'}
          </span>
          <span className="text-white font-semibold text-sm">
            {lang === 'ru' ? '🔑 Получи ключ OpenAI' : '🔑 Get your OpenAI API key'}
          </span>
        </div>

        <div className="pl-8 space-y-3 text-xs text-luxury-silver/80 leading-relaxed">
          <p>
            {lang === 'ru' ? 'Перейди по ссылке:' : 'Go to:'}
            {' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-luxury-gold underline hover:text-luxury-gold/80"
            >
              platform.openai.com/api-keys
            </a>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>{lang === 'ru' ? 'Нажми «Create new secret key» → дай любое имя' : 'Click "Create new secret key" → give it a name'}</li>
            <li>{lang === 'ru' ? <>Скопируй ключ — он начинается с <code className="bg-black/40 px-1 rounded font-mono text-green-400">sk-</code></> : <>Copy the key — it starts with <code className="bg-black/40 px-1 rounded font-mono text-green-400">sk-</code></>}</li>
            <li className="text-yellow-400/80">{lang === 'ru' ? '⚠️ Ключ показывается только один раз — сразу сохрани!' : '⚠️ Key shown only once — save it immediately!'}</li>
          </ol>

          {!keyChecked ? (
            <div className="space-y-2 pt-1">
              <label className="text-luxury-silver/50 block">
                {lang === 'ru' ? 'Вставь ключ для проверки формата:' : 'Paste key to verify format:'}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-white/20 focus:outline-none focus:border-luxury-gold/50 transition-colors pr-9"
                    placeholder="sk-proj-..."
                    value={openaiKey}
                    onChange={e => setOpenaiKey(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkKey()}
                  />
                  <button
                    onClick={() => setShowKey(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <button
                  onClick={checkKey}
                  disabled={keyLoading || !openaiKey.trim()}
                  className="px-4 py-2 bg-luxury-gold text-black font-bold rounded-lg hover:bg-luxury-gold/80 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {keyLoading ? '...' : (lang === 'ru' ? 'OK' : 'OK')}
                </button>
              </div>
              {keyError && <p className="text-red-400">{keyError}</p>}
              <p className="text-white/25">
                🛡 {lang === 'ru'
                  ? 'Ключ не отправляется никуда — проверяется только формат'
                  : 'Key is not sent anywhere — only the format is checked'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span className="font-semibold">{lang === 'ru' ? 'Ключ сохранён!' : 'Key saved!'}</span>
                <code className="text-white/30 font-mono ml-1">{openaiKey.slice(0, 8)}...{openaiKey.slice(-4)}</code>
              </div>

              {/* Railway instructions */}
              <div className="bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl p-4 space-y-2">
                <p className="text-luxury-gold font-semibold text-sm">
                  {lang === 'ru' ? '📋 Теперь добавь ключ в Railway:' : '📋 Now add the key to Railway:'}
                </p>
                <ol className="list-decimal list-inside space-y-1.5">
                  {railwaySteps.map((step, i) => (
                    <li key={i}>
                      {step.includes('**') ? (
                        <span dangerouslySetInnerHTML={{
                          __html: step
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                            .replace(/`(.+?)`/g, '<code class="bg-black/40 px-1 rounded text-green-400 font-mono">$1</code>')
                        }} />
                      ) : step}
                    </li>
                  ))}
                </ol>
                <a
                  href="https://railway.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-luxury-gold underline hover:text-luxury-gold/80 font-semibold"
                >
                  → {lang === 'ru' ? 'Открыть Railway' : 'Open Railway'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 2: Get code from mentor ── */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0',
            saved
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-luxury-gold/20 border-luxury-gold/50 text-luxury-gold',
          )}>
            {saved ? '✓' : '2'}
          </span>
          <span className="text-white font-semibold text-sm">
            {lang === 'ru' ? '💻 Получи код у ментора' : '💻 Get the code from the mentor'}
          </span>
        </div>

        <div className="pl-8 space-y-3">
          <div className="bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-luxury-silver/70 leading-relaxed">
            {lang === 'ru'
              ? <>Напиши ментору справа:<br/><span className="text-luxury-gold italic">«Сгенерируй полный файл main.py для WhatsApp бота. Используй мой промпт и базу знаний из урока 3. Код должен быть полным.»</span></>
              : <>Tell the mentor on the right:<br/><span className="text-luxury-gold italic">"Generate a complete main.py for a WhatsApp bot. Use my prompt and knowledge base from lesson 3. The code must be complete."</span></>
            }
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="text-white/40 text-xs font-mono">main.py</span>
            {saved && <span className="text-green-400 text-xs ml-auto">✓ {lang === 'ru' ? 'Сохранён' : 'Saved'}</span>}
          </div>
          <textarea
            rows={12}
            className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-sm text-green-400 font-mono placeholder-white/20 focus:outline-none focus:border-luxury-gold/30 transition-colors resize-none terminal-glow"
            placeholder={
              '# Вставь сюда код от ментора...\n\nfrom fastapi import FastAPI\nfrom openai import OpenAI\nimport os\n\napp = FastAPI()\nclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))\n\n@app.post("/webhook")\nasync def webhook(body: dict):\n    ...'
            }
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button
            onClick={handleSave}
            disabled={!code.trim()}
            className="w-full py-2.5 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-luxury-gold/80 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {lang === 'ru' ? 'Сохранить main.py ✓' : 'Save main.py ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Workspace: Terminal ----------
function TerminalWorkspace({
  lesson,
  lang,
  state,
  onStateChange,
}: {
  lesson: Lesson;
  lang: Lang;
  state: LessonState;
  onStateChange: (updates: Partial<LessonState>) => void;
}) {
  const txt = lesson[lang];
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ cmd: string; out: string }[]>([
    { cmd: '', out: lang === 'ru' ? 'Добро пожаловать в симулятор терминала. Введи команду:' : 'Welcome to the terminal simulator. Type a command:' }
  ]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function runCommand() {
    const cmd = input.trim();
    if (!cmd) return;
    setInput('');
    setHistIdx(-1);
    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, currentFiles: state.files || [] }),
      });
      const data = await res.json();
      setHistory(h => [...h, { cmd, out: data.output }]);
      if (data.newState) onStateChange(data.newState);
    } catch {
      setHistory(h => [...h, { cmd, out: 'Error: server unavailable' }]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { runCommand(); return; }
    const cmds = history.filter(h => h.cmd).map(h => h.cmd);
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, cmds.length - 1);
      setHistIdx(idx);
      setInput(cmds[cmds.length - 1 - idx] || '');
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx < 0 ? '' : cmds[cmds.length - 1 - idx] || '');
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto p-4 border-b border-white/10 max-h-40 shrink-0">
        <MD>{txt.instructions}</MD>
      </div>
      <div className="flex-1 flex flex-col min-h-0 p-3 gap-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="text-white/30 text-xs font-mono ml-1">bash — student@vps</span>
        </div>
        <div className="flex-1 bg-black/70 rounded-lg p-3 font-mono text-sm overflow-y-auto terminal-glow border border-white/5">
          {history.map((item, i) => (
            <div key={i} className="mb-1.5">
              {item.cmd && (
                <div className="text-luxury-gold">
                  <span className="text-white/40">$ </span>{item.cmd}
                </div>
              )}
              {item.out && (
                <pre className="text-green-400/80 whitespace-pre-wrap text-xs leading-relaxed ml-2">{item.out}</pre>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex items-center gap-2 bg-black/70 rounded-lg px-3 py-2 border border-white/10 focus-within:border-luxury-gold/40 transition-colors">
          <span className="text-white/40 font-mono text-sm">$</span>
          <input
            className="flex-1 bg-transparent text-green-400 font-mono text-sm outline-none placeholder-white/20"
            placeholder={lang === 'ru' ? 'введи команду...' : 'type command...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            onClick={runCommand}
            className="text-white/30 hover:text-luxury-gold transition-colors text-xs px-2"
          >
            ↵
          </button>
        </div>
        {state.gitPushed && (
          <div className="text-green-400 text-xs text-center flex items-center justify-center gap-1">
            <span>✓</span>
            <span>{lang === 'ru' ? 'git push выполнен — бот задеплоен!' : 'git push successful — bot deployed!'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- AI Mentor Chat ----------
function MentorChat({
  lang,
  lessonState,
  currentLesson,
}: {
  lang: Lang;
  lessonState: LessonState;
  currentLesson: Lesson;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const systemPrompt = `You are an AI Mentor for the "AI Architect Academy" — a course where non-technical entrepreneurs learn to build WhatsApp bots using Python, OpenAI, and Railway.

Current lesson: ${currentLesson[lang].title}
Language: ${lang === 'ru' ? 'Russian' : 'English'}

Student context:
- GitHub repo: ${lessonState.githubRepo || 'not set yet'}
- Railway URL: ${lessonState.vpsIp || 'not set yet'}
- System prompt: ${lessonState.systemPrompt ? 'written ✓' : 'not written yet'}
- Knowledge base: ${lessonState.knowledgeBase ? 'written ✓' : 'not written yet'}
- Saved files: ${lessonState.files?.join(', ') || 'none'}

Rules:
- Always respond in ${lang === 'ru' ? 'Russian' : 'English'}
- Be concise, friendly, and practical
- When asked to generate code, always generate COMPLETE, production-ready code
- When generating main.py, use FastAPI + OpenAI + python-decouple
- If the student shares their system prompt and knowledge base, incorporate them into any generated code
- Format code blocks with proper markdown fencing`;

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.find((b: any) => b.type === 'text')?.text || 'No response';
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: lang === 'ru' ? 'Ошибка соединения с ментором. Попробуй ещё раз.' : 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  const emptyHint = lang === 'ru'
    ? 'Привет! Я твой AI ментор. Задай любой вопрос по уроку или попроси написать код.'
    : "Hi! I'm your AI Mentor. Ask me anything about the lesson or request code.";

  return (
    <div className="flex flex-col h-full bg-black/20">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-semibold text-luxury-silver">
          {lang === 'ru' ? 'AI Ментор' : 'AI Mentor'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-luxury-silver/40 text-sm text-center mt-8 px-4">{emptyHint}</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'bg-luxury-gold/20 border border-luxury-gold/30 text-luxury-silver'
                : 'bg-white/5 border border-white/10 text-luxury-silver',
            )}>
              {msg.role === 'assistant' ? <MD>{msg.content}</MD> : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-luxury-gold/40 transition-colors"
            placeholder={lang === 'ru' ? 'Спроси ментора...' : 'Ask the mentor...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-luxury-gold text-black font-bold rounded-lg hover:bg-luxury-gold/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Logs Panel ----------
function LogsPanel({ lang }: { lang: Lang }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        setLogs(data);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [open]);

  async function clearLogs() {
    await fetch('/api/logs', { method: 'DELETE' });
    setLogs([]);
  }

  const levelColor = (level: string) => {
    if (level === 'ERROR') return 'text-red-400';
    if (level === 'WARN') return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2 flex items-center justify-between text-xs text-luxury-silver/50 hover:text-luxury-silver/80 transition-colors"
      >
        <span>🔍 {lang === 'ru' ? 'Логи бота (live)' : 'Bot Logs (live)'}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="bg-black/50 border-t border-white/10">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
            <span className="text-xs text-white/30 font-mono">{logs.length} {lang === 'ru' ? 'записей' : 'entries'}</span>
            <button onClick={clearLogs} className="text-xs text-white/30 hover:text-red-400 transition-colors">
              {lang === 'ru' ? 'Очистить' : 'Clear'}
            </button>
          </div>
          <div className="h-32 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
            {logs.length === 0 ? (
              <div className="text-white/20 text-center mt-4">
                {lang === 'ru' ? 'Логов пока нет. Запусти бота...' : 'No logs yet. Start your bot...'}
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-white/30 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={cn('shrink-0', levelColor(log.level))}>[{log.level}]</span>
                  <span className="text-white/70">{log.message}</span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}


type Plan = 'single' | 'unlimited' | null;

// ---------- Paywall Screen ----------
function PaywallScreen({
  lang,
  token,
  onUnlock,
}: {
  lang: Lang;
  token: string | null;
  onUnlock: (plan: Plan) => void;
}) {
  const [selected, setSelected] = useState<Plan>(null);

  const plans = [
    {
      key: 'single' as Plan,
      price: '15 000 ₸',
      title:    lang === 'ru' ? 'Один бот'  : 'Single Bot',
      subtitle: lang === 'ru' ? 'Создай одного WhatsApp-бота' : 'Build one WhatsApp bot',
      features: lang === 'ru'
        ? ['Уроки 2–7 полностью', 'AI Ментор без ограничений', '1 проект в Railway', 'Поддержка 30 дней']
        : ['Lessons 2–7 full access', 'Unlimited AI Mentor', '1 Railway project', '30-day support'],
    },
    {
      key: 'unlimited' as Plan,
      price: '25 000 ₸',
      title:    lang === 'ru' ? 'Безлимит'  : 'Unlimited',
      subtitle: lang === 'ru' ? 'Неограниченное количество ботов' : 'Build as many bots as you want',
      features: lang === 'ru'
        ? ['Всё из тарифа «Один бот»', 'Неограниченные проекты', 'Приоритетная поддержка', 'Обновления курса навсегда']
        : ['Everything in Single Bot', 'Unlimited projects', 'Priority support', 'Lifetime course updates'],
      highlight: true,
    },
  ];

  const selectedPlan = plans.find(p => p.key === selected);

  function handleWriteWA() {
    if (!selected || !selectedPlan) return;
    const planLabel = selectedPlan.title;
    const price     = selectedPlan.price;
    const tok       = token || '—';
    const msg = lang === 'ru'
      ? `Здравствуйте! Хочу оплатить курс AI Architect Academy.\nТариф: ${planLabel} — ${price}\nМой токен: ${tok}`
      : `Hello! I want to purchase AI Architect Academy.\nPlan: ${planLabel} — ${price}\nMy token: ${tok}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-luxury-graphite overflow-y-auto">
      <div className="max-w-xl w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-luxury-gold text-xs font-semibold uppercase tracking-wider">
              {lang === 'ru' ? '🔓 Разблокируй полный курс' : '🔓 Unlock Full Course'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {lang === 'ru' ? 'Урок 1 завершён — отлично!' : 'Lesson 1 complete — great job!'}
          </h2>
          <p className="text-luxury-silver/60 text-sm leading-relaxed">
            {lang === 'ru'
              ? 'Выбери тариф и напиши нам в WhatsApp — мы пришлём реквизиты и откроем доступ:'
              : "Choose a plan and message us on WhatsApp — we'll send payment details and unlock access:"}
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {plans.map(plan => (
            <button
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={cn(
                'relative text-left rounded-2xl border-2 p-5 transition-all duration-200',
                plan.highlight ? 'border-luxury-gold/60 bg-luxury-gold/5' : 'border-white/10 bg-white/5',
                selected === plan.key && 'ring-2 ring-luxury-gold border-luxury-gold',
                selected !== plan.key && 'hover:border-white/20',
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-luxury-gold text-black text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  {lang === 'ru' ? '🔥 Популярный' : '🔥 Popular'}
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold text-base">{plan.title}</div>
                  <div className="text-luxury-silver/50 text-xs mt-0.5">{plan.subtitle}</div>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                  selected === plan.key ? 'border-luxury-gold bg-luxury-gold' : 'border-white/20',
                )}>
                  {selected === plan.key && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
              </div>
              <div className="text-luxury-gold font-bold text-2xl mb-3">{plan.price}</div>
              <ul className="space-y-1.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-luxury-silver/70">
                    <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* CTA — WhatsApp */}
        <button
          onClick={handleWriteWA}
          disabled={!selected}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2',
            selected
              ? 'bg-green-500 text-white hover:bg-green-400 shadow-lg shadow-green-500/20'
              : 'bg-white/5 text-white/30 cursor-not-allowed',
          )}
        >
          💬 {selected
            ? (lang === 'ru'
                ? `Написать в WhatsApp — ${selectedPlan?.price} →`
                : `Message on WhatsApp — ${selectedPlan?.price} →`)
            : (lang === 'ru' ? 'Выбери тариф' : 'Select a plan')}
        </button>

        {/* Info: how it works */}
        <div className="mt-4 bg-black/20 border border-white/5 rounded-xl p-4 space-y-2 text-xs text-luxury-silver/50">
          <p className="font-semibold text-luxury-silver/70">
            {lang === 'ru' ? 'Как это работает:' : 'How it works:'}
          </p>
          {(lang === 'ru'
            ? [
                '1. Нажми кнопку — откроется WhatsApp с готовым сообщением',
                '2. Отправь сообщение — мы ответим с реквизитами (Kaspi/карта)',
                '3. После оплаты мы активируем твой доступ и пришлём подтверждение',
                '4. Обнови эту страницу — курс откроется автоматически',
              ]
            : [
                '1. Click the button — WhatsApp opens with a pre-filled message',
                "2. Send it — we'll reply with payment details",
                '3. After payment we activate your access and send confirmation',
                '4. Refresh this page — the course unlocks automatically',
              ]
          ).map((step, i) => (
            <p key={i}>{step}</p>
          ))}
        </div>

        {/* Token debug info (only if token present) */}
        {token && (
          <p className="text-center text-white/20 text-xs mt-3">
            token: <code className="font-mono">{token}</code>
          </p>
        )}

      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [lang, setLang] = useState<Lang>('ru');
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [lessonStates, setLessonStates] = useState<Record<number, LessonState>>({});
  const [plan, setPlan] = useState<Plan>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  // Token from URL — ?token=abc123
  const [urlToken] = useState<string | null>(() => {
    try { return new URLSearchParams(window.location.search).get('token'); } catch { return null; }
  });
  // Loading state while checking Supabase
  const [tokenChecking, setTokenChecking] = useState(false);

  // On mount: if token in URL → check Supabase for plan
  useEffect(() => {
    if (!urlToken) return;
    setTokenChecking(true);
    fetchTokenPlan(urlToken).then(fetchedPlan => {
      if (fetchedPlan) {
        setPlan(fetchedPlan);
        // If already paid, skip to lesson 2
        setCurrentLessonId(2);
      }
      setTokenChecking(false);
    });
  }, [urlToken]);

  const currentLesson = LESSONS.find(l => l.id === currentLessonId)!;
  const lessonState = lessonStates[currentLessonId] || {};

  const updateState = useCallback((updates: Partial<LessonState>) => {
    setLessonStates(prev => ({
      ...prev,
      [currentLessonId]: { ...(prev[currentLessonId] || {}), ...updates }
    }));
  }, [currentLessonId]);

  // Auto-advance when lesson is completed; show paywall after lesson 1
  useEffect(() => {
    const state = lessonStates[currentLessonId] || {};
    const done = currentLesson.successCheck(state);
    if (done && !completedIds.includes(currentLessonId)) {
      setCompletedIds(prev => [...prev, currentLessonId]);
      const nextId = currentLessonId + 1;
      if (nextId <= LESSONS.length) {
        if (currentLessonId === 1 && !plan) {
          // After lesson 1 — if token already paid skip paywall, else show it
          setTimeout(() => setShowPaywall(true), 800);
        } else {
          setTimeout(() => setCurrentLessonId(nextId), 800);
        }
      }
    }
  }, [lessonStates, currentLessonId, currentLesson, completedIds, plan]);

  // Unlock: proceed to lesson 2 after payment
  function handleUnlock(chosenPlan: Plan) {
    setPlan(chosenPlan);
    setShowPaywall(false);
    setCurrentLessonId(2);
  }

  // Sidebar: block access to lessons 2+ without a plan
  function handleLessonSelect(id: number) {
    if (id > 1 && !plan) {
      setShowPaywall(true);
      return;
    }
    setCurrentLessonId(id);
  }

  // Merge states from all lessons for mentor context
  const allState = Object.values(lessonStates).reduce((acc, s) => ({ ...acc, ...s }), {});

  const txt = currentLesson[lang];

  function renderWorkspace() {
    const props = { lesson: currentLesson, lang, state: lessonState, onStateChange: updateState };
    switch (currentLesson.workspaceType) {
      case 'info': return <InfoWorkspace {...props} />;
      case 'form': return <FormWorkspace {...props} />;
      case 'knowledge': return <KnowledgeWorkspace {...props} />;
      case 'code': return <CodeWorkspace {...props} />;
      case 'terminal': return <TerminalWorkspace {...props} />;
      default: return <InfoWorkspace {...props} />;
    }
  }

  // Mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Loading while checking token
  if (isMobile) {
    return <MobileBlock />;
  }

  // Loading while checking token
  if (tokenChecking) {
    return (
      <div className="flex h-screen bg-luxury-graphite items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex gap-1 items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-luxury-gold/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-luxury-gold/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-luxury-gold/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-luxury-silver/40 text-sm">
            {lang === 'ru' ? 'Проверяем доступ...' : 'Checking access...'}
          </p>
        </div>
      </div>
    );
  }

  // Show paywall overlay
  if (showPaywall) {
    return (
      <div className="flex h-screen bg-luxury-graphite overflow-hidden">
        <Sidebar
          lessons={LESSONS}
          currentId={currentLessonId}
          completedIds={completedIds}
          lang={lang}
          onSelect={handleLessonSelect}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar with lang switcher */}
          <header className="h-14 border-b border-white/10 flex items-center justify-end px-6 shrink-0">
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
              {(['ru', 'en'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    'px-3 py-1.5 transition-colors font-medium uppercase',
                    lang === l ? 'bg-luxury-gold/20 text-luxury-gold' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </header>
          <PaywallScreen lang={lang} token={urlToken} onUnlock={handleUnlock} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-luxury-graphite overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        lessons={LESSONS}
        currentId={currentLessonId}
        completedIds={completedIds}
        lang={lang}
        onSelect={handleLessonSelect}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-white font-semibold text-sm">{txt.title}</h1>
            <p className="text-luxury-silver/40 text-xs mt-0.5">{txt.successCondition}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Plan badge */}
            {plan && (
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-semibold border',
                plan === 'unlimited'
                  ? 'bg-luxury-gold/20 border-luxury-gold/40 text-luxury-gold'
                  : 'bg-white/5 border-white/20 text-white/60',
              )}>
                {plan === 'unlimited'
                  ? (lang === 'ru' ? '♾ Безлимит' : '♾ Unlimited')
                  : (lang === 'ru' ? '✓ Один бот' : '✓ Single Bot')}
              </span>
            )}
            {/* Lang toggle */}
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
              {(['ru', 'en'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    'px-3 py-1.5 transition-colors font-medium uppercase',
                    lang === l ? 'bg-luxury-gold/20 text-luxury-gold' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="text-xs text-luxury-silver/40">
              {lang === 'ru' ? 'Урок' : 'Lesson'} {currentLessonId}/{LESSONS.length}
            </div>
          </div>
        </header>

        {/* Content row */}
        <div className="flex-1 flex min-h-0">
          {/* Workspace */}
          <div className="flex-1 overflow-hidden border-r border-white/10 flex flex-col min-h-0">
            {renderWorkspace()}
          </div>

          {/* Right panel: Mentor + Logs */}
          <div className="w-80 xl:w-96 flex flex-col shrink-0 min-h-0">
            <div className="flex-1 min-h-0">
              <MentorChat
                lang={lang}
                lessonState={allState}
                currentLesson={currentLesson}
              />
            </div>
            <LogsPanel lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
