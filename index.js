//we are grabbing different parts of the html page
const homeSection = document.getElementById("home");
const formSection = document.getElementById("form");
const PredictionsBox = document.getElementById("Predictions");
// we are grabbing the navigation links
const navHome = document.getElementById("nav-home");
const navTracker = document.getElementById("nav-tracker");
// when the browserr runs the code the home section is the only one that is displayeed
window.addEventListener("DOMContentLoaded", () => {
  homeSection.style.display = "block";
  formSection.style.display = "none";
  predictionsBox.style.display = "none";
});

// Navbar navigation
// when home is clicked only the home page loads and the form and prediction box doesnt load
navHome.addEventListener("click", () => {
  homeSection.style.display = "block";
  formSection.style.display = "none";
  predictionsBox.style.display = "none";
});
// when tracker is clicked only the form and prediction is displayed and the home page is not
navTracker.addEventListener("click", () => {
  homeSection.style.display = "none";
  formSection.style.display = "block";
  predictionsBox.style.display = "block";
  window.scrollTo({ top: formSection.offsetTop, behavior: "smooth" });
});

const form = document.querySelector("#mensesForm");
const predictionsBox = document.querySelector("#Predictions");
const predictionContent = document.querySelector("#prediction-content");

const baseUrl = "http://localhost:3000/periods"; //  JSON server endpoint

// Function to calculate predictions
//new Date is used to create a new date object based on the (lastdate)
function calculateCycle(lastdate, length) {
  const start = new Date(lastdate);
//next period is gotten by start date + the cycle length
  const nextPeriod = new Date(start);
  nextPeriod.setDate(start.getDate() + length);
//fertility period start is gotten by  the length-18 days +last period date
  const fertileStart = new Date(start);
  fertileStart.setDate(start.getDate() + (length - 18));

  const fertileEnd = new Date(start);
  fertileEnd.setDate(start.getDate() + (length - 11));
//ovulation is usually 14 days b4 the next period
  const ovulationDay = new Date(nextPeriod);
  ovulationDay.setDate(nextPeriod.getDate() - 14);

  return {
    NEXTPERIOD: nextPeriod.toISOString().split("T")[0],
    FERTILEWINDOW: `${fertileStart.toISOString().split("T")[0]} - ${
      fertileEnd.toISOString().split("T")[0]
    }`,
    OVULATIONDAY: ovulationDay.toISOString().split("T")[0],
  };
}

// Display predictions for one entry
function displayPrediction(entry) {
  predictionContent.innerHTML = `
    <p><strong>User:</strong> ${entry.USERNAME}</p>
    <p><strong>Last Period:</strong> ${entry.LASTDATE}</p>
    <p><strong>Cycle Length:</strong> ${entry.LENGTH} days</p>
    <p><strong>Next Period:</strong> ${entry.NEXTPERIOD}</p>
    <p><strong>Fertile Window:</strong> ${entry.FERTILEWINDOW}</p>
    <p><strong>Ovulation Day:</strong> ${entry.OVULATIONDAY}</p>
  `;
  predictionsBox.style.display = "block";
}

// Fetch all records from the periods  then picks the last in the returned array
function fetchLatestData() {
  fetch(baseUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data.length > 0) {
        const lastEntry = data[data.length - 1]; // show the latest user’s prediction
        displayPrediction(lastEntry);
      }
    })
    
}

// it first prevents the default form submissionnnn
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.querySelector("#username").value;//rerieve  currrent value of username
  const lastdate = document.querySelector("#lastdate").value;//retrieve current value of lastdate
  const length = parseInt(document.querySelector("#length").value);//retrieve current value for length and converts to integer using parseInt
//simple validation
  if (!username || !lastdate || !length) {
    alert("Please fill in(tafadhali jaza)");
    return;
  }

  // Calculate predictions
  const predictions = calculateCycle(lastdate, length);
//
  const userData = {
    USERNAME: username,
    LASTDATE: lastdate,
    LENGTH: length,
    //spread operator
    ...predictions,
  };

  // Save to JSON server
  //initialise a http request to base url
  fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),//convert userData to a sting and save into my jsonn
  })
  //receiving the response
    .then((res) => res.json())
    .then(() => {
      fetchLatestData(); // display with latest entry
      form.reset();//just clears the input form
    })
    
});

// this loads our predictions on the first page
window.addEventListener("DOMContentLoaded", fetchLatestData);
