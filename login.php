<?php
session_start();
include "db.php";

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE email='$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {

    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['full_name'];   

        header("Location: dashboard.php");
        exit();

    } else {
        echo "Incorrect password";
    }

} else {
    echo "User not found";
}
?>