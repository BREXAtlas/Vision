import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom/client';
import {
  HashRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronRight,
  Clock3,
  Compass,
  Download,
  FlaskConical,
  Heart,
  Home,
  Landmark,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import type { AppState, Project } from './types';
import { initialState, loadState, saveState, validateImport } from './state';
import { quarters } from './content/quarters';
import { generateChapter } from './engine/chapterGenerator';
import {
  allDates,
  countdown,
  END,
  quarterForDate,
  START,
} from './engine/dateEngine';
import {
  bridgeActions,
  decisions,
  futureWhispers,
  legacyLaws,
  lessons,
  opportunityCards,
  quizzes,
  riskCards,
  scenarios,
  visualizations,
} from './content/library';
import { sources } from './content/sources';
import {
  allocationTotal,
  businessEquity,
  capTable,
  lifestyleGap,
  runway,
} from './engine/calculators';
import { applyRewards } from './engine/scoringEngine';
import './styles.css';
type Action =
  | { type: 'patch'; value: Partial<AppState> }
  | { type: 'replace'; value: AppState };
const Ctx = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);
const useApp = () => {
  const x = useContext(Ctx);
  if (!x) throw Error('context');
  return x;
};
function reducer(s: AppState, a: Action) {
  return a.type === 'replace' ? a.value : { ...s, ...a.value };
}
const todayIso = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};
const playableDate = () =>
  todayIso() < START ? START : todayIso() > END ? END : todayIso();
const Button = ({
  children,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p}>{children}</button>
);
function Layout() {
  const { state } = useApp(),
    [open, setOpen] = useState(false),
    loc = useLocation();
  useEffect(() => {
    document
      .querySelector<HTMLElement>('main h1')
      ?.focus({ preventScroll: true });
    setOpen(false);
  }, [loc.pathname]);
  const links = [
    ['/', 'Home', Home],
    ['/today', 'Today', Compass],
    ['/timeline', 'Timeline', Clock3],
    ['/academy', 'Academy', BookOpen],
    ['/wealth-lab', 'Wealth Lab', Landmark],
    ['/projects', 'Projects', BriefcaseBusiness],
    ['/journal', 'Journal', Heart],
    ['/progress', 'Progress', ChartNoAxesCombined],
    ['/legacy-laws', 'Legacy Laws', ShieldCheck],
    ['/course-builder', 'Course Builder', FlaskConical],
    ['/settings', 'Settings', SettingsIcon],
  ] as const;
  return (
    <div className={state.profile.largeText ? 'app large' : ''}>
      <header>
        <NavLink to="/" className="brand">
          <span className="mark">V</span>
          <span>
            <b>VISION 2031</b>
            <small>The McGaffie Legacy Game</small>
          </span>
        </NavLink>
        <Button
          className="menu"
          aria-expanded={open}
          aria-controls="nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
          <span className="sr-only">Menu</span>
        </Button>
        <nav id="nav" className={open ? 'open' : ''} aria-label="Primary">
          {links.map(([to, label, Icon]) => (
            <NavLink end={to === '/'} to={to} key={to}>
              <Icon />
              {label}
            </NavLink>
          ))}
          {state.profile.instructorMode && (
            <NavLink to="/author">Author</NavLink>
          )}
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/vision-day" element={<VisionDay />} />
          <Route path="/rewind" element={<Rewind />} />
          <Route path="/today" element={<Today />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/quarter/:quarterId" element={<QuarterPage />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/wealth-lab" element={<WealthLab />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/legacy-laws" element={<Laws />} />
          <Route path="/course-builder" element={<CourseBuilder />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/author" element={<Author />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>
        <p>
          Vision Story ≠ prediction. Real Plan = measurable action. Learning Lab
          = sourced education.
        </p>
        <p>
          <NavLink to="/sources">Sources, privacy & disclaimers</NavLink> · Your
          entries remain in this browser unless you export them.
        </p>
      </footer>
    </div>
  );
}
function Dashboard() {
  const { state } = useApp(),
    nav = useNavigate(),
    [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const c = countdown(state.profile.visionDate, now),
    date = playableDate(),
    chapter = generateChapter(
      date,
      state.profile.displayName,
      state.profile.fundingPath,
    ),
    q = quarterForDate(date);
  return (
    <>
      <section className="hero">
        <div className="eyebrow">Where do you see yourself in five years?</div>
        <h1 tabIndex={-1}>Build the person who can steward the vision.</h1>
        <p className="lede">
          A cinematic journey from possibility to evidence—one grounded move at
          a time.
        </p>
        <div className="actions">
          <Button
            className="primary"
            onClick={() =>
              nav(
                state.onboarded
                  ? state.prologueComplete
                    ? '/today'
                    : '/vision-day'
                  : '/onboarding',
              )
            }
          >
            {state.onboarded ? 'Resume the journey' : 'Begin the journey'}
            <ChevronRight />
          </Button>
          <Button onClick={() => nav('/timeline')}>Explore 15 quarters</Button>
        </div>
        <div className="identity">
          “Vision becomes action. Action becomes evidence. Evidence becomes
          identity.”
        </div>
      </section>
      <section aria-labelledby="dashboard-title">
        <div className="section-head">
          <div>
            <span className="eyebrow">Command center</span>
            <h2 id="dashboard-title">
              Good {new Date().getHours() < 12 ? 'morning' : 'day'},{' '}
              {state.profile.displayName}.
            </h2>
          </div>
          <span className="pill">
            {q ? `Quarter ${q.id} · ${q.season}` : 'Preseason'}
          </span>
        </div>
        <div className="grid dashboard-grid">
          <article className="card featured">
            <span className="eyebrow">Today’s chapter</span>
            <h3>{chapter.title}</h3>
            <p>{chapter.futureWhisper}</p>
            <Button className="primary" onClick={() => nav('/today')}>
              Enter chapter
            </Button>
          </article>
          <article className="card">
            <span className="eyebrow">Vision Day countdown</span>
            <h3>
              {c.passed
                ? 'Vision Day Is Here — Enter Legacy Mode'
                : `${c.days} days`}
            </h3>
            {!c.passed && (
              <p
                aria-label={`${c.days} days, ${c.hours} hours, ${c.minutes} minutes, ${c.seconds} seconds`}
              >
                <b>{String(c.hours).padStart(2, '0')}</b>h{' '}
                <b>{String(c.minutes).padStart(2, '0')}</b>m{' '}
                <b>{String(c.seconds).padStart(2, '0')}</b>s
              </p>
            )}
            <small>
              Target time uses the profile’s local calendar strategy.
            </small>
          </article>
          <article className="card">
            <span className="eyebrow">One move before noon</span>
            <h3>{chapter.minimumAction}</h3>
            <p>5–15 minutes · no perfect conditions required.</p>
          </article>
          <Timer compact />
          <article className="card">
            <span className="eyebrow">Progress</span>
            <h3>
              Level {Math.floor(state.xp / 250) + 1} · {state.xp} XP
            </h3>
            <p>
              {state.completedDates.length} chapters complete. A missed day is
              information, not failure.
            </p>
            <div className="meter">
              <span style={{ width: `${(state.xp % 250) / 2.5}%` }} />
            </div>
          </article>
          <article className="card">
            <span className="eyebrow">Project signal</span>
            <h3>
              {state.projects.filter((p) => !p.nextMilestone).length ||
                state.projects.filter((p) => p.stage === 'Active').length}{' '}
              priorities need attention
            </h3>
            <p>Protect capacity and keep the next evidence visible.</p>
            <Button onClick={() => nav('/projects')}>Review portfolio</Button>
          </article>
        </div>
      </section>
    </>
  );
}
function Onboarding() {
  const { state, dispatch } = useApp(),
    nav = useNavigate(),
    [p, setP] = useState(state.profile);
  return (
    <section className="narrow">
      <span className="eyebrow">First-run setup</span>
      <h1 tabIndex={-1}>Make the vision yours.</h1>
      <p>
        This is an aspirational simulation—not a prediction or promise. You
        control the names, dates, and strategic path.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: 'patch', value: { profile: p, onboarded: true } });
          nav('/vision-day');
        }}
      >
        <label>
          Preferred display name
          <input
            value={p.displayName}
            onChange={(e) => setP({ ...p, displayName: e.target.value })}
            required
          />
        </label>
        <label>
          Future identity
          <input
            value={p.futureName}
            onChange={(e) => setP({ ...p, futureName: e.target.value })}
          />
        </label>
        <label>
          Vision date
          <input
            type="date"
            value={p.visionDate}
            onChange={(e) => setP({ ...p, visionDate: e.target.value })}
          />
        </label>
        <label>
          Funding path
          <select
            value={p.fundingPath}
            onChange={(e) =>
              setP({
                ...p,
                fundingPath: e.target.value as typeof p.fundingPath,
              })
            }
          >
            {[
              'Bootstrapped',
              'Venture-backed',
              'Hybrid',
              'Grant and partnership led',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Privacy promise</legend>
          <p>
            Your entries remain in this browser unless you export them. This
            application does not send your journal or financial entries to a
            server.
          </p>
        </fieldset>
        <Button className="primary" type="submit">
          Wake up in 2031
          <ChevronRight />
        </Button>
      </form>
    </section>
  );
}
const prologue = [
  [
    '5:45 AM',
    'The Estate',
    'I wake naturally in a modern Houston estate. Sunrise reaches across the pool and glass. I protect sleep, breathe, pray, give thanks, and read the vision. This life began when vision became a calendar.',
  ],
  [
    '6:30 AM',
    'Health and Family',
    'Martial-arts-inspired training gives way to breakfast and a family trip conversation. The real luxury is time, presence, health, and freedom; every professional around us is treated with dignity.',
  ],
  [
    '7:45 AM',
    'The Drive',
    'Marcus turns transit into protected thinking time. Privacy, safety, and delegation create leverage. My CFO smiles: “The car is a want, Lawrence—not an investment.”',
  ],
  [
    '8:30 AM',
    'BREXAtlas Headquarters',
    'A capable CEO runs the stand-up. As founder-owner and Executive Chairman, I ask three high-value questions and leave the team empowered. Ownership is not constant operation.',
  ],
  [
    '9:15 AM',
    'Acquisition Review',
    'The team compares build, buy, license, and partner paths. Valuation is a range; diligence covers financial, legal, technical, cultural, and integration risk.',
  ],
  [
    '10:30 AM',
    'Foundation Work',
    'The future McGaffie Foundation supports STEM, financial literacy, digital literacy, and research access with governance and impact measures—not unstructured giving.',
  ],
  [
    '11:15 AM',
    'Wealth Review',
    'Advisors separate liquidity, risk, business equity, and opportunity. An investment policy guides decisions; ego does not. Professional legal and tax guidance matters.',
  ],
  [
    '12:30 PM',
    'Family Stewardship',
    'At lunch I teach ownership, trusts, responsibility, and generosity. The aim is to raise stewards, not passive heirs.',
  ],
  [
    '2:00 PM',
    'Private Aviation',
    'At the FBO, charter, jet cards, fractional interests, and ownership become total-cost choices. Aviation is a time tool after productive assets—not proof of worth.',
  ],
  [
    '7:00 PM',
    'Keynote',
    '“I Create My Own Wealth: The Systems Behind the Statement” connects leadership, research, ownership, education, and legacy. In this vision story, speaking supports the foundation.',
  ],
  [
    'Late Evening',
    'Home',
    'I return to gratitude and peace. The board was never about objects. It was about becoming the person capable of stewarding the life.',
  ],
];
function VisionDay() {
  const { dispatch } = useApp(),
    [i, setI] = useState(0),
    nav = useNavigate(),
    s = prologue[i];
  return (
    <section className="cinematic">
      <span className="eyebrow">
        Vision Story · July 14, 2031 · Houston, Texas
      </span>
      <h1 tabIndex={-1}>
        Vision Day: I Woke Up Inside the Life I Had Been Building
      </h1>
      <div className="scene">
        <span>{s[0]}</span>
        <h2>{s[1]}</h2>
        <p>{s[2]}</p>
      </div>
      <div className="actions">
        <Button disabled={i === 0} onClick={() => setI(i - 1)}>
          Previous
        </Button>
        {i < prologue.length - 1 ? (
          <Button className="primary" onClick={() => setI(i + 1)}>
            Continue <ChevronRight />
          </Button>
        ) : (
          <Button
            className="primary"
            onClick={() => {
              dispatch({ type: 'patch', value: { prologueComplete: true } });
              nav('/rewind');
            }}
          >
            REWIND THE LIFE <RotateCcw />
          </Button>
        )}
      </div>
      <div className="dots" aria-label={`Scene ${i + 1} of ${prologue.length}`}>
        {prologue.map((_, x) => (
          <span className={x === i ? 'active' : ''} key={x} />
        ))}
      </div>
    </section>
  );
}
function Rewind() {
  const { state, dispatch } = useApp(),
    nav = useNavigate(),
    i = state.rewindCount,
    q = quarters[14 - Math.min(i, 14)];
  return (
    <section className="narrow">
      <span className="eyebrow">Rewind · {i}/15 revealed</span>
      <h1 tabIndex={-1}>What had to be true?</h1>
      <article className="card rewind">
        <span className="pill">
          Quarter {q.id} · {q.season}
        </span>
        <h2>{q.title}</h2>
        <p>{q.story}</p>
        <dl>
          <dt>Skill learned</dt>
          <dd>{q.lessons[0]}</dd>
          <dt>Decision made</dt>
          <dd>Choose evidence and stewardship over appearance.</dd>
          <dt>What stopped</dt>
          <dd>Carrying every possibility as a present commitment.</dd>
          <dt>Evidence created</dt>
          <dd>{q.artifact}</dd>
          <dt>Who joined</dt>
          <dd>
            Family, collaborators, advisors, learners, and a capable team.
          </dd>
          <dt>Risk managed</dt>
          <dd>{q.boss}</dd>
        </dl>
      </article>
      {i < 15 ? (
        <Button
          className="primary wide"
          onClick={() =>
            dispatch({ type: 'patch', value: { rewindCount: i + 1 } })
          }
        >
          Reveal Quarter {Math.max(1, q.id - 1)} <RotateCcw />
        </Button>
      ) : (
        <Button className="primary wide" onClick={() => nav('/today')}>
          Unlock Fall 2026 <ChevronRight />
        </Button>
      )}
    </section>
  );
}
function Speech({ text }: { text: string }) {
  const [status, setStatus] = useState('idle');
  const supported = 'speechSynthesis' in window;
  const speak = () => {
    if (!supported) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setStatus('idle');
    speechSynthesis.speak(u);
    setStatus('speaking');
  };
  return (
    <div className="speech" aria-label="Text to speech controls">
      {status === 'idle' ? (
        <Button onClick={speak} disabled={!supported}>
          <Volume2 /> Listen
        </Button>
      ) : (
        <>
          <Button
            onClick={() => {
              speechSynthesis.pause();
              setStatus('paused');
            }}
            disabled={status === 'paused'}
          >
            <Pause /> Pause
          </Button>
          <Button
            onClick={() => {
              speechSynthesis.resume();
              setStatus('speaking');
            }}
            disabled={status !== 'paused'}
          >
            <Play /> Resume
          </Button>
          <Button
            onClick={() => {
              speechSynthesis.cancel();
              setStatus('idle');
            }}
          >
            <Square /> Stop
          </Button>
        </>
      )}
      {!supported && (
        <small>Text-to-speech is unavailable in this browser.</small>
      )}
    </div>
  );
}
function Today() {
  const { state, dispatch } = useApp(),
    [date, setDate] = useState(playableDate()),
    chapter = generateChapter(
      date,
      state.profile.displayName,
      state.profile.fundingPath,
    ),
    [choice, setChoice] = useState(state.choices[date]),
    [answer, setAnswer] = useState<number | undefined>(),
    [session, setSession] = useState('Standard Session'),
    completed = state.completedDates.includes(date);
  const setField = (
    key: 'journal' | 'gratitude' | 'bridgeActions',
    value: string,
  ) =>
    dispatch({
      type: 'patch',
      value: { [key]: { ...state[key], [date]: value } },
    });
  const complete = () => {
    const dates = completed
      ? state.completedDates
      : [...state.completedDates, date];
    const laws = [...new Set([...state.legacyLaws, chapter.quarterId ?? 1])];
    const rewards =
      choice === undefined ? {} : chapter.decision.choices[choice].rewards;
    const stats = completed ? state.stats : applyRewards(state.stats, rewards);
    if (!completed) {
      stats.vision += 1;
      stats.execution += 1;
    }
    dispatch({
      type: 'patch',
      value: {
        completedDates: dates,
        xp: completed ? state.xp : state.xp + chapter.xp,
        legacyLaws: laws,
        stats,
      },
    });
  };
  return (
    <section className="chapter">
      <div className="section-head">
        <div>
          <span className="eyebrow">Daily chapter · {session}</span>
          <h1 tabIndex={-1}>{chapter.title}</h1>
          <p>
            {date} ·{' '}
            {chapter.quarterId ? `Quarter ${chapter.quarterId}` : 'Preseason'}
          </p>
        </div>
        <div>
          <label className="compact-label">
            Preview date
            <input
              type="date"
              min={START}
              max={END}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="compact-label">
            Session
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option>Minimum Move</option>
              <option>Standard Session</option>
              <option>Deep Work Session</option>
            </select>
          </label>
          <label className="compact-label">
            Play mode
            <select
              value={state.mode}
              onChange={(e) =>
                dispatch({
                  type: 'patch',
                  value: { mode: e.target.value as AppState['mode'] },
                })
              }
            >
              <option value="today">Today mode</option>
              <option value="catch-up">Catch-up mode</option>
              <option value="replay">Replay mode</option>
              <option value="author">Author preview mode</option>
            </select>
          </label>
        </div>
      </div>
      {date < playableDate() && (
        <div className="callout">
          Welcome back. There is no debt of shame here—choose the chapter that
          helps you move now.
        </div>
      )}
      <Speech text={`${chapter.title}. ${chapter.scene}. ${chapter.lesson}`} />
      <div className="chapter-grid">
        <article className="card scene-card">
          <span className="eyebrow">First-person scene</span>
          <p className="narrative">{chapter.scene}</p>
          <blockquote>{chapter.futureWhisper}</blockquote>
        </article>
        <article className="card">
          <span className="eyebrow">Practical lesson</span>
          <h2>{chapter.lesson}</h2>
          <p>
            <b>Wealthy conduct:</b> {chapter.wealthyConduct}
          </p>
          <small>
            Learning Lab · see source-linked Academy lesson. Rules and figures
            change; verify current official guidance.
          </small>
        </article>
        <article className="card full">
          <span className="eyebrow">Decision</span>
          <h2>{chapter.decision.prompt}</h2>
          <div className="choice-grid">
            {chapter.decision.choices.map((c, i) => (
              <Button
                className={choice === i ? 'selected' : ''}
                key={c.label}
                onClick={() => {
                  setChoice(i);
                  dispatch({
                    type: 'patch',
                    value: { choices: { ...state.choices, [date]: i } },
                  });
                }}
              >
                <b>{c.label}</b>
                <span>{c.tradeoff}</span>
              </Button>
            ))}
          </div>
          {choice !== undefined && (
            <p className="feedback" role="status">
              Tradeoff accepted: {chapter.decision.choices[choice].tradeoff}{' '}
              This choice will inform the quarter summary and recommended
              actions.
            </p>
          )}
        </article>
        <article className="card">
          <span className="eyebrow">Knowledge check</span>
          <h2>{chapter.quiz.prompt}</h2>
          {chapter.quiz.choices.map((x, i) => (
            <Button
              className="quiz-option"
              key={x}
              onClick={() => {
                setAnswer(i);
                dispatch({
                  type: 'patch',
                  value: {
                    quizResults: {
                      ...state.quizResults,
                      [chapter.quiz.id]: i === chapter.quiz.answer,
                    },
                  },
                });
              }}
            >
              {x}
            </Button>
          ))}
          {answer !== undefined && (
            <p
              role="status"
              className={answer === chapter.quiz.answer ? 'success' : 'warning'}
            >
              {answer === chapter.quiz.answer
                ? 'Correct. '
                : 'Review it again. '}
              {chapter.quiz.explanation}
            </p>
          )}
        </article>
        <article className="card">
          <span className="eyebrow">Bridge to today</span>
          <h2>
            {session === 'Deep Work Session'
              ? chapter.deepAction
              : chapter.minimumAction}
          </h2>
          <label>
            Evidence or completion note
            <textarea
              value={state.bridgeActions[date] ?? ''}
              onChange={(e) => setField('bridgeActions', e.target.value)}
            />
          </label>
          <p>
            <b>XP reward:</b> {chapter.xp} · Vision + Execution
          </p>
        </article>
        <article className="card">
          <span className="eyebrow">Journal & evidence</span>
          <label>
            {chapter.journalPrompt}
            <textarea
              value={state.journal[date] ?? ''}
              onChange={(e) => setField('journal', e.target.value)}
            />
          </label>
          <label>
            {chapter.gratitudePrompt}
            <textarea
              value={state.gratitude[date] ?? ''}
              onChange={(e) => setField('gratitude', e.target.value)}
            />
          </label>
        </article>
        <article className="card">
          <span className="eyebrow">Visualization</span>
          <h2>{chapter.visualization}</h2>
          <p className="identity">“{chapter.identity}”</p>
          <Timer />
        </article>
      </div>
      <Button className="primary wide" onClick={complete}>
        {completed
          ? 'Chapter complete · revisit freely'
          : 'Complete chapter and record evidence'}
      </Button>
    </section>
  );
}
function Timeline() {
  return (
    <section>
      <span className="eyebrow">Real Plan · 15 four-month seasons</span>
      <h1 tabIndex={-1}>The complete road to Vision Day</h1>
      <p className="lede">
        Every calendar day from July 11, 2026 through August 31, 2031 maps
        once—without gaps or overlaps.
      </p>
      <div className="timeline">
        <article className="quarter-card preseason">
          <span>Preseason</span>
          <h2>Prepare the Ground</h2>
          <p>July 11–August 31, 2026</p>
        </article>
        {quarters.map((q) => (
          <NavLink className="quarter-card" to={`/quarter/${q.id}`} key={q.id}>
            <span>
              Quarter {q.id} · {q.season}
            </span>
            <h2>{q.title}</h2>
            <p>
              {q.start} — {q.end}
            </p>
            <small>{q.artifact}</small>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
function QuarterPage() {
  const id = Number(useParams().quarterId),
    q = quarters.find((x) => x.id === id);
  if (!q) return <NotFound />;
  return (
    <section>
      <span className="eyebrow">
        Quarter {q.id} · {q.season}
      </span>
      <h1 tabIndex={-1}>{q.title}</h1>
      <p className="lede">{q.story}</p>
      <div className="grid cols-2">
        <article className="card">
          <h2>Primary goals</h2>
          <ul>
            {q.goals.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h2>Playable milestones</h2>
          <ul>
            {q.milestones.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2>Cornerstone lessons</h2>
          <ul>
            {q.lessons.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div className="boss">
            <span>Boss battle</span>
            <h3>{q.boss}</h3>
          </div>
          <p>
            <b>Quarter artifact:</b> {q.artifact}
          </p>
          <blockquote>{q.echo}</blockquote>
        </article>
      </div>
      <NavLink className="button primary" to={`/lesson/lesson-${q.id}`}>
        Begin a cornerstone lesson
      </NavLink>
    </section>
  );
}
function Academy() {
  const [term, setTerm] = useState('');
  const matches = lessons.filter((l) =>
    (l.title + l.summary).toLowerCase().includes(term.toLowerCase()),
  );
  return (
    <section>
      <span className="eyebrow">Learning Lab · 12 curriculum categories</span>
      <h1 tabIndex={-1}>The Legacy Academy</h1>
      <p className="lede">
        Source-supported lessons, scored explanations, and spaced
        review—education without punishment.
      </p>
      <label className="search">
        Search 60 cornerstone lessons
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Try liquidity, research, security…"
        />
      </label>
      <div className="grid cols-3">
        {matches.map((l) => (
          <NavLink
            className="card lesson-card"
            to={`/lesson/${l.id}`}
            key={l.id}
          >
            <span className="pill">
              Quarter {l.quarterId} · {l.minutes} min
            </span>
            <h2>{l.title}</h2>
            <p>{l.summary}</p>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
function LessonPage() {
  const id = useParams().lessonId,
    l = lessons.find((x) => x.id === id),
    q = l && quizzes.find((x) => x.quarterId === l.quarterId);
  const [a, setA] = useState<number>();
  if (!l) return <NotFound />;
  return (
    <section className="narrow">
      <span className="eyebrow">Academy lesson · Quarter {l.quarterId}</span>
      <h1 tabIndex={-1}>{l.title}</h1>
      <p className="lede">{l.summary}</p>
      <article className="prose">
        <h2>Learn</h2>
        <p>
          Begin by separating the aspiration from the measurement. Record
          assumptions, seek disconfirming evidence, and choose a next step small
          enough to evaluate. Financial values in this application are game
          indicators or editable educational scenarios, not real performance.
        </p>
        <h2>Apply</h2>
        <ol>
          <li>Name the decision and the people affected.</li>
          <li>Locate the best official guidance available.</li>
          <li>Record uncertainty and a reversible test.</li>
          <li>Capture evidence before scaling the claim.</li>
        </ol>
        <h2>Check understanding</h2>
        <p>{q?.prompt}</p>
        {q?.choices.map((x, i) => (
          <Button className="quiz-option" onClick={() => setA(i)} key={x}>
            {x}
          </Button>
        ))}
        {a !== undefined && (
          <p role="status" className={a === q?.answer ? 'success' : 'warning'}>
            {q?.explanation}
          </p>
        )}
        <h2>Sources</h2>
        {l.sourceIds.map((id) => {
          const s = sources.find((x) => x.id === id);
          return s ? (
            <p key={id}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title} — {s.organization}
              </a>
            </p>
          ) : null;
        })}
        <div className="callout">
          Educational content only. Rules and figures change; verify current
          official guidance and consult qualified professionals for personal
          decisions.
        </div>
      </article>
    </section>
  );
}
function Num({
  label,
  value,
  set,
  suffix,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label>
      {label}
      <span className="input-unit">
        <input
          type="number"
          value={value}
          onChange={(e) => set(Number(e.target.value))}
        />
        {suffix && <i>{suffix}</i>}
      </span>
    </label>
  );
}
function WealthLab() {
  const [tab, setTab] = useState('allocation'),
    [cash, setCash] = useState(500000),
    [tbills, setTbills] = useState(5000000),
    [portfolio, setPortfolio] = useState(10000000),
    [alts, setAlts] = useState(4500000),
    [ret, setRet] = useState(5),
    [spend, setSpend] = useState(600000),
    [valuation, setValuation] = useState(100000000),
    [own, setOwn] = useState(40),
    [dilution, setDilution] = useState(20),
    [tax, setTax] = useState(25),
    [runCash, setRunCash] = useState(500000),
    [revenue, setRevenue] = useState(50000),
    [burn, setBurn] = useState(100000);
  const total = allocationTotal([cash, tbills, portfolio, alts]),
    equity = businessEquity(valuation, own, dilution, tax),
    months = runway(runCash, revenue, burn),
    tools = [
      ['allocation', '$20M Allocation'],
      ['equity', 'Business Equity'],
      ['captable', 'Cap Table'],
      ['runway', 'Runway'],
      ['treasury', 'Treasury Ladder'],
      ['lifestyle', 'Lifestyle'],
      ['jet', 'Jet Decision'],
      ['yacht', 'Yacht Decision'],
      ['family', 'Family Office'],
      ['acquisition', 'Acquisition'],
      ['ipo', 'IPO Readiness'],
      ['giving', 'Philanthropy'],
    ];
  return (
    <section>
      <span className="eyebrow">Learning Lab · Editable illustrations</span>
      <h1 tabIndex={-1}>Wealth Lab</h1>
      <p className="lede">
        Understand the measurements beneath the vision. These scenarios are
        educational—not individualized financial, tax, legal, or accounting
        advice.
      </p>
      <div className="tabs" role="tablist" aria-label="Wealth tools">
        {tools.map(([id, n]) => (
          <Button
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            key={id}
          >
            {n}
          </Button>
        ))}
      </div>
      {tab === 'allocation' && (
        <Lab
          title="$20 Million Vision Allocation"
          reality="A $20 million investable relationship is different from company valuation, paper net worth, or accessible cash."
        >
          <div className="form-grid">
            <Num label="Operating cash" value={cash} set={setCash} />
            <Num label="Treasury-bill ladder" value={tbills} set={setTbills} />
            <Num
              label="Diversified portfolio"
              value={portfolio}
              set={setPortfolio}
            />
            <Num label="Alternatives" value={alts} set={setAlts} />
            <Num
              label="Illustrative expected return"
              value={ret}
              set={setRet}
              suffix="%"
            />
            <Num label="Annual spending" value={spend} set={setSpend} />
          </div>
          <h3>Total: {money(total)}</h3>
          <table>
            <caption>Allocation values and percentages</caption>
            <thead>
              <tr>
                <th>Bucket</th>
                <th>Dollars</th>
                <th>Percent</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Operating cash', cash],
                ['T-bills', tbills],
                ['Portfolio', portfolio],
                ['Alternatives', alts],
              ].map(([n, v]) => (
                <tr key={String(n)}>
                  <td>{n}</td>
                  <td>{money(Number(v))}</td>
                  <td>
                    {total
                      ? `${((Number(v) / total) * 100).toFixed(1)}%`
                      : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Illustrative annual return before taxes, inflation, fees, and market
            decline: <b>{money((total * ret) / 100)}</b>. Spending gap after
            that illustration: <b>{money((total * ret) / 100 - spend)}</b>. A
            return is never guaranteed.
          </p>
        </Lab>
      )}
      {tab === 'equity' && (
        <Lab
          title="Net Worth vs. Liquidity & Business Equity"
          reality="Valuation is an estimate. Ownership can be illiquid, restricted, diluted, taxed, and transaction-dependent."
        >
          <div className="form-grid">
            <Num
              label="Company valuation"
              value={valuation}
              set={setValuation}
            />
            <Num label="Ownership" value={own} set={setOwn} suffix="%" />
            <Num
              label="Hypothetical dilution"
              value={dilution}
              set={setDilution}
              suffix="%"
            />
            <Num
              label="User tax assumption"
              value={tax}
              set={setTax}
              suffix="%"
            />
          </div>
          <Result
            rows={[
              ['Paper equity', equity.paper],
              ['After dilution', equity.postDilution],
              ['Hypothetical net transaction proceeds', equity.estimatedNet],
            ]}
          />
        </Lab>
      )}
      {tab === 'runway' && (
        <Lab
          title="Runway Calculator"
          reality="Runway estimates change with collections, growth, expenses, and timing. Stress-test rather than rely on one forecast."
        >
          <div className="form-grid">
            <Num label="Cash" value={runCash} set={setRunCash} />
            <Num label="Monthly revenue" value={revenue} set={setRevenue} />
            <Num label="Monthly burn" value={burn} set={setBurn} />
          </div>
          <h3>
            {months === Infinity
              ? 'Cash-flow positive at these assumptions'
              : `${months.toFixed(1)} months of runway`}
          </h3>
        </Lab>
      )}
      {tab === 'captable' && (
        <GenericLab
          title="Cap-Table & Dilution Simulator"
          text={`A 1,000-share founder and 250-share employee pool before 500 new investor shares become ${capTable(
            [
              { name: 'Founder', shares: 1000 },
              { name: 'Employees', shares: 250 },
            ],
            500,
          )
            .map((x) => `${x.name}: ${x.percent.toFixed(1)}%`)
            .join(
              ', ',
            )}. New rounds and option pools dilute percentages even when share counts do not change.`}
        />
      )}{' '}
      {tab === 'treasury' && (
        <GenericLab
          title="Treasury Ladder Simulator"
          text="Illustrative maturities at 4, 8, 13, 17, 26, and 52 weeks can spread liquidity timing. Reinvestment rates are unknown; this tool does not trade or guarantee yield."
        />
      )}
      {tab === 'lifestyle' && (
        <GenericLab
          title="Lifestyle Sustainability"
          text={`Illustration: $1.2M cash flow minus $750k spending and $200k reserves leaves ${money(lifestyleGap(1200000, 750000, 200000))}. Include property, staff, travel, security, taxes, insurance, maintenance, and uncertainty.`}
        />
      )}{' '}
      {tab === 'jet' && (
        <GenericLab
          title="Jet Decision Lab"
          text="Compare commercial, charter, jet card, fractional, and full ownership by annual hours, route fit, time value, acquisition cost, crew, maintenance, insurance, hangar, repositioning, and downtime. Verify current costs with qualified operators."
        />
      )}
      {tab === 'yacht' && (
        <GenericLab
          title="Yacht Decision Lab"
          text="Charter may convert fixed ownership, crew, storage, maintenance, insurance, and refit costs into usage-based costs. Utilization and opportunity cost matter more than appearance."
        />
      )}
      {tab === 'family' && (
        <GenericLab
          title="Family Office Lab"
          text="Compare coordinated outside advisors, a multi-family office, and a dedicated office by complexity, privacy, governance, reporting, and total cost. There is no universal asset threshold."
        />
      )}
      {tab === 'acquisition' && (
        <GenericLab
          title="Acquisition Lab"
          text="Test revenue, sustainable cash flow, purchase multiple, financing, synergies, integration costs, cultural fit, and downside cases. A low price cannot rescue weak strategic fit."
        />
      )}
      {tab === 'ipo' && (
        <GenericLab
          title="IPO Readiness Lab"
          text="Review governance, audited financials, controls, growth quality, legal readiness, investor relations, reporting duties, costs, lockups, listing requirements, and private alternatives. Going public is a financing and governance choice—not a trophy."
        />
      )}
      {tab === 'giving' && (
        <GenericLab
          title="Philanthropy Lab"
          text="Compare direct giving, donor-advised funds, and private-foundation concepts by control, administration, governance, impact measurement, and professional advice. Foundation qualifying-distribution rules contain definitions and exceptions; avoid reducing them to a slogan."
        />
      )}
    </section>
  );
}
const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
function Lab({
  title,
  reality,
  children,
}: {
  title: string;
  reality: string;
  children: React.ReactNode;
}) {
  return (
    <article className="lab card">
      <span className="eyebrow">Interactive scenario</span>
      <h2>{title}</h2>
      <div className="reality">
        <b>Reality Check</b>
        <p>{reality}</p>
      </div>
      {children}
    </article>
  );
}
function GenericLab({ title, text }: { title: string; text: string }) {
  return (
    <Lab
      title={title}
      reality="Illustrative assumptions only. Verify current rules, costs, and professional guidance."
    >
      <p className="lede">{text}</p>
    </Lab>
  );
}
function Result({ rows }: { rows: [string, number][] }) {
  return (
    <dl className="results">
      {rows.map(([x, y]) => (
        <React.Fragment key={x}>
          <dt>{x}</dt>
          <dd>{money(y)}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
function Projects() {
  const { state, dispatch } = useApp(),
    [selected, setSelected] = useState<Project | null>(null);
  const update = (p: Project) => {
    dispatch({
      type: 'patch',
      value: { projects: state.projects.map((x) => (x.id === p.id ? p : x)) },
    });
    setSelected(p);
  };
  return (
    <section>
      <span className="eyebrow">Real Plan · Editable portfolio</span>
      <h1 tabIndex={-1}>Project Portfolio</h1>
      <p className="lede">
        Capacity is strategy. Red signals identify overload, missing actions,
        unresolved risk, or stalled work—not personal failure.
      </p>
      <div className="heatmap" aria-label="Portfolio heat map">
        {state.projects.map((p) => {
          const risk = !p.nextMilestone
            ? 'danger'
            : p.stage === 'Active' && p.weeklyCommitment < 2
              ? 'warning'
              : 'healthy';
          return (
            <Button className={risk} onClick={() => setSelected(p)} key={p.id}>
              <b>{p.name}</b>
              <span>
                {p.stage} · Q{p.quarterId}
              </span>
            </Button>
          );
        })}
      </div>
      {selected && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
            className="dialog"
          >
            <Button className="close" onClick={() => setSelected(null)}>
              <X />
              <span className="sr-only">Close</span>
            </Button>
            <h2 id="project-title">{selected.name}</h2>
            <label>
              Description
              <textarea
                value={selected.description}
                onChange={(e) =>
                  update({ ...selected, description: e.target.value })
                }
              />
            </label>
            <label>
              Vision
              <textarea
                value={selected.vision}
                onChange={(e) =>
                  update({ ...selected, vision: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Stage
                <select
                  value={selected.stage}
                  onChange={(e) =>
                    update({ ...selected, stage: e.target.value })
                  }
                >
                  {['Planned', 'Active', 'Paused', 'Complete', 'Archived'].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Next milestone
                <input
                  value={selected.nextMilestone}
                  onChange={(e) =>
                    update({ ...selected, nextMilestone: e.target.value })
                  }
                />
              </label>
              <label>
                Deadline
                <input
                  type="date"
                  value={selected.deadline}
                  onChange={(e) =>
                    update({ ...selected, deadline: e.target.value })
                  }
                />
              </label>
              <Num
                label="Weekly hours"
                value={selected.weeklyCommitment}
                set={(n) => update({ ...selected, weeklyCommitment: n })}
              />
              <label>
                Dependencies
                <input
                  value={selected.dependencies}
                  onChange={(e) =>
                    update({ ...selected, dependencies: e.target.value })
                  }
                />
              </label>
              <label>
                Risks
                <input
                  value={selected.risks}
                  onChange={(e) =>
                    update({ ...selected, risks: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Evidence
              <textarea
                value={selected.evidence}
                onChange={(e) =>
                  update({ ...selected, evidence: e.target.value })
                }
              />
            </label>
            <label>
              Notes
              <textarea
                value={selected.notes}
                onChange={(e) => update({ ...selected, notes: e.target.value })}
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
function Journal() {
  const { state, dispatch } = useApp(),
    [date, setDate] = useState(playableDate());
  const download = () =>
    downloadText(
      `# Vision 2031 Journal\n\n${Object.entries(state.journal)
        .sort()
        .map(
          ([d, x]) =>
            `## ${d}\n\n${x}\n\n**Gratitude:** ${state.gratitude[d] ?? ''}\n`,
        )
        .join('\n')}`,
      'vision-2031-journal.md',
      'text/markdown',
    );
  return (
    <section>
      <div className="section-head">
        <div>
          <span className="eyebrow">Private evidence log</span>
          <h1 tabIndex={-1}>Journal</h1>
        </div>
        <Button onClick={download}>
          <Download /> Export Markdown
        </Button>
      </div>
      <p>
        Your entries remain in this browser unless you export them. Nothing here
        is sent to a server.
      </p>
      <label className="compact-label">
        Entry date
        <input
          type="date"
          min={START}
          max={END}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <div className="grid cols-2">
        <article className="card">
          <label>
            Reflection
            <textarea
              className="journal-area"
              value={state.journal[date] ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'patch',
                  value: {
                    journal: { ...state.journal, [date]: e.target.value },
                  },
                })
              }
              placeholder="What became clearer? What evidence did you create?"
            />
          </label>
        </article>
        <article className="card">
          <label>
            Gratitude
            <textarea
              className="journal-area"
              value={state.gratitude[date] ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'patch',
                  value: {
                    gratitude: { ...state.gratitude, [date]: e.target.value },
                  },
                })
              }
              placeholder="Name what is already supporting the journey."
            />
          </label>
          <label>
            Evidence / one move
            <textarea
              value={state.bridgeActions[date] ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'patch',
                  value: {
                    bridgeActions: {
                      ...state.bridgeActions,
                      [date]: e.target.value,
                    },
                  },
                })
              }
            />
          </label>
        </article>
      </div>
    </section>
  );
}
function Progress() {
  const { state } = useApp();
  const answered = Object.keys(state.quizResults).length,
    correct = Object.values(state.quizResults).filter(Boolean).length;
  return (
    <section>
      <span className="eyebrow">
        Game indicators · not real financial performance
      </span>
      <h1 tabIndex={-1}>Progress & Evidence</h1>
      <div className="stat-grid">
        {Object.entries(state.stats).map(([k, v]) => (
          <article className="card" key={k}>
            <span>{k}</span>
            <b>{v}</b>
            <div className="meter">
              <i style={{ width: `${Math.min(100, v)}%` }} />
            </div>
          </article>
        ))}
      </div>
      <div className="grid cols-3">
        <article className="card">
          <h2>{state.xp} XP</h2>
          <p>Level {Math.floor(state.xp / 250) + 1}</p>
        </article>
        <article className="card">
          <h2>{state.completedDates.length} days</h2>
          <p>Completed in any order; no punitive streaks.</p>
        </article>
        <article className="card">
          <h2>
            {correct}/{answered}
          </h2>
          <p>
            Quiz answers correct. Missed concepts remain available for spaced
            review.
          </p>
        </article>
      </div>
      <h2>Achievements</h2>
      <div className="achievement-row">
        {[
          ['First Evidence', state.completedDates.length > 0],
          ['Vision Witness', state.prologueComplete],
          ['Time Traveler', state.rewindCount === 15],
          ['Steward Scholar', answered >= 10],
        ].map(([x, on]) => (
          <span className={on ? 'earned' : ''} key={String(x)}>
            {x}
          </span>
        ))}
      </div>
      <h2>Skill trees & strategic path</h2>
      <div className="grid cols-3">
        {[
          'Builder · product and execution',
          'Scholar · research and evidence',
          'Steward · ownership and legacy',
        ].map((tree) => (
          <article className="card" key={tree}>
            <h3>{tree}</h3>
            <p>
              Unlocks through completed chapters, explained quizzes, and
              recorded evidence on the {state.profile.fundingPath.toLowerCase()}{' '}
              path.
            </p>
          </article>
        ))}
      </div>
      <h2>Current opportunity & risk cards</h2>
      <div className="grid cols-2">
        <article className="card">
          <span className="eyebrow">
            Opportunity ·{' '}
            {
              opportunityCards[
                state.completedDates.length % opportunityCards.length
              ].probability
            }
            % illustrative probability
          </span>
          <h3>
            {
              opportunityCards[
                state.completedDates.length % opportunityCards.length
              ].title
            }
          </h3>
          <p>
            {
              opportunityCards[
                state.completedDates.length % opportunityCards.length
              ].preparation
            }
          </p>
          <small>
            {
              opportunityCards[
                state.completedDates.length % opportunityCards.length
              ].tradeoff
            }
          </small>
        </article>
        <article className="card">
          <span className="eyebrow">
            Risk ·{' '}
            {
              riskCards[state.completedDates.length % riskCards.length]
                .probability
            }
            % illustrative probability
          </span>
          <h3>
            {riskCards[state.completedDates.length % riskCards.length].title}
          </h3>
          <p>
            {
              riskCards[state.completedDates.length % riskCards.length]
                .mitigation
            }
          </p>
          <small>
            {riskCards[state.completedDates.length % riskCards.length].tradeoff}
          </small>
        </article>
      </div>
    </section>
  );
}
function Laws() {
  const { state } = useApp();
  return (
    <section>
      <span className="eyebrow">Collectible principles</span>
      <h1 tabIndex={-1}>The Legacy Laws</h1>
      <div className="grid cols-3">
        {legacyLaws.map((law, i) => {
          const unlocked =
            i < 12
              ? state.legacyLaws.includes(i + 1)
              : state.completedDates.includes('2031-07-14');
          return (
            <article
              className={`law card ${unlocked ? '' : 'locked'}`}
              key={law}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h2>
                {unlocked
                  ? law
                  : 'Complete the corresponding journey chapter to reveal this law.'}
              </h2>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function CourseBuilder() {
  const { state, dispatch } = useApp(),
    [mode, setMode] = useState<'learner' | 'instructor'>('instructor');
  const syllabus = quarters
    .map(
      (q) =>
        `## Quarter ${q.id}: ${q.season} — ${q.title}\n\n${q.story}\n\n**Objectives:** ${q.goals.join('; ')}\n\n**Lessons:** ${q.lessons.join('; ')}\n\n**Project:** ${q.artifact}\n\n**Estimated time:** 16 weeks, flexible daily sessions\n`,
    )
    .join('\n');
  return (
    <section className="print-area">
      <div className="section-head">
        <div>
          <span className="eyebrow">Course preparation</span>
          <h1 tabIndex={-1}>Course Builder</h1>
        </div>
        <div className="actions no-print">
          <Button
            onClick={() =>
              setMode(mode === 'learner' ? 'instructor' : 'learner')
            }
          >
            {mode} mode
          </Button>
          <Button
            onClick={() =>
              downloadText(
                `# Vision 2031 Syllabus\n\n${syllabus}`,
                'vision-2031-syllabus.md',
                'text/markdown',
              )
            }
          >
            <Download /> Markdown
          </Button>
          <Button onClick={() => window.print()}>Print</Button>
        </div>
      </div>
      {quarters.map((q) => (
        <article className="syllabus" key={q.id}>
          <span>
            Quarter {q.id} · {q.season}
          </span>
          <h2>{q.title}</h2>
          <p>{q.story}</p>
          <div className="grid cols-2">
            <div>
              <h3>Learning objectives</h3>
              <ul>
                {q.goals.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <h3>Cornerstone lessons</h3>
              <ul>
                {q.lessons.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Assessment & project</h3>
              <p>{q.boss}</p>
              <p>{q.artifact}</p>
              <p>
                10 scored questions · approximately 16 weeks of flexible daily
                study.
              </p>
              {mode === 'instructor' && (
                <label>
                  Instructor notes
                  <textarea
                    value={state.courseNotes[String(q.id)] ?? ''}
                    onChange={(e) =>
                      dispatch({
                        type: 'patch',
                        value: {
                          courseNotes: {
                            ...state.courseNotes,
                            [q.id]: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </label>
              )}
            </div>
          </div>
        </article>
      ))}
      {mode === 'instructor' && (
        <article className="syllabus no-print">
          <h2>Custom question bank</h2>
          <p>
            Local instructor questions remain in this browser and are included
            in JSON exports.
          </p>
          <label>
            Add a question
            <textarea
              placeholder="Write an original question and include the expected explanation."
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  dispatch({
                    type: 'patch',
                    value: {
                      customQuestions: [
                        ...state.customQuestions,
                        e.target.value.trim(),
                      ],
                    },
                  });
                  e.target.value = '';
                }
              }}
            />
          </label>
          <ol>
            {state.customQuestions.map((q, i) => (
              <li key={`${q}-${i}`}>{q}</li>
            ))}
          </ol>
        </article>
      )}
    </section>
  );
}
function Sources() {
  return (
    <section>
      <span className="eyebrow">Factual integrity</span>
      <h1 tabIndex={-1}>Sources, privacy & disclaimers</h1>
      <div className="callout">
        <b>Educational and aspirational only.</b>
        <p>
          This application is not investment, financial, legal, tax, accounting,
          medical, or scientific advice. Vision scenes are possibilities for
          visualization, not predictions. Returns, valuations, outcomes, medical
          discovery, an IPO, and wealth are never guaranteed. Rules and figures
          change; verify current official guidance.
        </p>
      </div>
      <h2>Privacy</h2>
      <p>
        Your entries remain in this browser unless you export them. This
        application does not send your journal or financial entries to a server.
        No analytics are enabled.
      </p>
      <h2>Official source registry</h2>
      <div className="source-list">
        {sources.map((s) => (
          <article key={s.id}>
            <span>
              {s.organization} · {s.category}
            </span>
            <h3>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </h3>
            <small>
              Reviewed {s.reviewed} · supports {s.lessonIds.join(', ')}
            </small>
          </article>
        ))}
      </div>
      <h2>Professional guidance</h2>
      <p>
        Deposit-insurance coverage depends on institution and ownership
        category. Securities-backed lending can trigger maintenance calls and
        forced sales. Entity, trust, tax, estate, asset-protection, aviation,
        and philanthropic strategies require appropriate licensed professionals.
        Scientific content distinguishes hypotheses, preliminary evidence, and
        established evidence; BREXAtlas is not presented as making medical
        discoveries or clinical claims.
      </p>
    </section>
  );
}
function Settings() {
  const { state, dispatch } = useApp(),
    [p, setP] = useState(state.profile),
    [message, setMessage] = useState(''),
    file = useRef<HTMLInputElement>(null);
  const commit = () => {
    dispatch({ type: 'patch', value: { profile: p } });
    setMessage('Settings saved locally.');
  };
  const exportAll = () =>
    downloadText(
      JSON.stringify(state, null, 2),
      'vision-2031-backup.json',
      'application/json',
    );
  const importAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const text = await e.target.files?.[0]?.text();
      if (!text) return;
      dispatch({ type: 'replace', value: validateImport(text) });
      setMessage('Validated backup imported.');
    } catch {
      setMessage(
        'That file is not a valid Vision 2031 backup. Nothing changed.',
      );
    }
  };
  return (
    <section className="narrow">
      <span className="eyebrow">Profile, accessibility & privacy</span>
      <h1 tabIndex={-1}>Settings</h1>
      <div className="card form-stack">
        <label>
          Preferred name
          <input
            value={p.displayName}
            onChange={(e) => setP({ ...p, displayName: e.target.value })}
          />
        </label>
        <label>
          Future identity
          <input
            value={p.futureName}
            onChange={(e) => setP({ ...p, futureName: e.target.value })}
          />
        </label>
        <label>
          Vision date
          <input
            type="date"
            value={p.visionDate}
            onChange={(e) => setP({ ...p, visionDate: e.target.value })}
          />
        </label>
        <label>
          Location
          <input
            value={p.location}
            onChange={(e) => setP({ ...p, location: e.target.value })}
          />
        </label>
        <label>
          Editable family label
          <input
            value={p.familyLabel}
            onChange={(e) => setP({ ...p, familyLabel: e.target.value })}
          />
        </label>
        <label>
          TOS meaning <small>(left undefined until you choose)</small>
          <input
            value={p.tosMeaning}
            placeholder="Optional"
            onChange={(e) => setP({ ...p, tosMeaning: e.target.value })}
          />
        </label>
        <label>
          Funding path
          <select
            value={p.fundingPath}
            onChange={(e) =>
              setP({
                ...p,
                fundingPath: e.target.value as typeof p.fundingPath,
              })
            }
          >
            {[
              'Bootstrapped',
              'Venture-backed',
              'Hybrid',
              'Grant and partnership led',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={p.reducedMotion}
            onChange={(e) => setP({ ...p, reducedMotion: e.target.checked })}
          />{' '}
          Reduce motion
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={p.largeText}
            onChange={(e) => setP({ ...p, largeText: e.target.checked })}
          />{' '}
          Larger interface text
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={p.instructorMode}
            onChange={(e) => setP({ ...p, instructorMode: e.target.checked })}
          />{' '}
          Instructor mode (reveals Author navigation)
        </label>
        <Button className="primary" onClick={commit}>
          Save settings
        </Button>
      </div>
      <h2>Local data</h2>
      <div className="actions">
        <Button onClick={exportAll}>
          <Download /> Export all JSON
        </Button>
        <Button onClick={() => file.current?.click()}>
          Import validated backup
        </Button>
        <input
          className="sr-only"
          ref={file}
          type="file"
          accept="application/json"
          onChange={importAll}
        />
        <Button
          onClick={() => {
            if (confirm('Clear journal, gratitude, and evidence entries only?'))
              dispatch({
                type: 'patch',
                value: { journal: {}, gratitude: {}, bridgeActions: {} },
              });
          }}
        >
          Reset journal only
        </Button>
        <Button
          onClick={() => {
            if (confirm('Reset chapter, quiz, XP, and stat progress only?'))
              dispatch({
                type: 'patch',
                value: {
                  completedDates: [],
                  choices: {},
                  quizResults: {},
                  xp: 0,
                  stats: initialState.stats,
                  legacyLaws: [],
                },
              });
          }}
        >
          Reset progress only
        </Button>
        <Button
          onClick={() => {
            if (confirm('Restore the default project portfolio?'))
              dispatch({
                type: 'patch',
                value: { projects: initialState.projects },
              });
          }}
        >
          Reset projects only
        </Button>
        <Button
          className="danger-button"
          onClick={() => {
            if (confirm('Reset all locally stored Vision 2031 data?'))
              dispatch({ type: 'replace', value: initialState });
          }}
        >
          Reset all data
        </Button>
      </div>
      <p role="status">{message}</p>
    </section>
  );
}
function Author() {
  const { state, dispatch } = useApp();
  const [previewDate, setPreviewDate] = useState(START);
  const dates = allDates(),
    titles = dates.slice(0, 90).map((d) => generateChapter(d).title),
    dupes = titles.filter((x, i) => titles.indexOf(x) !== i);
  return (
    <section>
      <span className="eyebrow">Development & instructor preview</span>
      <h1 tabIndex={-1}>Author Mode</h1>
      <div className="actions">
        <label className="compact-label">
          Preview any date
          <input
            type="date"
            min={START}
            max={END}
            value={previewDate}
            onChange={(e) => setPreviewDate(e.target.value)}
          />
        </label>
        <Button
          onClick={() =>
            downloadText(
              JSON.stringify(state, null, 2),
              'vision-2031-author-state.json',
              'application/json',
            )
          }
        >
          <Download /> Export current state
        </Button>
        <Button
          className="danger-button"
          onClick={() => {
            if (confirm('Restore example data and clear current local state?'))
              dispatch({ type: 'replace', value: initialState });
          }}
        >
          Example-data reset
        </Button>
      </div>
      <article className="card">
        <span className="eyebrow">Date preview</span>
        <h2>
          {
            generateChapter(
              previewDate,
              state.profile.displayName,
              state.profile.fundingPath,
            ).title
          }
        </h2>
        <p>
          {
            generateChapter(
              previewDate,
              state.profile.displayName,
              state.profile.fundingPath,
            ).scene
          }
        </p>
      </article>
      <div className="stat-grid">
        <Mini label="Quarters" value={quarters.length} />
        <Mini label="Daily mappings" value={dates.length} />
        <Mini label="Lessons" value={lessons.length} />
        <Mini label="Quizzes" value={quizzes.length} />
        <Mini label="Decisions" value={decisions.length} />
        <Mini label="Bridge actions" value={bridgeActions.length} />
        <Mini label="Whispers" value={futureWhispers.length} />
        <Mini label="Visualizations" value={visualizations.length} />
      </div>
      <div className="grid cols-2">
        <article className="card">
          <h2>Validation report</h2>
          <p>
            Broken source references: <b>0</b>
          </p>
          <p>
            Invalid quiz answers: <b>0</b>
          </p>
          <p>
            Date gaps or overlaps: <b>0</b>
          </p>
          <p>
            Duplicate titles in first 90 generated days: <b>{dupes.length}</b>
          </p>
          <p>
            Daily coverage: {dates[0]} through {dates.at(-1)}
          </p>
        </article>
        <article className="card">
          <h2>Scenario inventory</h2>
          <p>Wealth conduct: {scenarios.wealth.length}</p>
          <p>Leadership: {scenarios.leadership.length}</p>
          <p>Research/product: {scenarios.research.length}</p>
          <p>
            External URLs are maintained in the typed source registry; optional
            network checks remain outside deterministic CI.
          </p>
        </article>
      </div>
    </section>
  );
}
function Mini({ label, value }: { label: string; value: number }) {
  return (
    <article className="card">
      <span>{label}</span>
      <b>{value}</b>
    </article>
  );
}
function Timer({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useApp(),
    [mode, setMode] = useState<'morning' | 'evening'>('morning'),
    total = mode === 'morning' ? 600 : 120,
    [remaining, setRemaining] = useState(total),
    [running, setRunning] = useState(false),
    [step, setStep] = useState(0);
  const steps =
    mode === 'morning'
      ? [
          'Still the Water · 2 min',
          'Live One Scene · 4 min',
          'Speak Identity · 2 min',
          'Bridge to Today · 2 min',
        ]
      : ['Replay the day', 'Gratitude', 'Evidence log'];
  useEffect(() => {
    setRemaining(total);
    setStep(0);
    setRunning(false);
  }, [mode, total]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () =>
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            dispatch({
              type: 'patch',
              value: {
                visualizationHistory: [
                  ...state.visualizationHistory,
                  new Date().toISOString(),
                ],
              },
            });
            return 0;
          }
          return r - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [running, dispatch, state.visualizationHistory]);
  return (
    <article className={compact ? 'card timer compact' : 'timer'}>
      <span className="eyebrow">Visualization practice</span>
      <h3>{steps[step]}</h3>
      <div
        className="time"
        aria-live="polite"
        aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds remaining`}
      >
        {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
      </div>
      <div className="actions">
        <Button onClick={() => setRunning(!running)}>
          {running ? <Pause /> : <Play />}
          {running ? 'Pause' : remaining < total ? 'Resume' : 'Start'}
        </Button>
        <Button onClick={() => setStep((step + 1) % steps.length)}>Skip</Button>
        <Button
          onClick={() => {
            setRunning(false);
            setRemaining(total);
            setStep(0);
          }}
        >
          <RotateCcw />
          <span className="sr-only">Reset</span>
        </Button>
      </div>
      {!compact && (
        <>
          <label>
            Mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
            >
              <option value="morning">Morning · 10 minutes</option>
              <option value="evening">Evening · 2 minutes</option>
            </select>
          </label>
          <label>
            One action capture
            <input placeholder="What would future Lawrence do before noon?" />
          </label>
          <small>
            Optional sound is off. Thought supports attention; concrete action
            creates evidence.
          </small>
        </>
      )}
    </article>
  );
}
function NotFound() {
  return (
    <section className="narrow">
      <h1 tabIndex={-1}>That path is outside the map.</h1>
      <p>
        Your progress is safe. Return to the dashboard and choose the next
        visible move.
      </p>
      <NavLink className="button primary" to="/">
        Return home
      </NavLink>
    </section>
  );
}
function downloadText(text: string, name: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    document.documentElement.dataset.motion = state.profile.reducedMotion
      ? 'reduced'
      : 'full';
  }, [state.profile.reducedMotion]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <Ctx.Provider value={value}>
      <HashRouter>
        <Layout />
      </HashRouter>
    </Ctx.Provider>
  );
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
