# Feedback Hub – GIVA Internship Assignment

This project is a simple feedback analysis system.

Users can submit product feedback, and the system analyzes sentiment, detects themes, and shows insights on a dashboard.

---

## Features

### Backend
- REST APIs built using Node.js and Express
- Rule-based sentiment analysis (positive / negative)
- Theme detection using keyword matching
- Themes include:
  - Appearance
  - Comfort
  - Durability
  - Fit
  - Value
- Feedback stored using SQLite (persistent storage)
- Theme counts calculated overall and per product
- Simple insight generation based on negative feedback patterns

### Frontend
- Built using HTML, CSS, and vanilla JavaScript
- Feedback submission form
- Dashboard with:
  - Sentiment pie chart
  - Theme frequency bar chart
- Product-wise theme visualization using dropdown
- Charts implemented using Chart.js
- Dashboard updates automatically after feedback submission

---

## Project Structure

feedback-hub-assignment/
├── backend/
│ ├── index.js
│ ├── package.json
│
├── frontend/
│ ├── index.html
│ ├── style.css
│ └── script.js
│
└── README.md


---

## How to Run the Project

### 1. Backend Setup

```bash
cd backend
npm install
node index.js


The backend runs on:

http://localhost:5000

2. Frontend Setup

Open the frontend folder

Open index.html in browser
(or use Live Server in VS Code)

APIs Used

POST /feedback – submit feedback

GET /stats – overall sentiment and theme counts

GET /theme-stats – theme counts per product

GET /feedback/:productId – feedback for a product

GET /insights – generated business insights

Notes

No machine learning models are used

Sentiment and themes are detected using simple rule-based logic

SQLite is used for simplicity and persistence

Focus was on clarity, correctness, and explainability
