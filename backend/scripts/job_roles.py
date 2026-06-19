"""
Shared job role list for all scrapers.
Organised by category so it's easy to add/remove roles.
Each scraper imports this list instead of hardcoding its own.
"""

JOB_ROLES = [
    # ── Engineering — Frontend ─────────────────────────────────────────────
    "Frontend Developer",
    "React Developer",
    "React.js Developer",
    "Next.js Developer",
    "Vue.js Developer",
    "Angular Developer",
    "UI Developer",
    "JavaScript Developer",
    "TypeScript Developer",

    # ── Engineering — Backend ──────────────────────────────────────────────
    "Backend Developer",
    "Backend Engineer",
    "Node.js Developer",
    "Python Developer",
    "Java Developer",
    "Go Developer",
    "Golang Developer",
    "Ruby on Rails Developer",
    "PHP Developer",
    "Django Developer",
    "Spring Boot Developer",
    "FastAPI Developer",

    # ── Engineering — Full Stack ────────────────────────────────────────────
    "Full Stack Developer",
    "Full Stack Engineer",
    "MERN Stack Developer",
    "MEAN Stack Developer",

    # ── Engineering — Mobile ────────────────────────────────────────────────
    "Android Developer",
    "iOS Developer",
    "React Native Developer",
    "Flutter Developer",
    "Mobile Developer",
    "Kotlin Developer",
    "Swift Developer",

    # ── Engineering — General ───────────────────────────────────────────────
    "Software Engineer",
    "Software Developer",
    "SDE",
    "SWE",

    # ── Data & AI/ML ────────────────────────────────────────────────────────
    "Data Scientist",
    "Machine Learning Engineer",
    "ML Engineer",
    "AI Engineer",
    "Data Engineer",
    "Data Analyst",
    "Business Analyst",
    "NLP Engineer",
    "Computer Vision Engineer",
    "Deep Learning Engineer",
    "MLOps Engineer",
    "Generative AI Engineer",
    "LLM Engineer",

    # ── DevOps & Infrastructure ─────────────────────────────────────────────
    "DevOps Engineer",
    "SRE",
    "Site Reliability Engineer",
    "Cloud Engineer",
    "AWS Engineer",
    "Platform Engineer",
    "Infrastructure Engineer",
    "Kubernetes Engineer",
    "Docker Engineer",

    # ── Security ────────────────────────────────────────────────────────────
    "Security Engineer",
    "Cybersecurity Engineer",
    "Application Security Engineer",
    "Penetration Tester",

    # ── QA & Testing ────────────────────────────────────────────────────────
    "QA Engineer",
    "SDET",
    "Test Automation Engineer",
    "Quality Assurance Engineer",

    # ── Architecture & Leadership ───────────────────────────────────────────
    "Solution Architect",
    "Technical Architect",
    "Engineering Manager",
    "Tech Lead",
    "Staff Engineer",
    "Principal Engineer",

    # ── Product & Design ────────────────────────────────────────────────────
    "Product Manager",
    "Technical Product Manager",
    "UX Designer",
    "UI/UX Designer",
    "Product Designer",

    # ── Database ────────────────────────────────────────────────────────────
    "Database Administrator",
    "DBA",
    "MongoDB Developer",

    # ── Emerging / Niche ────────────────────────────────────────────────────
    "Blockchain Developer",
    "Web3 Developer",
    "Embedded Systems Engineer",
    "Game Developer",
    "AR/VR Developer",

    # ── Freshers & Interns ──────────────────────────────────────────────────
    "Software Engineer Fresher",
    "Software Developer Intern",
    "Data Science Intern",
    "Frontend Intern",
    "Backend Intern",
    "DevOps Intern",
]

# ── Deduplicate while preserving order ────────────────────────────────────────
seen = set()
JOB_ROLES = [r for r in JOB_ROLES if not (r.lower() in seen or seen.add(r.lower()))]
