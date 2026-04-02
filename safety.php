<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}
include "db.php";
if(isset($_POST['submit'])) {
    $user_id = $_SESSION['user_id'];
    $type = 'safety';
    $input_data = json_encode($_POST);

    if(!empty($_POST['medicine'])) {
        $analysis_result = "Safety result for " . $_POST['medicine'];
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
  <title>Safety Analysis | Pharmasense</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <header class="sub-header">
    <a href="dashboard.php" class="back"><i class="fas fa-arrow-left"></i></a>
    <h2><i class="fas fa-user-shield orange"></i> Safety Analysis</h2>
  </header>

  <section id="drug-check">
    <h1>Personalized Medicine Safety Check</h1>
    <p class="subtitle">Analyze if a medicine is safe based on your profile</p>

    <div class="drug-box">
      <h3>Enter Details</h3>

      <div class="drug-input" style="display:flex; gap:10px;">
        <input type="text" id="medicine" placeholder="Enter medicine name" />
        <input type="number" id="dosageAmount" placeholder="Dosage (mg)" />
      </div>

      <div class="drug-input row">
        <h3 class="heading">Age</h3>
        <input type="number" id="age" placeholder="Enter age" />
      </div>

      <h3 class="heading">Allergies</h3>
      <div class="drug-input">
        <input type="text" id="allergyInput" placeholder="Add allergy" />
        <button onclick="addAllergy()">Add</button>
      </div>
      <div id="allergyList"></div>

      <h3 class="heading2">Current Medications</h3>
      <div class="drug-input">
        <input type="text" id="medInput" placeholder="Add medication" />
        <button onclick="addMed()">Add</button>
      </div>
      <div id="medList"></div>

      <button class="check-btn" onclick="checkSafety()">Analyze Safety</button>
      <div id="results"></div>
    </div>
  </section>

  <script>const USER_ID = <?php echo $_SESSION['user_id']; ?>;</script>
  <script src="safety.js"></script>
</body>
</html>