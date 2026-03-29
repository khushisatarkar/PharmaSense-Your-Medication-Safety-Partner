let allResults = [];
let currentPage = 1;
const resultsPerPage = 5;

async function searchRemedies() {
  let input = document.getElementById("searchInput").value.toLowerCase();
  let resultDiv = document.getElementById("results");

  resultDiv.innerHTML = "Loading...";

  try {
    let response = await fetch("HomeRemedies.json");
    let data = await response.json();
    allResults = data.filter((item) =>
      item["Health Issue"].toLowerCase().includes(input),
    );
    currentPage = 1;
    displayResults();
  } catch (error) {
    resultDiv.innerHTML = "<p>Error loading data</p>";
  }
}

function displayResults() {
  let resultDiv = document.getElementById("results");
  resultDiv.innerHTML = "";
  let start = (currentPage - 1) * resultsPerPage;
  let end = start + resultsPerPage;
  let paginated = allResults.slice(start, end);
  if (paginated.length === 0) {
    resultDiv.innerHTML = "<p>No remedies found</p>";
    return;
  }

  paginated.forEach((item) => {
    resultDiv.innerHTML += `
            <div class="result-card">
                <h3>${item["Health Issue"]}</h3>
                <p><b>Item:</b> ${item["Name of Item"] || "General"}</p>
                <p>${item["Home Remedy"]}</p>
            </div>
        `;
  });
  renderPagination();
}

function renderPagination() {
  let resultDiv = document.getElementById("results");
  let totalPages = Math.ceil(allResults.length / resultsPerPage);
  resultDiv.innerHTML += `
        <div class="pagination">
            <button class='primary-btn'onclick="prevPage()" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
            <span>Page ${currentPage} of ${totalPages}</span>
            <button class='primary-btn' onclick="nextPage()" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
        </div>
    `;
}

function nextPage() {
  currentPage++;
  displayResults();
}

function prevPage() {
  currentPage--;
  displayResults();
}
