// Waits for the page to fully load, then runs all of the Javascript.
$(document).ready(function() {
  // Initialize Firebase
  let config = {
    apiKey: "AIzaSyAHIUZ4dASCJfjftBJjZZgrPsovwT82hTg",
    authDomain: "train-scheduler-c14cb.firebaseapp.com",
    databaseURL: "https://train-scheduler-c14cb.firebaseio.com",
    projectId: "train-scheduler-c14cb",
    storageBucket: "train-scheduler-c14cb.appspot.com",
    messagingSenderId: "282448444003"
  };

  firebase.initializeApp(config);

  // Declare database
  let database = firebase.database();

  // An add train button to input new trains
  $("#addTrainBtn").on("click", function(e) {
    // DESIGN NOTE:
    // No intention to stop the form function of 'Submit'. By /not/ doing this, we actually get the page to reload and thus re-initialize all trains already on the page, giving more accurate times and arrival times.
    // If conditional to make sure a blank or incomplete form is not submitted.
    if (
      ($("#tName").val() !== "") &&
      ($("#tDest").val() !== "") && 
      ($("#tFirst").val() !== "") && 
      ($("#tFreq").val() !== "")
      ) {
      // Take input information from the form values
      let tName = $("#tName")
        .val()
        .trim();
      let tDest = $("#tDest")
        .val()
        .trim();
      let tFirst = $("#tFirst")
        .val()
        .trim();
      let tFreq = $("#tFreq")
        .val()
        .trim();

      // Define the form values for the Firebase database
      let newTrain = {
        name: tName,
        destination: tDest,
        start: tFirst,
        frequency: tFreq
      };
      // Push the form values to the Firebase database
      database.ref().push(newTrain);

      // DESIGN NOTE: If we were to reintroduce preventDefault for some reason, we would also need to clear the text fields for the form.
    }
    // Refuses to reload page, and creates error load, which does not allow spammed errors.
    else {
      e.preventDefault();
      $("#error").empty();
      $("#error").append("<p class='error'>Incomplete form submission.</p>")
    }
  });

  // Firebase response function. Once the data is pushed to Firebase from the above click Function, this then tells our page to do something with the new dataset from Firebase.
  database.ref().on("child_added", function(childSnapshot) {
    // Store everything into a variable.
    let tName = childSnapshot.val().name;
    let tDest = childSnapshot.val().destination;
    let tFirst = childSnapshot.val().start;
    let tFreq = childSnapshot.val().frequency;

    // Math handler for the time-til-next
    // Starts by creating a base
    let firstTime = 0,
      // Then formats firstTime, and drops a year to make the math real. Unrealistic variables may break this.
      firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years"),
      // Marks default for what current time is.
      currentTime = moment(),
      // Calculates the difference between the current time and the converted first train time.
      diffTime = currentTime.diff(moment(firstTimeConverted), "minutes"),
      // Uses the difference to determine minutes left over.
      tRemainder = diffTime % tFreq,
      // Uses the math of the frequency, subtracting the remaining minutes from the difference, to figure how many minutes til next train.
      tMinutesTil = tFreq - tRemainder,
      // Adds the remaining minutes til the next train to the current time to predict the next arrival time.
      tNext = currentTime.add(tMinutesTil, "minutes");

    // Appends all unappended train schedules onto the page.
    $("#trainSchedules").append(
      "<tr><td>" +
        tName +
        "</td><td>" +
        tDest +
        "</td><td>" +
        tFreq +
        "</td><td>" +
        moment(tNext).format("HH:mm") +
        "</td><td>" +
        tMinutesTil +
        "</td></tr>"
    );
  });
});
