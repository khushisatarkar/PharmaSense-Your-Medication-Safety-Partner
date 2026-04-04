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
  <link rel="stylesheet" href="style.css" />
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
      <button class="check-btn primary-btn" onclick="searchRemedies()">Find Remedies</button>
      <div id="results"></div>
    </div>
  </section>

  <script src="homeRemedies.js"></script>

  <link rel="stylesheet" href="chatbot.css">
  <script src="chatbot.js"></script>

  <div id="chatbot-placeholder"></div>

  <script>
  fetch("/chatbot/chatbot.html")
      .then(res => res.text())
      .then(data => {
          document.getElementById("chatbot-placeholder").innerHTML = data;
      });
  </script>

</body>
</html>