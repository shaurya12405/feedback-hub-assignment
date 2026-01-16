

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();


   //Constants

const ALL_THEMES = ["appearance", "comfort", "durability", "fit", "value"];
const PORT = 5000;


   //Database Setup (SQLite)

const db = new sqlite3.Database("./feedback.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT,
      rating INTEGER,
      review TEXT,
      sentiment TEXT,
      themes TEXT
    )
  `);
});


   //App Setup

const app = express();
app.use(cors());
app.use(express.json());


   //Sentiment Word Lists

const positiveWords = [
  "shiny", "elegant", "premium", "beautiful", "comfortable",
  "light", "smooth", "stylish", "luxurious", "perfect",
  "amazing", "great", "excellent", "well-made", "attractive",
  "classy", "love", "loved", "nice", "pleasant"
];

const negativeWords = [
  "tarnish", "dull", "broke", "heavy", "uncomfortable",
  "fragile", "cheap", "poor", "rough", "bad",
  "disappointing", "loose", "tight", "scratched",
  "unpleasant", "hate", "hated"
];


   //Theme Keywords

const themeKeywords = {
  appearance: [
    "shiny", "dull", "beautiful", "stylish", "elegant",
    "classy", "attractive", "luxurious", "design",
    "polish", "scratched", "smooth", "rough"
  ],
  comfort: [
    "comfortable", "uncomfortable", "light",
    "heavy", "pleasant", "unpleasant", "wearable"
  ],
  durability: [
    "broke", "fragile", "tarnish",
    "well-made", "poor", "excellent", "strong"
  ],
  fit: [
    "fit", "perfect", "loose", "tight", "size"
  ],
  value: [
    "price", "value", "cheap", "premium",
    "worth", "luxurious", "expensive"
  ]
};


   //Utility: Sentiment Analysis

function analyzeSentiment(review) {
  let positiveCount = 0;
  let negativeCount = 0;

  const words = review.toLowerCase().split(/\s+/);

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}


   //Utility: Theme Detection

function detectThemes(review) {
  const detectedThemes = [];
  const text = review.toLowerCase();

  for (let theme in themeKeywords) {
    for (let keyword of themeKeywords[theme]) {
      if (text.includes(keyword)) {
        detectedThemes.push(theme);
        break;
      }
    }
  }

  return detectedThemes;
}


   //API: Submit Feedback

app.post("/feedback", (req, res) => {
  const { productId, rating, review } = req.body;

  if (!productId || !rating || !review) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sentiment = analyzeSentiment(review);
  const themes = detectThemes(review);

  db.run(
    `INSERT INTO feedbacks (productId, rating, review, sentiment, themes)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, rating, review, sentiment, JSON.stringify(themes)],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Feedback submitted successfully",
        data: {
          id: this.lastID,
          productId,
          rating,
          review,
          sentiment,
          themes
        }
      });
    }
  );
});


   //API: Get Feedback by Product

app.get("/feedback/:productId", (req, res) => {
  const productId = req.params.productId;

  db.all(
    "SELECT * FROM feedbacks WHERE productId = ?",
    [productId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const result = rows.map(row => ({
        ...row,
        themes: JSON.parse(row.themes)
      }));

      res.json(result);
    }
  );
});


   //API: Dashboard Stats (Overall)

app.get("/stats", (req, res) => {
  db.all("SELECT sentiment, themes FROM feedbacks", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let positive = 0;
    let negative = 0;

    const themeCounts = {};
    ALL_THEMES.forEach(theme => (themeCounts[theme] = 0));

    rows.forEach(row => {
      if (row.sentiment === "positive") positive++;
      if (row.sentiment === "negative") negative++;

      JSON.parse(row.themes).forEach(theme => {
        themeCounts[theme]++;
      });
    });

    res.json({
      sentiment: { positive, negative },
      themes: themeCounts
    });
  });
});


   //API: Theme Counts Per Product

app.get("/theme-stats", (req, res) => {
  db.all("SELECT productId, themes FROM feedbacks", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const productThemeCounts = {};

    rows.forEach(row => {
      if (!productThemeCounts[row.productId]) {
        productThemeCounts[row.productId] = {};
        ALL_THEMES.forEach(theme => {
          productThemeCounts[row.productId][theme] = 0;
        });
      }

      JSON.parse(row.themes).forEach(theme => {
        productThemeCounts[row.productId][theme]++;
      });
    });

    res.json(productThemeCounts);
  });
});


   //API: Insight Generator

app.get("/insights", (req, res) => {
  db.all("SELECT sentiment, themes FROM feedbacks", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let durabilityIssues = 0;
    let comfortIssues = 0;

    rows.forEach(row => {
      const themes = JSON.parse(row.themes);

      if (themes.includes("durability") && row.sentiment === "negative") {
        durabilityIssues++;
      }
      if (themes.includes("comfort") && row.sentiment === "negative") {
        comfortIssues++;
      }
    });

    const insights = [];

    if (durabilityIssues >= 2) {
      insights.push("Improve product durability");
    }
    if (comfortIssues >= 2) {
      insights.push("Consider lighter and more comfortable designs");
    }
    if (insights.length === 0) {
      insights.push("Overall customer feedback looks good");
    }

    res.json({ insights });
  });
});


   //Start Server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
