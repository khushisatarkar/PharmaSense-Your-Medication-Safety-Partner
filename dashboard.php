<?php
session_start();
include "db.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$id = $_SESSION['user_id'];

// get user info
$sql = "SELECT * FROM users WHERE id='$id'";
$result = $conn->query($sql);

$user = $result->fetch_assoc();

$name = $user['full_name'];
$age = $user['age'];
$conditions = $user['conditions'];
$allergies = $user['allergies'];

$conditionCount = 0;
if (!empty($conditions)) {
    $conditionArray = array_filter(explode(",", $conditions));
    $conditionCount = count($conditionArray);
}

$allergiesCount = 0;
if (!empty($allergies)) {
    $allergiesArray = array_filter(explode(",", $allergies));
    $allergiesCount = count($allergiesArray);
}

// reports to be implemented 
// $reportCount = 0;

// total saved reports count for dashboard stat cards
$sqlReports = "SELECT COUNT(*) as total FROM user_history WHERE user_id='$id'";
$resultReports = $conn->query($sqlReports);
$reportCount = $resultReports->fetch_assoc()['total'];

$sqlHistory = "SELECT * FROM user_history 
               WHERE user_id='$id' 
               ORDER BY created_at DESC 
               LIMIT 10";

$historyResult = $conn->query($sqlHistory);

$history = [];
while($row = $historyResult->fetch_assoc()) {
    $history[] = $row;
}

?>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Dashboard | Pharmasense</title>

    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="chatbot.css">

    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
    />
  </head>

  <body>
    <header id="header">
      <a href="dashboard.php"><img src="logo.png" class="logo" /></a>

      <div class="dashboard-icons">
        <a href="profile.php">
          <i class="far fa-user"></i>
        </a>        
        <i class="fas fa-sign-out-alt"></i>
      </div>
    </header>

    <section id="dashboard" class="section-p1"> 
      <h1>Welcome, <?php echo $name; ?></h1>      
      <p class="dashboard-sub">
        Your health dashboard and medication management
      </p>

      <div class="stats">
        <div class="stat-card" onclick="window.location.href = 'profile.php'">
          <p>Age</p>
          <h2><?php echo $age; ?></h2>
        </div>

        <div class="stat-card" onclick="window.location.href = 'profile.php'">
          <p>Conditions</p>
          <h2><?php echo $conditionCount; ?></h2>
        </div>

        <div class="stat-card" onclick="window.location.href = 'profile.php'">
          <p>Allergies</p>
          <h2><?php echo $allergiesCount; ?></h2>
        </div>

        <div class="stat-card" onclick="window.location.href = 'profile.php'">
          <p>Reports</p>
          <h2><?php echo $reportCount; ?></h2>
        </div>
      </div>

      <h2 class="quick-title">Quick Actions</h2>

      <div class="actions">
        <!-- <div class="action-card"  onclick="window.location.href = 'medication_checker.php'">
          <i class="fas fa-capsules green"></i>
          <h3>Medication Checker</h3>
          <p>Analyze ingredients and effects</p>
        </div> -->

        <div class="action-card" onclick="window.location.href = 'drug.php'">
          <i class="fas fa-shield-alt orange"></i>
          <div class="action-text">
            <h3>Drug Compatibility</h3>
            <p>Check drug interactions</p>
          </div>
          
        </div>

        <div class="action-card" onclick="window.location.href = 'safety.php'">
          <i class="fas fa-heartbeat green"></i>
          <div class="action-text">
            <h3>Safety Analysis</h3>
            <p>Personalized safety check</p>
          </div>
        </div>

        <div class="action-card" onclick="window.location.href = 'homeremedies.php'">
          <i class="fas fa-home orange"></i>
          <div class="action-text">
            <h3>Home Remedies</h3>
            <p>Natural remedy suggestions</p>
          </div>
        </div>
      </div>

      <h2 class="quick-title history">Your Recent Activities</h2>
      <div class="history">
          <?php if(!empty($history)) {
              foreach($history as $h) { 
                  $typeIcon = $h['type'] == 'drug' ? 'fas fa-shield-alt orange' : ($h['type'] == 'safety' ? 'fas fa-heartbeat green' : 'fas fa-home orange');
                  $typeName = ucfirst($h['type']);
                  $resultText = htmlspecialchars($h['result']); // display safe
                  $input = json_decode($h['input_data'], true);

                  $label = "";
                  if ($h['type'] == 'safety' && isset($input['medicine'])) {
                      $label = ucfirst($input['medicine']);
                  }
                  else if ($h['type'] == 'drug' && is_array($input)) {
                      $label = implode(", ", $input);
                  }
                  else {
                      $label = "N/A";
                  }
          ?>
              <div class="history-card">
                  <i class="<?php echo $typeIcon; ?>"></i>
                  <div class="history-info">
                      <h3><?php echo $typeName; ?></h3>
                      <p style="display:flex; justify-content:space-between; align-items:center;">
                          <span><b><?php echo htmlspecialchars($label); ?></b></span>
                          <span style="color: <?php echo (strpos($h['result'], 'Safe') !== false && strpos($h['result'], 'Not') === false) ? 'green' : 'red'; ?>">
                              <?php echo htmlspecialchars($h['result']); ?>
                          </span>
                      </p>
                      <small><?php echo date('d M Y, H:i', strtotime($h['created_at'])); ?></small>
                  </div>
              </div>
          <?php } } else { ?>
              <p>No history yet.</p>
          <?php } ?>
      </div>
    </section>  
  <div id="chatbot-placeholder"></div>

  <script>
  const USER_ID = <?php echo $_SESSION['user_id']; ?>;

  fetch("chatbot.html")
      .then(res => res.text())
      .then(data => {
          document.getElementById("chatbot-placeholder").innerHTML = data;
      });
  </script>

  <script src="chatbot.js"></script>

  <?php include "footer.php"; ?>
  
  </body>
</html>
