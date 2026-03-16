<?php
include "db.php";

$full_name = $_POST['full_name'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
$age = $_POST['age'];
$gender = $_POST['gender'];
$height = $_POST['height'];
$weight = $_POST['weight'];
$conditions = $_POST['conditions'];
$allergies = $_POST['allergies'];

$sql = "INSERT INTO users 
(full_name,email,password,age,gender,height,weight,conditions,allergies)
VALUES 
('$full_name','$email','$password','$age','$gender','$height','$weight','$conditions','$allergies')";

if ($conn->query($sql) === TRUE) {
    header("Location: login.html");
} else {
    echo "Error: " . $conn->error;
}

?>