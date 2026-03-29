<?php
session_start();
include "db.php";

// Only proceed if form is submitted
if(isset($_POST['submit'])) {
    $user_id = $_SESSION['user_id'];
    $type = 'drug';
    $input_data = json_encode($_POST);

    // Compute $analysis_result here
    // Example placeholder: replace with your actual analysis function
    if(isset($_POST['medications']) && count($_POST['medications']) >= 2) {
        $analysis_result = "Sample result for " . implode(", ", $_POST['medications']);
    }

    // Save to DB only if result exists
    if(isset($analysis_result) && !empty($analysis_result)) {
        $result = json_encode($analysis_result);
        $sql = "INSERT INTO user_history (user_id, type, input_data, result) 
                VALUES ('$user_id', '$type', '$input_data', '$result')";
        $conn->query($sql);
    }
}
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
      <p class="small-text">Enter at least 2 medications to analyze</p>

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
</body>
</html>