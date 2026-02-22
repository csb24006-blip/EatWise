EatWiseAI

EatWiseAI is a consumer health "co-pilot" application designed to analyze 
food images and provide actionable nutritional insights. Using the Google Gemini API, 
it translates visual data into human-readable health advice, safety assessments, and 
recipe recommendations.

Live Demo: https://nilavvv.github.io/EatWise/

Features

>>AI Food Analysis: Instantly identifies food items and assesses freshness.

>>Health Scoring: Calculates a health score (0-10) based on nutritional value and risk factors.

>>Visual Breakdown: Estimates calories and macronutrients (Protein, Carbs, Fats) from images.

>>Safety Checks: Highlights potential allergens and food safety risks.

>>Recipe Generator: Creates healthy recipes based on the identified dish.

>>Custom API Key Support: Users can input their own Gemini API key via the settings menu for personal testing.

Tech Stack

Frontend: React (Vite)

Styling: Tailwind CSS                                


AI Model: Google Gemini 2.5 Flash

Icons: Lucide React

Deployment: GitHub Actions / GitHub Pages

Getting Started

Follow these instructions to set up the project locally on your machine.

Prerequisites

Node.js (Version 18 or higher)

npm (Node Package Manager)

Installation

Clone the repository

git clone [https://github.com/NilavvV/EatWise.git](https://github.com/NilavvV/EatWise.git)
cd EatWise


Install dependencies

npm install


Configure Environment Variables

Locate the file named .env.example in the root directory.

Rename it to .env.

Open the file and add your Google Gemini API key:

VITE_GEMINI_API_KEY=your_api_key_here


Run the application

npm run dev


Open your browser to the local URL provided (usually http://localhost:5173).

Usage Guide

Scan: Upload an image from your gallery or use the live camera to scan food.

Analyze: The AI will generate a health report, including a confidence score and nutritional breakdown.

Cook: Click "Generate Recipe" to get a step-by-step guide for a healthy version of the dish.

Settings: Use the "Configure API Key" button at the bottom of the screen to use a custom API key directly in the browser.

Deployment

This project is configured to deploy automatically to GitHub Pages using GitHub Actions. Any push to the main branch triggers the build and deployment workflow defined in .github/workflows/deploy.yml.



here is how the interface looks when opened :









<img width="454" height="822" alt="home" src="https://github.com/user-attachments/assets/a9bed1eb-b2f4-416d-be50-b770799281c6" />










when an input is give , the following is obtained as an output








Project created for Hackathon 2026.








