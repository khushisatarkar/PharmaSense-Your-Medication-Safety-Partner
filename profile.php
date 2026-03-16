<?php
session_start();
include "db.php";

$user_id = $_SESSION['user_id'];

$sql = "SELECT * FROM users WHERE id='$user_id'";
$result = $conn->query($sql);

$user = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Profile | Pharmasense</title>
        <link rel="stylesheet" href="style.css">
        <link
        rel="stylesheet"
        href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
        />
    </head>

    <body class="dashboard-body">
        <header id="header">
            <a href="dashboard.php"><img src="logo.png" class="logo" /></a>

            <div class="dashboard-icons">
                <!-- <i class="far fa-moon"></i> -->
                <!-- <a href="profile.php"> -->
                <!-- <i class="far fa-user"></i> -->
                <!-- </a>         -->
                <i class="fas fa-sign-out-alt"></i>
            </div>
        </header>
        <div class="dashboard-container">
            <h1 class="title">My Profile</h1>
            <div class="profile-header">
                <div class="profile-name">
                    <img src="profile.png" alt="">

                    <div class="profile-text">
                        <h2><?php echo $user['full_name']; ?></h2>
                        <p><?php echo $user['email']; ?></p>
                    </div>
                </div>
            </div>
            
            <div class="profile-grid">
                <div class="profile-card">
                    <h3>Age</h3>
                    <p><?php echo $user['age']; ?></p>
                </div>

                <div class="profile-card">
                    <h3>Gender</h3>
                    <p><?php echo $user['gender']; ?></p>
                </div>

                <div class="profile-card">
                    <h3>Height</h3>
                    <p><?php echo $user['height']; ?> cm</p>
                </div>

                <div class="profile-card">
                    <h3>Weight</h3>
                    <p><?php echo $user['weight']; ?> kg</p>
                </div>

                <div class="profile-card">
                    <h3>Conditions</h3>
                    <p><?php echo $user['conditions']; ?></p>
                </div>

                <div class="profile-card">
                    <h3>Allergies</h3>
                    <p><?php echo $user['allergies']; ?></p>
                </div>
            </div>
        </div>

    </body>
</html>