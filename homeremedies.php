<?php
session_start();
include "db.php";

// Only save history if search is performed
if(isset($_POST['submit'])) {
    $user_id = $_SESSION['user_id'];
    $type = 'home';
    $input_data = json_encode($_POST);

    if(!empty($_POST['health_issue'])) {
        $analysis_result = "Remedies result for " . $_POST['health_issue'];
    }

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
  <title>Home Remedies | Pharmasense</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" />
  <style>
    /* Styles for results/cards same as before */
    #results { margin-top: 20px; display:flex; flex-direction:column; gap:20px; }
    .result-card { background:#fff; padding:20px; border-radius:12px; border:1px solid #e6e6e6; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
    .result-card h3 { font-size:18px; margin-bottom:8px; color:#1a9c8b; }
    .result-card p { font-size:14px; color:#555; line-height:1.6; }
  </style>
</head>
<body>
  <header class="sub-header">
    <a href="dashboard.php" class="back"><i class="fas fa-arrow-left"></i></a>
    <h2><i class="fas fa-home orange"></i> Home Remedies</h2>
  </header>

  <section id="drug-check">
    <h1>Quick Home Remedies</h1>
    <p class="subtitle">Discover safe and traditional remedies for common health issues.</p>

    <div class="drug-box">
      <h3>Search</h3>
      <div class="drug-input">
        <input type="text" id="searchInput" placeholder="Enter health issue (e.g. cold, headache)" />
      </div>
      <button class="check-btn" onclick="searchRemedies()">Find Remedies</button>
      <div id="results"></div>
    </div>
  </section>

  <script src="homeRemedies.js"></script>
</body>
</html>