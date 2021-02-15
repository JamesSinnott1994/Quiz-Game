$(document).ready(function() {

    console.log("UP HIGH");

    // Variable declarations
    let topic;
    let difficulty;
    let filteredQuestions = [];
    let questionsAnswered = 0;
    const amountOfQuestions = 1;
    let question;
    let correctAnswer;
    let incorrectAnswers;
    let score = 0;
    let noOfCorrectAnswers = 0;

    //localStorage.clear();
    //console.log(localStorage);

    // USERNAME SCREEN
    // Click
    $("#username-btn").bind('click', function() {

        let username = $('#user-input').val()

        if (username != '') {

            // localStorage.setItem("username", username);
            addNameToStorage(username);

            // Hide Username screen
            $("#username-screen").hide();
            $("#username-header").hide();

            // Display Topic screen
            $("#topic-screen").show();
            $("#topic-header").show();

            console.log(localStorage);
        } else {
            $("#username-error-response").html("Please enter a username.");
            $("#username-error-section").show();
        }
    });

    // Key Press (If User clicks Enter)
    $(document).on('keypress', function(e) {

        let username = $('#user-input').val()

        if (e.which == 13) {
            if (username != '') {

                // localStorage.setItem("username", username);
                addNameToStorage(username);

                // Hide Username screen
                $("#username-screen").hide();
                $("#username-header").hide();

                // Display Topic screen
                $("#topic-screen").show();
                $("#topic-header").show();

                console.log(localStorage);

                $(document).off('keypress');
            } else {
                $("#username-error-response").html("Please enter a username.");
                $("#username-error-section").show();
            }
        }
    });

    // TOPIC SCREEN
    // Binds a click event to each button on the Topic screen
    $("#topic-section button").each(function() {
        $(this).bind('click', function() {

            // Assign topic to button that was clicked on
            topic = $(this).val();
            //alert(`User clicked on ${topic}`);
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
            //alert(`User clicked on ${difficulty}`);

            // Call function to retrieve API Data
            getAPIData(filterAPIData);
        });
    });

    // GAME SCREEN
    $("#questions-amount").html(amountOfQuestions);

    // Binds a click event to each button on the Game screen
    $("#answer-btn-container button").each(function() {
        $(this).bind('click', function() {

            let answer = $(this).html();

            if (answer == correctAnswer) {
                //alert("CORRECT ANSWER!");
                // Display animation
                $(this).css('background-color', 'green');

                enableContinueBtn();

                score += 5;
                questionsAnswered += 1;
                noOfCorrectAnswers += 1;
                $("#score").html(score);
                $("#questions-answered").html(questionsAnswered);
            } else {
                //alert("WRONG ANSWER.")
                // Display animation
                questionsAnswered += 1;
                $("#questions-answered").html(questionsAnswered);
                $(this).css('background-color', 'red');
                $(".correct-answer").css('background-color', 'green');

                enableContinueBtn();
            }
        });
    });

    // Binds click event listener to Continue button
    $("#continue-btn").bind('click', function() {
        // Display next question
        if (filteredQuestions.length > 1) {
            $("#answer-btn-container button").css('background-color', '#c0bdae');
            $("#answer-btn-container button").removeClass('correct-answer');
            filteredQuestions.shift();
            displayQuestion();
            disableContinueBtn();
        } else {

            // For Game Over Screen
            $('#points').html(score);
            $('#correct-answers').html(noOfCorrectAnswers);
            $('#total-questions').html(amountOfQuestions);

            disableContinueBtn();
            //alert("NO MORE QUESTIONS");
            // Game Over!
            // Hide Game screen
            $("#game-screen").hide();
            $("#game-header").hide();

            // Display Game Over screen
            $("#game-over-screen").show();
            $("#game-over-header").show();
        }
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

        // Checks for any error from the response code of the API data
        let anyErrors = checkForErrors(data["response_code"]);

        if (!anyErrors) {
            console.log(data);
            for (let i = 0; i < amountOfQuestions; i++) {
                filteredQuestions.push(data["results"][i]);
            }
            console.log(filteredQuestions);

            // Once data is filtered display the question
            displayQuestion();
        }

    }

    // DISPLAY QUESTION
    function displayQuestion() {

        // Hide Difficulty screen
        $("#difficulty-screen").hide();
        $("#difficulty-header").hide();

        // Show Game screen
        $("#game-screen").show();
        $("#game-header").css('display', 'flex');

    	// $("#question").html(filteredQuestions[0]["question"]);
        console.log(filteredQuestions[0]);
        question = filteredQuestions[0]["question"];
        correctAnswer = filteredQuestions[0]["correct_answer"]
        incorrectAnswers = filteredQuestions[0]["incorrect_answers"];
        console.log(correctAnswer);

        // Generate a random number between 1 and 4 so that the correct answer
        // is randomly placed
        let randomNumber = 1 + Math.floor(Math.random() * 4);

        $("#question").html(question);

        console.log(randomNumber);
        $(`#answer-${randomNumber}`).html(correctAnswer);
        $(`#answer-${randomNumber}`).addClass("correct-answer");

        // incorrectAnswers.forEach( function(item, index) {

        // });

        for (let i = 0; i < 4; i++) {
        	if ( $(`#answer-${i+1}`).hasClass("correct-answer") ) {
        		continue;
        	} else {
        		$(`#answer-${i+1}`).html(incorrectAnswers[0]);
        		incorrectAnswers.shift();
        	}
        }

    }

    console.log("DOWN LOW");

});

function addNameToStorage(username) {
    /*
    - This function helps us to store multiple names in the Storage Object.

    - This will be used for displaying names in the leaderboard.

    - This data is shared across different directories in the same domain, so when you refresh
    the page all the names entered will be persisted in the Storage object.
    */
    let noOfNames = localStorage.length;

    if (noOfNames == 0) {
        localStorage.setItem(`user-${1}-name`, username);
        localStorage.setItem(`user-${1}-score`, 0);
    } else {
        localStorage.setItem(`user-${(noOfNames/2)+1}-name`, username);
        localStorage.setItem(`user-${(noOfNames/2)+1}-score`, 0);
    }
}

function enableContinueBtn() {
    $("#continue-btn").css('opacity', '1');
    $("#continue-btn").attr("disabled", false);
}

function disableContinueBtn() {
    $("#continue-btn").css('opacity', '0.5');
    $("#continue-btn").attr("disabled", true);
}

function checkForErrors(responseCode) {
    /*
    Will return a boolean value:
        - true, if errors exist
        - false, if no errors exist
    */
    if (responseCode == 0) {
        console.log("Code 0: SUCCESS. Returned results successfully.");
        return false;
    } else if (responseCode == 1) {
        console.log("Code 1: NO RESULTS. Could not return results. The API doesn't have enough questions for your query. (Ex. Asking for 50 Questions in a Category that only has 20.)");
        $("#error-response").html("No results from that particular category");
        $("#error-response-section").show();
        return true;
    } else if (responseCode == 2) {
        console.log("Code 2: INVALID PARAMETER. Contains an invalid parameter. Arguements passed in aren't valid. (Ex. Amount = Five)");
        $("#error-response").html("2");
        $("#error-response-section").show();
        return true;
    } else if (responseCode == 3) {
        console.log("Code 3: TOKEN NOT FOUND. Session Token does not exist.");
        $("#error-response").html("3");
        $("#error-response-section").show();
        return true;
    } else if (responseCode == 4) {
        console.log("Code 4: TOKEN EMPTY. Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.");
        $("#error-response").html("4");
        $("#error-response-section").show();
        return true;
    } else {
        console.log("UNKNOWAN ERROR");
        $("#error-response").html("Unknowan Error");
        $("#error-response-section").show();
        return true;
    }
}