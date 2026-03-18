<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}
?>

<!doctype html>
<html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Medication Checker | Pharmasense</title>

    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet"
        href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"/>
    </head>

    <body>
        <header class="sub-header">
        <a href="dashboard.php" class="back">
            <i class="fas fa-arrow-left"></i>
        </a>

        <h2><i class="fas fa-pills orange"></i> Medication Checker</h2>
        </header>

        <section id="drug-check">
            <h1 class='medcheck-title'>Smart Medicine Analysis</h1>

            <p class="subtitle">
                Check ingredients, side effects & safety based on your profile
            </p>

            <div class="drug-box">
                <h3>Enter Medicine</h3>

                <div class="drug-input">
                    <input type="text" id="medicine" placeholder="Enter medicine name" />
                </div>

                <h3>Dosage</h3>
                <div class="drug-input">
                <select id="dosage">
                    <option value="once">Only today</option>
                    <option value="daily">Daily</option>
                </select>
                <input placeholder="e.g. 500 mg" type="number">
                <h3 class='mg'>mg</h3>
                </div>

                <h3>Age</h3>
                <div class="drug-input">
                    <input type="number" id="age" placeholder="Enter age" />
                </div>

                <h3>Your Allergies</h3>
                <div class="drug-input">
                <input type="text" id="allergyInput" placeholder="Add allergy" />
                <button onclick="addAllergy()">Add</button>
                </div>
                <div id="allergyList"></div>

                <button class="check-btn" onclick="checkMedicine()">
                Analyze Medicine
                </button>

                <div id="results"></div>
            </div>
        </section>

        <script>
            const USER_ID = <?php echo $_SESSION['user_id']; ?>;
        </script>

        <script src="safety.js"></script>

    </body>
</html>