FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libreoffice \
    poppler-utils \
    default-jre \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

It should look like this in the editor:
```
┌─────────────────────────────────────────────────┐
│  1  FROM python:3.11-slim                       │
│  2                                              │
│  3  RUN apt-get update && apt-get install -y \  │
│  4      libreoffice \                           │
│  5      poppler-utils \                         │
│  6      default-jre \                           │
│  7      && rm -rf /var/lib/apt/lists/*          │
│  8                                              │
│  9  WORKDIR /app                                │
│ 10  COPY requirements.txt .                     │
│ 11  RUN pip install --no-cache-dir -r           │
│ 12      requirements.txt                        │
│ 13  COPY . .                                    │
│ 14                                              │
│ 15  CMD ["uvicorn", "main:app",                 │
│         "--host", "0.0.0.0", "--port", "8000"]  │
└─────────────────────────────────────────────────┘
```

---

**Step 6 — Save (Commit) the file**

Scroll down to the bottom of the page. You'll see a section called **"Commit new file"**.

- The first box has a pre-filled message like `"Create Dockerfile"` — that's fine, leave it
- Make sure **"Commit directly to the `main` branch"** is selected
- Click the green **"Commit new file"** button

---

**Step 7 — Verify it worked**

You'll be taken back to the `backend/` folder view. You should now see:
```
📁 backend/
 ├── 📄 Dockerfile        ← new file is here ✅
 ├── 📄 main.py
 ├── 📄 requirements.txt
 ├── 📁 routers/
 └── 📁 utils/
