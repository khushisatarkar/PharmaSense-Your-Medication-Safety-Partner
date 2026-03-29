<?php
session_start();
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$type = $data['type'] ?? '';
$input_data = json_encode($data['input'] ?? []);
$result = $data['result'];

if ($type && $result) {
    $sql = "INSERT INTO user_history (user_id, type, input_data, result)
            VALUES ('$user_id', '$type', '$input_data', '$result')";

    if ($conn->query($sql)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
?>