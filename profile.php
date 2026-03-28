<?php
session_start();
include "db.php";

$user_id = $_SESSION['user_id'];

$sql = "SELECT * FROM users WHERE id='$user_id'";
$result = $conn->query($sql);

$user = $result->fetch_assoc();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $age = $_POST['age'];
    $gender = $_POST['gender'];
    $height = $_POST['height'];
    $weight = $_POST['weight'];
    $conditions = isset($_POST['conditions']) ? trim($_POST['conditions']) : $user['conditions'];
    if ($conditions === "") {
        $conditions = "";
    }
    $allergies = isset($_POST['allergies']) ? trim($_POST['allergies']) : $user['allergies'];
    if ($allergies === "") {
        $allergies = "";
    }

    $update_sql = "UPDATE users SET 
        age='$age',
        gender='$gender',
        height='$height',
        weight='$weight',
        conditions='$conditions',
        allergies='$allergies'
        WHERE id='$user_id'";

    $conn->query($update_sql);

    // redirect to avoid form resubmission
    header("Location: profile.php");
    exit();
}
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
                <i class="fas fa-sign-out-alt"></i>
            </div>
        </header>
        <div class="dashboard-container">
            <h1 class="title">My Profile</h1>
            <!-- <button class="edit-btn" onclick="toggleEdit()">Edit Profile</button> -->
            <div class="profile-header">
            <div class="profile-name">
                <img src="profile.png" alt="">

                <div class="profile-text">
                    <div class="name-row">
                        <h2><?php echo $user['full_name']; ?></h2>
                        
                        <i class="fas fa-pen edit-icon" onclick="toggleEdit()" title="Edit Profile"></i>
                    </div>
                    
                    <p><?php echo $user['email']; ?></p>
                </div>
            </div>
        </div>
            
            <form method="POST" id="profileForm">
            <div class="profile-grid">
                <div class="profile-card">
                    <h3>Age</h3>
                    <p class="view-mode"><?php echo $user['age']; ?></p>
                    <input class="edit-mode" type="number" name="age" 
                        value="<?php echo $user['age']; ?>" style="display:none;">
                </div>

                <div class="profile-card">
                    <h3>Gender</h3>
                    <p class="view-mode"><?php echo $user['gender']; ?></p>
                    <input class="edit-mode" type="text" name="gender" 
                        value="<?php echo $user['gender']; ?>" style="display:none;">
                </div>

                <div class="profile-card">
                    <h3>Height</h3>
                    <p class="view-mode"><?php echo $user['height']; ?></p>
                    <input class="edit-mode" type="number" name="height" 
                        value="<?php echo $user['height']; ?>" style="display:none;">
                </div>

                <div class="profile-card">
                    <h3>Weight</h3>
                    <p class="view-mode"><?php echo $user['weight']; ?></p>
                    <input class="edit-mode" type="number" name="weight" 
                        value="<?php echo $user['weight']; ?>" style="display:none;">
                </div>

                <div class="profile-card">
                    <h3>Conditions</h3>
                    <p class="view-mode">
                        <?php echo !empty($user['conditions']) ? str_replace(",", ", ", $user['conditions']) : "None"; ?>
                    </p>
                    <div class="edit-mode" style="display:none;">
                        <div class="add-row">
                            <input id="conditionInput" type="text" placeholder="Add condition">
                            <button type="button" onclick="addItem('conditionInput','conditionList','conditions')">Add</button>
                        </div>
                        <div id="conditionList" class="added-list"></div>
                        <input type="hidden" name="conditions" id="conditionsField">
                    </div>
                </div>

                <div class="profile-card">
                    <h3>Allergies</h3>
                    <p class="view-mode">
                        <?php echo !empty($user['allergies']) ? str_replace(",", ", ", $user['allergies']) : "None"; ?>
                    </p>
                    <div class="edit-mode" style="display:none;">
                        <div class="add-row">
                            <input id="allergyInput" type="text" placeholder="Add allergy">
                            <button type="button" onclick="addItem('allergyInput','allergyList','allergies')">Add</button>
                        </div>
                        <div id="allergyList" class="added-list"></div>
                        <input type="hidden" name="allergies" id="allergiesField">
                    </div>
                </div>
            </div>
            <div class='savechanges' style="text-align:center; margin-top:20px;">
                <button type="submit" id="saveBtn" style="display:none;">Save Changes</button>
            </div>
            </form>
        </div>

        <script>
        function toggleEdit() {
            const inputs = document.querySelectorAll(".edit-mode");
            const texts = document.querySelectorAll(".view-mode");
            const saveBtn = document.getElementById("saveBtn");

            inputs.forEach(input => {
                input.style.display = "block";
                input.disabled = false; 
            });

            texts.forEach(text => {
                text.style.display = "none";
            });

            saveBtn.style.display = "block";
        }

        let conditions = [];
        let allergies = [];

        window.onload = function () {
            const existingConditions = "<?php echo $user['conditions']; ?>";
            const existingAllergies = "<?php echo $user['allergies']; ?>";

            if (existingConditions) {
                conditions = existingConditions.split(",");
                conditions.forEach(c => renderItem(c, "conditionList", "conditions"));
            }

            if (existingAllergies) {
                allergies = existingAllergies.split(",");
                allergies.forEach(a => renderItem(a, "allergyList", "allergies"));
            }
        };

        function addItem(inputId, listId, type) {
            const input = document.getElementById(inputId);
            const value = input.value.trim().toLowerCase();

            if (!value) return;

            let listArray = type === "conditions" ? conditions : allergies;

            if (listArray.includes(value)) {
                alert("Already added");
                input.value = "";
                return;
            }

            listArray.push(value);
            renderItem(value, listId, type);
            input.value = "";
        }

        function renderItem(value, listId, type) {
            const list = document.getElementById(listId);

            const itemBox = document.createElement("div");
            itemBox.className = "added-drug";

            itemBox.innerHTML = `
                <span>${value}</span>
                <i class="fas fa-times"></i>
            `;

            itemBox.querySelector("i").onclick = function () {
                itemBox.remove();

                if (type === "conditions") {
                    conditions = conditions.filter(c => c !== value);
                } else {
                    allergies = allergies.filter(a => a !== value);
                }
            };

            list.appendChild(itemBox);
        }

        // before submit
        document.getElementById("profileForm").addEventListener("submit", function () {
            document.getElementById("conditionsField").value = conditions.join(",");
            document.getElementById("allergiesField").value = allergies.join(",");
        });
        </script>
    </body>
</html>