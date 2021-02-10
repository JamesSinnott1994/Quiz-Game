$(document).ready(function() {

    console.log("UP HIGH");

    // Variable declarations
    let topic;
    let difficulty;
    let filteredQuestions = [];
    const amountOfQuestions = 10;

    // TOPIC SCREEN
    // Binds a click event to each button on the Topic screen
    $("#topic-section button").each(function() {
        $(this).bind('click', function() {

            // Assign topic to button that was clicked on
            topic = $(this).val();
            alert(`User clicked on ${topic}`);
            // Hide Topic screen
            $("#topic-screen").hide();
             $("#topic-header").hide();

            // Display difficulty screen
            $("#difficulty-screen").show();
             $("#difficulty-header").show();
        });
    });

    // DIFFICULTY SCREEN
    // Binds a click event to each button on the Difficulty screen
    $("#difficulty-section button").each(function() {
        $(this).bind('click', function() {

            // Assign topic to button that was clicked on
            difficulty = $(this).html().toLowerCase();
            alert(`User clicked on ${difficulty}`);

            // Hide Difficulty screen
            $("#difficulty-screen").hide();
            $("#difficulty-header").hide();

            // Show Game screen
            $("#game-screen").show();
            $("#game-header").css('display', 'flex');
            // Call function to retrieve API Data
            // getAPIData(filterAPIData);
        });
    });

    // RETRIEVE QUESTIONS FROM API
    function getAPIData(callback) { // "callback" = "filterAPIData"
        var xhr = new XMLHttpRequest();

        if (difficulty != "random") {
            xhr.open("GET", `https://opentdb.com/api.php?amount=100&category=${topic}&difficulty=${difficulty}&type=multiple`);
        } else {
            xhr.open("GET", `https://opentdb.com/api.php?amount=100&category=${topic}&type=multiple`);
        }
        xhr.send();

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.responseText)); // Line 9
            }
        };
    }

    // FILTER DATA
    function filterAPIData(data) {
        for (let i = 0; i < amountOfQuestions; i++) {
            filteredQuestions.push(data["results"][i]);
        }
        console.log(filteredQuestions);

        // Once data is filtered display the question
        displayQuestion();
    }

    // DISPLAY QUESTION
    function displayQuestion() {
        $("#question").html(filteredQuestions[0]["question"]);
    }

    console.log("DOWN LOW");

});