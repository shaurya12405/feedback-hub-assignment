const API_BASE = "http://localhost:5000";
let sentimentChart;
let themeChart;
const ALL_THEMES = ["appearance", "comfort", "durability", "fit", "value"];



   //Submit Feedback

async function submitFeedback() {
  const productId = document.getElementById("product").value;
  const rating = document.getElementById("rating").value;
  const review = document.getElementById("review").value;

  if (!rating || !review) {
    alert("Please fill all fields");
    return;
  }

  await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, rating, review })
  });

  document.getElementById("review").value = "";
  document.getElementById("rating").value = "";

  loadDashboard(); // auto refresh
}



   //Load Dashboard Stats

async function loadDashboard() {
  const res = await fetch(`${API_BASE}/stats`);
  const data = await res.json();

  /* ---------- Sentiment Pie Chart ---------- */
  const sentimentData = {
    labels: ["Positive", "Negative"],
    datasets: [{
      data: [
        data.sentiment.positive,
        data.sentiment.negative
      ],
      backgroundColor: ["green", "red"]
    }]
  };

  if (sentimentChart) sentimentChart.destroy();

  sentimentChart = new Chart(
    document.getElementById("sentimentChart"),
    {
      type: "pie",
      data: sentimentData,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  );


  //Theme Bar Chart 

// Always use fixed theme order
const themes = ALL_THEMES;

// Map counts safely (default to 0)
const counts = themes.map(theme => data.themes[theme] || 0);

const themeData = {
  labels: themes,
  datasets: [{
    label: "Theme Frequency",
    data: counts,
    backgroundColor: "blue"
  }]
};

if (themeChart) themeChart.destroy();

themeChart = new Chart(
  document.getElementById("themeChart"),
  {
    type: "bar",
    data: themeData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  }
);
}
async function loadProductThemes() {
  const productId = document.getElementById("themeProduct").value;

  const res = await fetch(`${API_BASE}/theme-stats`);
  const data = await res.json();

  const themes = ALL_THEMES;
  const counts = themes.map(
    theme => (data[productId] ? data[productId][theme] : 0)
  );

  const themeData = {
    labels: themes,
    datasets: [{
      label: `Theme Frequency (${productId})`,
      data: counts,
      backgroundColor: "blue"
    }]
  };

  if (themeChart) themeChart.destroy();

  themeChart = new Chart(
    document.getElementById("themeChart"),
    {
      type: "bar",
      data: themeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    }
  );
}

   //Generate Insights

async function generateInsights() {
  const res = await fetch(`${API_BASE}/insights`);
  const data = await res.json();

  const insightsList = document.getElementById("insights");
  insightsList.innerHTML = "";

  data.insights.forEach(insight => {
    const li = document.createElement("li");
    li.innerText = insight;
    insightsList.appendChild(li);
  });
}

//Load dashboard on page load 
loadDashboard();
loadProductThemes()
