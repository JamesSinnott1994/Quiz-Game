$(document).ready(function() {

    // Variable declarations
    let topic;
    let difficulty;
    let filteredQuestions = [];
    let questionsAnswered = 0;
    const amountOfQuestions = 3;
    let question;
    let correctAnswer;
    let incorrectAnswers;
    let score = 0;
    let noOfCorrectAnswers = 0;
    let currentUserID;
    let username = '';
    let time = 30;
    let timerStopped = false;
    let gameScreenDisplayed = false;

    localStorage.clear();

    // Get array of user objects
    let retrievedData = localStorage.getItem("userObjects");
    let arrayOfUserObjects = JSON.parse(retrievedData);

    // If arrayOfUserObjects is null set it to an array
    // Prevents "push" error later on
    if (arrayOfUserObjects == null) {
        arrayOfUserObjects = [];
    }

    // USERNAME SCREEN
    // Click
    $("#username-btn").bind('click', function() {

        username = $('#user-input').val()

        if (username != '') {

            // Hide Username screen
            $("#username-screen").hide();
            $("#username-header").hide();

            // Display Topic screen
            $("#topic-screen").show();
            $("#topic-header").show();
        } else {
            $("#username-error-response").html("Please enter a username.");
            $("#username-error-section").show();
        }
    });

    // Key Press (If User clicks Enter)
    $(document).on('keypress', function(e) {

        username = $('#user-input').val()

        if (e.which == 13) {
            if (username != '') {

                // Hide Username screen
                $("#username-screen").hide();
                $("#username-header").hide();

                // Display Topic screen
                $("#topic-screen").show();
                $("#topic-header").show();

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

    // Binds click event listener to Continue button
    $("#continue-btn").bind('click', function() {
        // Display next question
        if (filteredQuestions.length > 1) {
            $("#answer-btn-container button").css('background-color', '#c0bdae');
            $("#answer-btn-container button").removeClass('correct-answer');
            filteredQuestions.shift();
            time = 30;
            timerStopped = false;
            $("#timer").html(`${time}`);

            $("#game-screen").hide();
            $("#game-header").hide();
            $("#game-screen").fadeIn(1000);
            $("#game-header").css('display', 'flex');

            displayQuestion();
            disableContinueBtn();
            enableAnswerBtns();
        } else {

            // Log User score in local storage
            let userObject = {
                "name": username,
                "score": score
            };
            arrayOfUserObjects.push(userObject);
            localStorage.setItem('userObjects', JSON.stringify(arrayOfUserObjects));

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

    // DISPLAY LEADERBOARD SCREEN
    $('#leaderboard-btn').bind('click', function() {

        displayLeaderboardData();

        $("#game-over-screen").hide();
        $("#game-over-header").hide();

        // Display Game Over screen
        $("#leaderboard-screen").show();
        $("#leaderboard-header").show();
    });

    // DISPLAY GAME OVER (GAME STATS) SCREEN
    $('#game-stats-btn').bind('click', function() {

        // Display Game Over screen
        $("#leaderboard-screen").hide();
        $("#leaderboard-header").hide();

        $("#game-over-screen").show();
        $("#game-over-header").show();
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
            for (let i = 0; i < amountOfQuestions; i++) {
                filteredQuestions.push(data["results"][i]);
            }

            // Once data is filtered display the question
            displayQuestion();
        }
    }

    // DISPLAY QUESTION
    function displayQuestion() {

        if (!gameScreenDisplayed) {
            // Hide Difficulty screen
            $("#difficulty-screen").hide();
            $("#difficulty-header").hide();

            // Show Game screen
            //$("#game-screen").show();
            $("#game-screen").fadeIn(1000);
            $("#game-header").css('display', 'flex');

            gameScreenDisplayed = true;
        }

        timer();

        addButtons();

        // Binds a click event to each button on the Game screen
        $("#answer-btn-container button").each(function() {
            $(this).bind('click', function() {

                let answer = $(this).html();

                timerStopped = true;

                console.log(answer);
                console.log("correctAnswer: " + correctAnswer);

                if (answer == correctAnswer) {
                    // https://medium.com/@ericschwartz7/adding-audio-to-your-app-with-jquery-fa96b99dfa97
                    $("#correct-sound")[0].play();

                    // Display animation
                    $(this).css('background-color', 'green');
                    $(this).css('transition', 'all ease 1s');

                    enableContinueBtn();
                    disableAnswerBtns();

                    score += 5;
                    questionsAnswered += 1;
                    noOfCorrectAnswers += 1;
                    $("#score").html(score);
                    $("#questions-answered").html(questionsAnswered);

                    smoothFocus();
                } else {
                    $("#wrong-sound")[0].play();
                    questionsAnswered += 1;
                    $("#questions-answered").html(questionsAnswered);

                    // Display animation
                    $(this).css('background-color', 'red');
                    $(this).css('transition', 'all ease 1s');

                    $(".correct-answer").css('background-color', 'green');
                    $(".correct-answer").css('transition', 'all ease 1s');

                    enableContinueBtn();
                    disableAnswerBtns();

                    smoothFocus();
                }
            });
        });

        question = filteredQuestions[0]["question"];
        incorrectAnswers = filteredQuestions[0]["incorrect_answers"];

        // Generate a random number between 1 and 4 so that the correct answer
        // is randomly placed
        let randomNumber = 1 + Math.floor(Math.random() * 4);

        $("#question").html(question);

        $(`#answer-${randomNumber}`).html(filteredQuestions[0]["correct_answer"]);
        $(`#answer-${randomNumber}`).addClass("correct-answer");
        correctAnswer = $(`#answer-${randomNumber}`).html();

        for (let i = 0; i < 4; i++) {
            if ( $(`#answer-${i+1}`).hasClass("correct-answer") ) {
                continue;
            } else {
                $(`#answer-${i+1}`).html(incorrectAnswers[0]);
                incorrectAnswers.shift();
            }
        }

        makeBtnHeightSame();
    }

    // TIMER
    function timer() {
        /*
        Got help with this timer function from here:
        https://www.w3schools.com/howto/howto_js_countdown.asp
        */

        // Update the count down every 1 second
        var x = setInterval(function() {
            
        if (!timerStopped) {
            time -= 1;
            $("#timer").html(`${time}`);
        }

        if(timerStopped) {
            clearInterval(x);
        }

        // If the count down is over, write some text 
        if (time <= 0) {
            clearInterval(x);
            $("#timer").html("Expired");

            enableContinueBtn();
            disableAnswerBtns();

            $("#wrong-sound")[0].play();
            $(".correct-answer").css('background-color', 'green');
            $(".correct-answer").css('transition', 'all ease 1s');
        }
        }, 1000);

    }

    function addButtons() {
        /*
        - Re-creates all buttons.

        - The reason why we have to re-create all the buttons is because of an issue relating to the makeBtnHeightSame() function.
        - For some reason when the height of all divs is set intially to the maxHeight of the largest div, it never then sets to the new max height for the divs of the next displayed question. I don't know why this is. But this function deals with the problem, perhaps in an inefficient way.
        */
        $("#answer-btn-container").empty();

        $("#answer-btn-container").append(`
            <div class="col-12 col-md-6 button-container mb-4 mt-md-5">
                <button id="answer-1" class="answer-btn">"Quote"</button>
            </div>

            <div class="col-12 col-md-6 button-container mb-4 mt-md-5">
                <button id="answer-2" class="answer-btn">"Quote"</button>
            </div>

            <div class="col-12 col-md-6 button-container mb-4 mt-md-5">
                <button id="answer-3" class="answer-btn">"Quote"</button>
            </div>

            <div class="col-12 col-md-6 button-container mb-4 mt-md-5">
                <button id="answer-4" class="answer-btn">"Quote"</button>
            </div>
            `
        );
    }

});

function smoothFocus() {
    /*
    For help with smoothly focusing on the continue button, I got help from the following source:
    https://css-tricks.com/snippets/jquery/smooth-scrolling/
    */

    var target = $("#continue-btn");
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
    // Only prevent default if animation is actually gonna happen
    event.preventDefault();
    $('html, body').animate({
        scrollTop: target.offset().top
    }, 1000, function() {
        // Callback after animation
        // Must change focus!
        var $target = $(target);
        $target.focus();
        if ($target.is(":focus")) { // Checking if the target was focused
        return false;
        } else {
        $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
        $target.focus(); // Set focus again
        };
    });
    }

}

function enableContinueBtn() {
    $("#continue-btn").css('opacity', '1');
    $("#continue-btn").attr("disabled", false);
}

function enableAnswerBtns() {
    $("#answer-btn-container button").each(function() {
        $(this).attr("disabled", false);
    });
}

function disableContinueBtn() {
    $("#continue-btn").css('opacity', '0.5');
    $("#continue-btn").attr("disabled", true);
}

function disableAnswerBtns() {
    $("#answer-btn-container button").each(function() {
        $(this).attr("disabled", true);
    });
}

function displayLeaderboardData() {

    let retrievedData = localStorage.getItem("userObjects");
    let leaderboardData = JSON.parse(retrievedData);
    let leaderboardSortedData;

    // Got help for below with the following link
    // https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    if (leaderboardData != null) {
        leaderboardSortedData = leaderboardData.sort((a, b) => (a.score > b.score) ? -1 : 1);
    }

    for (let i = 0; i < leaderboardSortedData.length; i++) {
        $("#leaderboard-list").append(
            `<li>${leaderboardSortedData[i]["name"]}: ${leaderboardSortedData[i]["score"]} points</li>`
        );
    }
}

function makeBtnHeightSame() {
    /*
    This function will make all the div containers of each answer button the same height
    This is to prevent mismatched heights between the buttons if the answer text of one button is very long

    Help for this function from the following source:
    https://css-tricks.com/snippets/jquery/equalize-heights-of-divs/
    */
    let maxHeight = 0;

    $(".answer-btn").each(function() {

        if ($(this).height() > maxHeight) { 
            maxHeight = $(this).height();
        }
    });

    $(".answer-btn").height(maxHeight);
}

function checkForErrors(responseCode) {
    /*
    Will return a boolean value:
        - true, if errors exist
        - false, if no errors exist
    */
    if (responseCode == 0) {
        //console.log("Code 0: SUCCESS. Returned results successfully.");
        return false;
    } else if (responseCode == 1) {
        //console.log("Code 1: NO RESULTS. Could not return results. The API doesn't have enough questions for your query. (Ex. Asking for 50 Questions in a Category that only has 20.)");
        $("#error-response").html("No results from that particular category");
        $("#error-response-section").show();
        return true;
    } else if (responseCode == 2) {
        //console.log("Code 2: INVALID PARAMETER. Contains an invalid parameter. Arguements passed in aren't valid. (Ex. Amount = Five)");
        $("#error-response").html("2");
        $("#error-response-section").show();
        return true;
    } else if (responseCode == 3) {
        //console.log("Code 3: TOKEN NOT FOUND. Session Token does not exist.");
        $("#error-response").html("3");
        $("#error-response-section").show();
        return true;
    } else if (responseCode == 4) {
        //console.log("Code 4: TOKEN EMPTY. Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.");
        $("#error-response").html("4");
        $("#error-response-section").show();
        return true;
    } else {
        //console.log("UNKNOWAN ERROR");
        $("#error-response").html("Unknowan Error");
        $("#error-response-section").show();
        return true;
    }
}