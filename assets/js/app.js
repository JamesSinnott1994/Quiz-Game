$(document).ready(function() {

    // Variable declarations
    let topic;
    let imageName;
    let difficulty;
    let quizData = [];
    let questionsAnswered = 0;
    const amountOfQuestions = 10;
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

    //localStorage.clear();

    // Get array of user objects
    let retrievedData = localStorage.getItem("userObjects");
    let arrayOfUserObjects = JSON.parse(retrievedData);

    // If arrayOfUserObjects is null set it to an array
    // Prevents "push" error later on
    if (arrayOfUserObjects == null) {
        arrayOfUserObjects = [];
    }

    // Binds a click event to the username button
    $("#username-btn").bind('click', function() {

        let issue = ""; // Used in switch statement
        username = $('#user-input').val()

        // Check if username entered
        if(username == '') {
            issue = "No username entered";
        }

        // Check if username already exists with anonymous function
        let nameExists = false;
        arrayOfUserObjects.forEach(user => {
            if (user["name"] == username) {
                nameExists = true;
            }
        });

        // Error message if username already exists
        if(nameExists && username != '') {
            issue = "Username exists";
        }

        // Switch statement
        // Gets rid of nested ifs and elses
        switch(issue) {
            case "Username exists":
                $("#username-error-response").html("Username already exists. Please enter a new username.");
                $("#username-error-section").show();
                break;
            case "No username entered":
                $("#username-error-response").html("Please enter a username.");
                $("#username-error-section").show();
                break;
            default:
                goToTopicScreen();
        }
    });

    // Binds a keypress event to the document for entering username
    $(document).on('keypress', function(e) {

        let issue = ""; // Used in switch statement
        username = $('#user-input').val()

        // Check if username entered
        if(username == '') {
            issue = "No username entered";
        }

        // Check if username already exists with anonymous function
        let nameExists = false;
        arrayOfUserObjects.forEach(user => {
            if (user["name"] == username) {
                nameExists = true;
            }
        });

        // Error message if username already exists
        if(nameExists && username != '') {
            issue = "Username exists";
        }

        if (e.which == 13) {
            // Switch statement
            // Gets rid of nested ifs and elses
            switch(issue) {
                case "Username exists":
                    $("#username-error-response").html("Username already exists. Please enter a new username.");
                    $("#username-error-section").show();
                    break;
                case "No username entered":
                    $("#username-error-response").html("Please enter a username.");
                    $("#username-error-section").show();
                    break;
                default:
                    goToTopicScreen();
                    $(document).off('keypress'); // Turn off keypress detection
            }
        }
    });

    // Binds a click event to each button on the Topic screen
    $("#topic-section button").each(function() {
        $(this).bind('click', function() {

            // Get topic of button that was clicked
            // Helps us get data from the Quiz API
            topic = $(this).val();

            // Helps us dynamically display the correct topic image
            imageName = $(this).html().toLowerCase();
            imageName = imageName.replace(/\s/g, "-"); // Join string separated by whitespace with hyphen
            $("#img").attr("src", `assets/img/${imageName}.jpg`);

            goToDifficultyScreen();
        });
    });

    // Binds a click event to each button on the Difficulty screen
    $("#difficulty-section button").each(function() {
        $(this).bind('click', function() {

            // Get difficulty of button that was clicked
            // Helps us get data from the Quiz API
            difficulty = $(this).html().toLowerCase();

            // Call function to retrieve API Data
            getAPIData(filterAPIData);
        });
    });

    // Retrieve questions from the API
    function getAPIData(callback) {
        var xhr = new XMLHttpRequest();

        if (difficulty != "random") {
            xhr.open("GET", `https://opentdb.com/api.php?amount=10&category=${topic}&difficulty=${difficulty}&type=multiple`);
        } else {
            xhr.open("GET", `https://opentdb.com/api.php?amount=10&category=${topic}&type=multiple`);
        }
        xhr.send();

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(JSON.parse(this.responseText)); // Sends data to the filterAPIData callback function
            }
        };
    }

    // Filter API Data
    function filterAPIData(data) {

        // Checks for any error from the response code of the API data
        let anyErrors = checkForErrors(data["response_code"]);

        if (!anyErrors) {
            for (let i = 0; i < amountOfQuestions; i++) {
                quizData.push(data["results"][i]); // Store our quiz data
            }

            // Once quiz data is stored display the question
            displayQuestion();
        }
    }

    // Display question
    function displayQuestion() {

        if (!gameScreenDisplayed) {
            // Hide Difficulty screen
            $("#difficulty-screen").hide();
            $("#difficulty-header").hide();

            // Show Game screen
            $("#game-screen").fadeIn(1000);
            $("#game-header").css('display', 'flex');

            gameScreenDisplayed = true;
        }

        timer(); // Start timer
        addAnswerButtons();

        // Binds a click event to each answer button on the Game screen
        $("#answer-btn-container button").each(function() {
            $(this).bind('click', function() {

                // Gets answer from the button that was clicked
                let answer = $(this).html();

                // Stop the timer
                timerStopped = true;

                if (answer == correctAnswer) {

                    // Play sound for correct answer
                    // https://medium.com/@ericschwartz7/adding-audio-to-your-app-with-jquery-fa96b99dfa97
                    $("#correct-sound")[0].play();

                    // Animation to fill correct answer button with green
                    $(this).css('background-color', 'green');
                    $(this).css('transition', 'all ease 1s');

                    enableContinueBtn();
                    disableAnswerBtns();

                    // Change game information
                    score += 5;
                    questionsAnswered += 1;
                    noOfCorrectAnswers += 1;
                    $("#score").html(score);
                    $("#questions-answered").html(questionsAnswered);

                    // Smoothly move the focus to the continue button
                    smoothFocus();
                } else {
                    // Play sound for wrong answer
                    $("#wrong-sound")[0].play();

                    // Change game information
                    questionsAnswered += 1;
                    $("#questions-answered").html(questionsAnswered);

                    // Animation to fill wrong answer button with red
                    $(this).css('background-color', 'red');
                    $(this).css('transition', 'all ease 1s');

                    // Animation to fill correct answer button with green
                    $(".correct-answer").css('background-color', 'green');
                    $(".correct-answer").css('transition', 'all ease 1s');

                    enableContinueBtn();
                    disableAnswerBtns();

                    // Smoothly move the focus to the continue button
                    smoothFocus();
                }
            });
        });

        question = quizData[0]["question"];
        incorrectAnswers = quizData[0]["incorrect_answers"];

        // Generate a random number between 1 and 4 so that the correct answer
        // is randomly placed
        let randomNumber = 1 + Math.floor(Math.random() * 4);

        // Display the question retrieved from the quiz data
        // and place it in the h2 question element
        $("#question").html(question);

        // Places the correct answer in one of the game buttons
        // Adds a class to this button so that it can be accessed later
        $(`#answer-${randomNumber}`).html(quizData[0]["correct_answer"]);
        $(`#answer-${randomNumber}`).addClass("correct-answer");
        correctAnswer = $(`#answer-${randomNumber}`).html(); // Sets text to answerS

        // Places the incorrect answers in the buttons
        for (let i = 0; i < 4; i++) {
            if ( $(`#answer-${i+1}`).hasClass("correct-answer") ) {
                continue; // Skip button that already has correct answer
            } else {
                $(`#answer-${i+1}`).html(incorrectAnswers[0]); // Place first item from this array
                incorrectAnswers.shift(); // Remove first item from this array
            }
        }

        // Make the height of all our answer buttons the same
        makeBtnHeightSame();
    }

    // Display the amount of questions in the Heads-Up-Display
    $("#questions-amount").html(amountOfQuestions);

    // Binds click event listener to Continue button
    $("#continue-btn").bind('click', function() {

        // Display next question
        if (quizData.length > 1) {
            quizData.shift(); // Get rid of last displayed question
            time = 30; // Reset timer
            timerStopped = false; // Restart timer
            $("#timer").html(`${time}`);
            $("#timer-container").css('color', 'black');

            // Animation to fade from question to question
            $("#game-screen").hide();
            $("#game-header").hide();
            $("#game-screen").fadeIn(1000);
            $("#game-header").css('display', 'flex');

            displayQuestion();
            disableContinueBtn();
            enableAnswerBtns();

            // Returns focus to top of screen if at bottom
            smoothFocusOnTop();
        } else {

            // Log User score in local storage
            let userObject = {
                "name": username,
                "score": score
            };
            arrayOfUserObjects.push(userObject);
            localStorage.setItem('userObjects', JSON.stringify(arrayOfUserObjects));

            // Updates game over screen data
            $('#points').html(score);
            $('#correct-answers').html(noOfCorrectAnswers);
            $('#total-questions').html(amountOfQuestions);

            // Hide Game screen
            $("#game-screen").hide();
            $("#game-header").hide();

            // Display Game Over screen
            $("#game-over-screen").show();
            $("#game-over-header").show();
        }
    });

    // Binds click event to game header logo (For modal window)
    $('#modal-logo').bind('click', function() {
        // https://www.w3schools.com/howto/howto_css_modals.asp
        timerStopped = true;
        $("#myModal").css('display', 'block');
    });

    // Closes modal when Resume Button is clicked
    $('#modal-resume-btn').bind('click', function() {

        timerStopped = false;
        timer();// Start timer

        $("#myModal").css('display', 'none');
    });

    // Click event that displays leaderboard screen
    $('#leaderboard-btn').bind('click', function() {

        displayLeaderboardData();

        // Hide Game Over screen
        $("#game-over-screen").hide();
        $("#game-over-header").hide();

        // Display Game Over screen
        $("#leaderboard-screen").show();
        $("#leaderboard-header").show();
    });

    // Click event that displays Game Over Screen
    $('#game-stats-btn').bind('click', function() {

        // Display Game Over screen
        $("#leaderboard-screen").hide();
        $("#leaderboard-header").hide();

        // Show Game Over Screen
        $("#game-over-screen").show();
        $("#game-over-header").show();

        // Remove all leaderboard data from the leaderboard list element
        // Prevents same data from being appended multiple times in the displayLeaderboardData function
        $("#leaderboard-list").empty();
    });

    // Timer
    function timer() {
        /*
        Got help with this timer function from here:
        https://www.w3schools.com/howto/howto_js_countdown.asp
        */

        // Update the count down every 1 second
        var x = setInterval(function() {
            
        // Decrement timer each second
        if (!timerStopped) {
            time -= 1;
            $("#timer").html(`${time}`);
        }

        // Clears timer set
        if(timerStopped) {
            clearInterval(x);
        }

        // Change colour if less than 10
        if (time <= 10) {
            $("#timer-container").css('color', 'red');
        }

        // If the count down is over:
            // Play wrong sound
            // Show correct answer
        if (time <= 0) {
            clearInterval(x);
            $("#timer").html("Expired");
            $("#timer-container").css('color', 'black');

            enableContinueBtn();
            disableAnswerBtns();

            $("#wrong-sound")[0].play();
            $(".correct-answer").css('background-color', 'green');
            $(".correct-answer").css('transition', 'all ease 1s');
        }
        }, 1000);

    }

    function addAnswerButtons() {
        /*
        - Re-creates all answer buttons.

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

/* ********************** HELPER FUNCTIONS ********************** */

function goToTopicScreen() {
    // Hide Username screen
    $("#username-screen").hide();
    $("#username-header").hide();

    // Display Topic screen
    $("#topic-screen").show();
    $("#topic-header").show();
}

function goToDifficultyScreen() {
    // Hide Topic screen
    $("#topic-screen").hide();
    $("#topic-header").hide();

    // Display difficulty screen
    $("#difficulty-screen").show();
    $("#difficulty-header").show();
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

function smoothFocus() {
    /*
    For help with smoothly focusing on the continue button, I got help from the following source:
    https://css-tricks.com/snippets/jquery/smooth-scrolling/
    */

    let target = $("#continue-btn");
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
        let $target = $(target);
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

function smoothFocusOnTop() {
    /*
    For help with smoothly focusing on the continue button, I got help from the following source:
    https://css-tricks.com/snippets/jquery/smooth-scrolling/
    */

    let target = $("#img");
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
    // Only prevent default if animation is actually gonna happen
    event.preventDefault();
    $('html, body').animate({
        scrollTop: target.offset().top
    }, 500, function() {
        // Callback after animation
        // Must change focus!
        let $target = $(target);
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

function displayLeaderboardData() {

    // Retrieve names and scores from local storage
    let retrievedData = localStorage.getItem("userObjects");
    let leaderboardData = JSON.parse(retrievedData);
    let leaderboardSortedData;

    if (leaderboardData != null) {

        // Got help for below with the following link
        // https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
        leaderboardSortedData = leaderboardData.sort((a, b) => (a.score > b.score) ? -1 : 1);

        // Show the top 12 names
        while (leaderboardSortedData.length > 12) {
            leaderboardSortedData.pop();
        }

        // Append user data to the leaderboard table
        for (let i = 0; i < leaderboardSortedData.length; i++) {
            $("tbody").append(
                `<tr>
                    <th>#${i+1}</th>
                    <td>${leaderboardSortedData[i]["name"]}</td>
                    <td>${leaderboardSortedData[i]["score"]}</td>
                </tr>`
            );
        }
    }
}

function checkForErrors(responseCode) {
    /*
    Will return a boolean value:
        - true, if errors exist
        - false, if no errors exist
    */
    console.log(responseCode);
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