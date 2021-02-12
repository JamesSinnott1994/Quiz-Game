$(document).ready(function() {

    console.log("UP HIGH");

    // Variable declarations
    let topic;
    let difficulty;
    let filteredQuestions = [];
    let questionsAnswered = 0;
    const amountOfQuestions = 2;
    let question;
    let correctAnswer;
    let incorrectAnswers;
    let score = 0;

    // TOPIC SCREEN
    // Binds a click event to each button on the Topic screen
    $("#topic-section button").each(function() {
        $(this).bind('click', function() {

            // Assign topic to button that was clicked on
            topic = $(this).val();
            // alert(`User clicked on ${topic}`);
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
            // alert(`User clicked on ${difficulty}`);

            // Hide Difficulty screen
            $("#difficulty-screen").hide();
            $("#difficulty-header").hide();

            // Show Game screen
            $("#game-screen").show();
            $("#game-header").css('display', 'flex');
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
                alert("CORRECT ANSWER!");
                // Display animation
                $(this).css('background-color', 'green');

                enableContinueBtn();

                score += 5;
                questionsAnswered += 1;
                $("#score").html(score);
                $("#questions-answered").html(questionsAnswered);
            } else {
                alert("WRONG ANSWER.")
                // Display animation
                questionsAnswered += 1;
                $("#questions-answered").html(questionsAnswered);
                $(this).css('background-color', 'red');
                $(".correct-answer").css('background-color', 'green');

                enableContinueBtn();
            }
        });
    });

    //Binds click event listener to Continue button
    $("#continue-btn").each(function() {
        $(this).bind('click', function() {

            // Display next question
            if (filteredQuestions.length > 1) {
                $("#answer-btn-container button").css('background-color', '#c0bdae');
                $("#answer-btn-container button").removeClass('correct-answer');
                filteredQuestions.shift();
                displayQuestion();
                disableContinueBtn();
            } else {
                disableContinueBtn();
                alert("NO MORE QUESTIONS");
                // Game Over!
            }
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

function enableContinueBtn() {
    $("#continue-btn").css('opacity', '1');
    $("#continue-btn").attr("disabled", false);
}

function disableContinueBtn() {
    $("#continue-btn").css('opacity', '0.5');
    $("#continue-btn").attr("disabled", true);
}