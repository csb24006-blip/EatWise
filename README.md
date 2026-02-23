# 🥗 EatWise AI — Your AI Food Co-Pilot
## Live Link
https://nilavvv.github.io/EatWise/


An AI food co-pilot that doesn't just explain ingredients — it explains decisions.

EatWise AI is an intelligent food analysis application that scans any food item — packaged products, raw ingredients, or fully cooked meals — and delivers a clear, human-readable verdict on whether it's safe and healthy to consume. Built at a hackathon by Team Just a Bot.

# ✨ Features

🔍 Smart Food Scanning

Scan any food — packaged items, raw produce, or cooked meals — via camera or image upload
Ask a question before scanning (e.g. "Is this safe for a diabetic?") and get a context-aware response
Powered by Google Gemini 2.5 Flash with vision-to-text capabilities

📊 Comprehensive Health Analysis

Health Score — A score out of 10 indicating overall healthiness
Freshness & Risk Level — Immediate assessment of whether the food is fresh and safe to eat
Confidence Meter — Transparent display of how confident the AI is in its results; never pretends certainty
Human Insight — Translates complex chemical ingredient names into plain English, explaining real-world effects, safe consumption quantities, and frequency guidelines

⚠️ Safety & Allergy Intelligence

Harmful Content Flagging — Highlights specific ingredients that are dangerous for particular diseases, allergies, or dietary conditions
Adversarial Reasoning — Reasons over uncertain or partial data, explains edge cases, and handles ambiguous scenarios rather than making blind assumptions

🍽️ Actionable Recommendations

Recipe Suggestions — Provides recipes using the scanned food item
Healthier Alternatives — Suggests better food substitutes based on the analysis


# 🛠️ Tech Stack
Layer               |   Technology

Frontend Framework  |  React (v18+) with Vite

Styling             |   TailwindCSS (mobile-first, dynamic theming)

Icons               |   Lucide React

AI / LLM            |   Google Gemini 2.5 Flash API

Camera Access       |   Web MediaDevices API

File Uploads        |   FileReader API

Networking          |   Fetch API with custom Exponential Backoff (handles 429 rate limits)

AI Output           |   Structured JSON Mode (strict schema responses)






































