
# Life‑Guard Sentinel 🚨

**מערכת AI ו‑Big Data עירונית למניעת שכחת ילדים ברכב**

---

## 📜 החזון

Life‑Guard Sentinel היא מערכת מבוזרת הבנויה כחלק מהחזון לעיר חכמה:

ניהול אלפי רכבים בזמן אמת, חיזוי טמפרטורה מסוכנת בתוך הרכב, והפעלת תגובה אוטומטית להצלת חיים – לפני שמתרחש אסון.

---

## ⚙️ ארכיטקטורה

המערכת מבוססת על **Microservices ב‑Docker** ומתקשרת דרך  **Apache Kafka** .

היא משלבת ניתוח זרמי נתונים (Stream Processing), חיזוי AI, ומנגנון התרעות אוטומטי.

**Services Overview:**

| Service                         | Description                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Simulator**             | מייצר 1,000 רכבים וירטואליים השולחים טלמטריה ל‑Kafka (משקל, טמפ’, מיקום, מרחק מהורה). |
| **Enrichment**            | משלב נתוני מזג אוויר ותנועה בזמן אמת ומעשיר כל הודעה לפני עיבוד.                            |
| **Processing (AI Brain)** | מבצע ניתוח חלונות זמן, חיזוי AI, וקבלת החלטות (סיכון נמוך/גבוה/קריטי).                      |
| **Alert Service**         | שולח התראות דרך SMS, שיחות קוליות ו‑Push Notifications.                                                               |
| **API Service (FastAPI)** | מספק ממשק REST לנתוני רכבים והתראות.                                                                                  |
| **Dashboard (Streamlit)** | מציג מפה חיה של העיר ומדדי סיכון בזמן אמת.                                                                     |

---

## 🔄 Data Flow (Pipeline)

1. **telemetry.raw** – נתוני חיישנים ראשוניים נשלחים מהרכב.
2. **telemetry.enriched** – נתונים מועשרים ממזג אוויר ותנועה.
3. **Processing** – ניתוח חלונות, חיזוי AI ועדכון מצב ב‑Redis.
4. **Decision Layer**
   * 🟢 סיכון נמוך: תזכורת להורה
   * 🟡 סיכון גבוה: שליחת פקודה לרכב להפעיל מזגן/חלונות
   * 🔴 סיכון קריטי: הזנקת כוחות חירום דרך alerts.emergency

---

## 🧠 טכנולוגיות מרכזיות

* **FastAPI** – REST API ו‑ML Model Serving
* **Apache Kafka** – תקשורת אמינה בין שירותים (Zero Data Loss)
* **Redis** – ניהול מצב הרכבים (Digital Twin)
* **Docker Compose** – הפרדת שירותים והרצה מקומית קלה
* **Streamlit** – דאשבורד אינטראקטיבי להצגת נתונים חיים
* **Pandas / Scikit‑learn / TensorFlow** – לחיזוי טמפרטורה מסוכנת

---

## 🗂️ מבנה הפרויקט

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper bg-subtle text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden border-subtlest ring-subtlest divide-subtlest bg-base rounded-full"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtle"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-quiet hover:bg-quiet text-quiet hover:text-foreground font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-quiet py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>life-guard-sentinel/
</span></span><span>├── docker-compose.yml
</span><span>├── shared/
</span><span>│   ├── kafka/, redis/, models/, utils/
</span><span>│   └── config/settings.py
</span><span>├── services/
</span><span>│   ├── simulator_service/
</span><span>│   ├── enrichment_service/
</span><span>│   ├── processing_service/
</span><span>│   ├── alert_service/
</span><span>│   ├── api_service/
</span><span>│   └── dashboard_service/
</span><span>├── infrastructure/
</span><span>│   ├── kafka/, redis/, monitoring/
</span><span>└── scripts/
</span><span>    ├── create_topics.py
</span><span>    └── seed_data.py
</span><span></span></code></span></div></div></div></pre>

---

## 🚀 הפעלה מקומית

1. ודא שמותקן Docker + Docker Compose
2. הפעל:
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper bg-subtle text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden border-subtlest ring-subtlest divide-subtlest bg-base rounded-full"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtle"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-quiet hover:bg-quiet text-quiet hover:text-foreground font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-quiet py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">bash</div></div><div><span><code><span><span class="token token">docker-compose</span><span> up --build
   </span></span><span></span></code></span></div></div></div></pre>
3. גש לדשבורד:
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper bg-subtle text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden border-subtlest ring-subtlest divide-subtlest bg-base rounded-full"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtle"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-quiet hover:bg-quiet text-quiet hover:text-foreground font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-quiet py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>http://localhost:8501
   </span></span><span></span></code></span></div></div></div></pre>
4. ממשק ה‑API:
   <pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper bg-subtle text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden border-subtlest ring-subtlest divide-subtlest bg-base rounded-full"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtle"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-quiet hover:bg-quiet text-quiet hover:text-foreground font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-quiet py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>http://localhost:8000/docs
   </span></span><span></span></code></span></div></div></div></pre>

---

## 👥 צוות הפיתוח

| Role                            | Responsibility                                          |
| ------------------------------- | ------------------------------------------------------- |
| **Data Engineer**        | Kafka, Docker, סימולטור והעשרה.           |
| **Data Scientist**       | מודל חיזוי טמפרטורה + API ML.         |
| **Backend / Fullstack** | עיבוד לוגיקה, דאשבורד והתראות. |

---

## 🧩 הערך הטכנולוגי

* **Predictive AI** – מניעת סכנה *לפני* שהיא מתרחשת.
* **Big Data Scalability** – אלפי אירועים בשנייה.
* **Data Fusion** – שילוב בין מידע חי מהעולם לנתוני IoT.
* **Reliability** – Kafka + Redis = Zero Data Loss.
* **Closed Loop Automation** – שליטה אוטומטית במערכות הרכב.

---

> **Life‑Guard Sentinel** – כי הצלת חיים לא יכולה לחכות.
