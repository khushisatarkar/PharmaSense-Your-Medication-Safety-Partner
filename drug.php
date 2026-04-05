<?php
session_start();
include "db.php";
?>

<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Drug Compatibility | Pharmasense</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <header class="sub-header">
    <a href="dashboard.php" class="back"><i class="fas fa-arrow-left"></i></a>
    <h2><i class="fas fa-shield-alt orange"></i> Drug Compatibility</h2>
  </header>

  <section id="drug-check">
    <h1>Check Drug Interactions</h1>
    <p class="subtitle">Analyze compatibility between multiple medications</p>

    <div class="drug-box">
      <h3>Add Medications</h3>
      <p class="small-text subtitle">Enter at least 2 medications to analyze</p>

      <div class="drug-input">
        <input type="text" id="drugInput" placeholder="Enter medication" />
        <button onclick="addDrug()">Add</button>
      </div>

      <div id="drugList"></div>

      <button id="checkBtn" class="check-btn" disabled onclick="checkCompatibility()">Check Compatibility</button>
      <div id="results"></div>
    </div>
  </section>

  <script src="script.js"></script>

  <link rel="stylesheet" href="chatbot.css">
  <script src="chatbot.js"></script>

  <div id="chatbot-placeholder"></div>

  <script>
  fetch("chatbot.html")
      .then(res => res.text())
      .then(data => {
          document.getElementById("chatbot-placeholder").innerHTML = data;
      });
  </script>

</body>
</html>