async function searchRemedies() {
    let input = document.getElementById("searchInput").value.toLowerCase();

    let url = "https://raw.https://github.com/khushisatarkar/PharmaSense-Your-Medication-Safety-Partner/blob/main/Home%20Remedies.jsongithubusercontent.com/rahulsharmagithub/home-remedies-dataset/main/remedies.json";

    let resultDiv = document.getElementById("results");
    resultDiv.innerHTML = "Loading...";

    try {
        let response = await fetch(url);
        let data = await response.json();

        resultDiv.innerHTML = "";

        let found = data.filter(item =>
            item.disease.toLowerCase().includes(input) ||
            item.symptoms.some(sym => sym.toLowerCase().includes(input))
        );

        if (found.length > 0) {
            found.forEach(item => {
                item.remedies.forEach(remedy => {
                    resultDiv.innerHTML += `
                        <div class="card">
                            <h3>${remedy.name}</h3>
                            <p><b>Disease:</b> ${item.disease}</p>
                            <p><b>Ingredients:</b> ${remedy.ingredients.join(", ")}</p>
                            <p><b>Steps:</b> ${remedy.steps}</p>
                        </div>
                    `;
                });
            });
        } else {
            resultDiv.innerHTML = "<p>No remedies found</p>";
        }

    } catch (error) {
        resultDiv.innerHTML = "<p>Error loading data</p>";
        console.error(error);
    }
}
function goToRemedies() {
    window.location.href = "homeRemedies.html";
}