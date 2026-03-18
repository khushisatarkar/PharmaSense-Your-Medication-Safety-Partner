async function searchRemedies() {
    let input = document.getElementById("searchInput").value.toLowerCase();

    let url = "homeRemedies.json";  

    let resultDiv = document.getElementById("results");

    if (input === "") {
        resultDiv.innerHTML = "<p>Please enter a health issue</p>";
        return;
    }

    resultDiv.innerHTML = "Loading...";

    try {
        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        let data = await response.json();

        resultDiv.innerHTML = "";

        // ✅ FIX: Use correct key names
        let found = data.filter(item =>
            item["Health Issue"] &&
            item["Health Issue"].toLowerCase().includes(input)
        );

        if (found.length > 0) {
            found.forEach(item => {
                resultDiv.innerHTML += `
                    <div class="card">
                        <h3>${item["Health Issue"]}</h3>
                        <p><b>Item:</b> ${item["Name of Item"] || "General"}</p>
                        <p class="desc">${item["Home Remedy"]}</p>
                    </div>
                `;
            });
        } else {
            resultDiv.innerHTML = "<p>No remedies found</p>";
        }

    }
    catch (error) {
        console.error("ERROR:", error);
        alert(error);   // 👈 add this
        resultDiv.innerHTML = "<p>Error loading data</p>";
    }
}
