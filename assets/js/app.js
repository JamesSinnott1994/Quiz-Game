/*jshint esversion: 6 */
$(document).ready(function() {

    // Variable declarations
    let topic, difficulty, question, correctAnswer, incorrectAnswers;
    let questionsAnswered = 0, score = 0, noOfCorrectAnswers = 0, time = 30;
    let quizData = [];
    const amountOfQuestions = 10;
    let username = '';
    let anyErrors = false, gameScreenDisplayed = false, timerStopped = true;

    // Generates random string for the User ID:
    // https://gist.github.com/6174/6062387
    let userID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Session storage
    let session = window.sessionStorage;

    // Check if there is a username in the session storage
    if (session.getItem("username") !== null) {

    	// Display prompt for continuing with previously entered name
    	displayPrompt(session);
    }

    /*
    Got help with this timer function from here:
    https://www.w3schools.com/howto/howto_js_countdown.asp
    */

    // Update the count down every 1 second
    let myTimer = setInterval(() => {
        
        // Decrement timer each second
        if (!timerStopped) {
            time -= 1;
            $("#timer").html(`${time}`);
        }

        // Change colour if less than 10
        if (time <= 10) {
            $("#timer-container").css('color', 'red');
        }

        // If the count down is over:
            // Play wrong sound
            // Show correct answer
        if (time <= 0) {
            timerStopped = true;
            time = 30;
            $("#timer").html("0");
            $("#timer-container").css('color', 'black');

            questionsAnswered += 1;
            $("#questions-answered").html(questionsAnswered);

            continueBtnDisabled(false);
            answerBtnsDisabled(true);

            $("#wrong-sound")[0].play();
            $(".correct-answer").css('background-color', 'green');
            $(".correct-answer").css('transition', 'all ease 1s');
        }
    }, 1000);

    // Get array of user objects, if they exist
    let arrayOfUserObjects = JSON.parse(localStorage.getItem("userObjects")) || [];

    // Binds click events to buttons on the user screen for whether or not to use previously entered username
    $("#username-prompt-menu button").each((i, button) => {
        $(button).bind('click', () => {
            // Gets whether or not player wants to use previously entered username in sessions
            let useNameInSession = $(button).val();

            if(useNameInSession === "Yes") {
                username = session.getItem("username");
                goToScreen("topic", "username");
            } else {
                hidePrompt();
            }
        });
    });

    // Binds a click event to the username button
    $("#username-btn").bind('click', () => {

    	username = $('#user-input').val(); // Gets username from input box
        let issue = validateUsername(username);

        // Switch statement
        // Gets rid of nested ifs and elses
        switch(issue) {
            case "No username entered":
                $("#username-error-response").html("Please enter a username.");
                $("#username-error-section").show();
                break;
            default:
                // Save name in session storage
                session.setItem('username', username);
                goToScreen("topic", "username");
        }
    });

    // Binds a keypress event to the page document for entering username
    $(document).on('keypress', e => {

    	username = $('#user-input').val(); // Gets username from input box
        let issue = validateUsername(username);

        if (e.which === 13) {
            // Switch statement
            // Gets rid of nested ifs and elses
            switch(issue) {
                case "No username entered":
                    $("#username-error-response").html("Please enter a username.");
                    $("#username-error-section").show();
                    break;
                default:
                    session.setItem('username', username);
                    goToScreen("topic", "username");
                    $(document).off('keypress'); // Turn off keypress detection
            }
        }
    });

    // Binds a click event to each button on the Topic screen
    $("#topic-section button").each((i, button) => {
        $(button).bind('click', () => {
            // Get topic of button that was clicked
            // Helps us get data from the Quiz API
            topic = $(button).val();

            // Helps us dynamically display the correct topic image
            let imageName = $(button).html().toLowerCase();
            imageName = imageName.replace(/\s/g, "-"); // Join string separated by whitespace with hyphen
            $("#img").attr("src", `assets/img/${imageName}.jpg`);

            goToScreen("difficulty", "topic");
        });
    });

    // Binds a click event to each button on the Difficulty screen
    $("#difficulty-section button").each((i, button) => {
        $(button).bind('click', () => {
            // Get difficulty of button that was clicked
            // Helps us get data from the Quiz API
            difficulty = $(button).html().toLowerCase();

            // Call function to retrieve API Data
            // https://gomakethings.com/promise-based-xhr/
            apiRequest()
                .then(data => {
                    // Checks for any error from the response code of the API data
                    anyErrors = checkForErrors(data.response_code);

                    // If no errors, store the quiz data
                    if (!anyErrors) {
                        for (let i = 0; i < amountOfQuestions; i++) {
                            quizData.push(data.results[i]);
                        }
                        displayQuestion();
                    }
                })
                .catch(error => {
                    console.log('Error with API Data', error);
                });
        });
    });

    // Request the API data
    let apiRequest = () => {
        // Create the XHR request
        let xhr = new XMLHttpRequest();

        // Return it as a Promise
        // Got help with Promises from the following link:
        // https://gomakethings.com/promise-based-xhr/
        return new Promise((resolve, reject) => {
            
            // Setup our listener to process completed requests
            xhr.onreadystatechange = () => {
                // Only run if the request is complete
                if (xhr.readyState !== 4) return;

                // Process the response
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            };

            // Setup our HTTP request
            if (difficulty === "random") {
            	xhr.open("GET", `https://opentdb.com/api.php?amount=${amountOfQuestions}&category=${topic}&type=multiple`, true);
            } else {
                xhr.open("GET", `https://opentdb.com/api.php?amount=${amountOfQuestions}&category=${topic}&difficulty=${difficulty}&type=multiple`, true);
            }

            // Send the request
            xhr.send();
        });
    };

    // Display question
    function displayQuestion() {

    	// Don't display screen again for the next question
        if (!gameScreenDisplayed) {
            hideScreen("difficulty");

            // Show Game screen
            $("#game-screen").attr("hidden", false);
            $("#game-screen").fadeIn(1000);
            $("#game-header").css('display', 'flex');

            gameScreenDisplayed = true;
        }

        timerStopped = false;
        addAnswerButtons();

        // Binds a click event to each answer button on the Game screen
        $("#answer-btn-container button").each((i, button) => {
            $(button).bind('click', () => {

                // Gets answer from the button that was clicked
                let answer = $(button).html();

                // Stop the timer
                timerStopped = true;

                if (answer === correctAnswer) {

                    // Play sound for correct answer
                    // https://medium.com/@ericschwartz7/adding-audio-to-your-app-with-jquery-fa96b99dfa97
                    $("#correct-sound")[0].play();

                    // Animation to fill correct answer button with green
                    $(button).css('background-color', 'green');
                    $(button).css('transition', 'all ease 1s');

                    continueBtnDisabled(false);
                    answerBtnsDisabled(true);

                    // Change game information
                    score += 5;
                    questionsAnswered += 1;
                    noOfCorrectAnswers += 1;
                    $("#score").html(score);
                    $("#questions-answered").html(questionsAnswered);

                    // Smoothly move the focus to the continue button
                    smoothFocus("#continue-btn", 1000);
                } else {
                    // Play sound for wrong answer
                    $("#wrong-sound")[0].play();

                    // Change game information
                    questionsAnswered += 1;
                    $("#questions-answered").html(questionsAnswered);

                    // Animation to fill wrong answer button with red
                    $(button).css('background-color', 'red');
                    $(button).css('transition', 'all ease 1s');

                    // Animation to fill correct answer button with green
                    $(".correct-answer").css('background-color', 'green');
                    $(".correct-answer").css('transition', 'all ease 1s');

                    continueBtnDisabled(false);
                    answerBtnsDisabled(true);

                    // Smoothly move the focus to the continue button
                    smoothFocus("#continue-btn", 1000);
                }
            });
        }); // End of answer button click event function

        question = quizData[0].question;
        incorrectAnswers = quizData[0].incorrect_answers;

        // Generate a random number between 1 and 4 so that the correct answer
        // is randomly placed
        let randomNumber = 1 + Math.floor(Math.random() * 4);

        // Display the question retrieved from the quiz data
        // and place it in the h2 question element
        $("#question").html(question);

        // Places the correct answer in one of the game buttons
        // Adds a class to this button so that it can be accessed later
        $(`#answer-${randomNumber}`).html(quizData[0].correct_answer);
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

    } // End of displayQuestion() function

    // Display the amount of questions in the Heads-Up-Display
    $("#questions-amount").html(amountOfQuestions);

    // Binds click event listener to Continue button
    $("#continue-btn").bind('click', () => {

        // Display next question
        if (quizData.length > 1) {
            quizData.shift(); // Get rid of last displayed question
            time = 30; // Reset timer
            timerStopped = false; // Restart timer
            $("#timer").html(`${time}`);
            $("#timer-container").css('color', 'black');

            // Animation to fade from question to question
            hideScreen("game");
            $("#game-screen").attr("hidden", false);
            $("#game-screen").fadeIn(1000);
            $("#game-header").css('display', 'flex');

            displayQuestion();
            continueBtnDisabled(true);
            answerBtnsDisabled(false);

            // Returns focus to top of screen if at bottom
            smoothFocus("#img", 500);
        } else {

            // Log User score in local storage
            let userObject = {
                "name": username,
                "score": score,
                "difficulty": difficulty,
                "id": userID
            };
            arrayOfUserObjects.push(userObject);
            localStorage.setItem('userObjects', JSON.stringify(arrayOfUserObjects));

            // Updates game over screen data
            $('#username').html(username);
            $('#points').html(score);
            $('#correct-answers').html(noOfCorrectAnswers);
            $('#total-questions').html(amountOfQuestions);
            getLeaderboardPosition(difficulty, userID);

            // Hide Game screen
            hideScreen("game");

            // Display Game Over screen
            $("#game-over-screen").attr("hidden", false);
            $("#game-over-screen").css('display', 'grid');
            $("#game-over-header").show();
        }
    });

    // Binds click event to game header logo (For modal window)
    $('#modal-logo').bind('click', () => {
        // https://www.w3schools.com/howto/howto_css_modals.asp
        timerStopped = true;
        $("#myModal").css('display', 'block');
    });

    // Closes modal when Resume Button is clicked
    $('#modal-resume-btn').bind('click', () => {
        timerStopped = false;
        $("#myModal").css('display', 'none');
    });

    // Click event that displays leaderboard screen
    $('#leaderboard-btn').bind('click', () => {

        displayLeaderboardData(difficulty);

        // Hide Game Over screen
        hideScreen("game-over");

        // Display Game Over screen
        $("#leaderboard-screen").attr("hidden", false);
        $("#leaderboard-screen").css('display', 'grid');
        $("#leaderboard-header").show();
    });

    // Click event that displays Game Over Screen
    $('#game-stats-btn').bind('click', () => {

        // Display Game Over screen
        hideScreen("leaderboard");

        // Show Game Over Screen
        $("#game-over-screen").attr("hidden", false);
        $("#game-over-screen").css('display', 'grid');
        $("#game-over-header").show();

        // Remove all leaderboard data from the leaderboard list element
        // Prevents same data from being appended multiple times in the displayLeaderboardData function
        $("#leaderboard-list").empty();
    });

});

/* ********************** HELPER FUNCTIONS ********************** */

function displayPrompt(session) {
	$("#session-username").html(session.getItem("username"));
    $("#username-section").hide();
    $("#username-prompt-menu").css('display', 'flex');
    $("#username-prompt-section").show();
}

function hidePrompt() {
	$("#username-prompt-menu").hide();
    $("#username-prompt-section").hide();
    $("#username-section").show();
}

function validateUsername(username) {
   
    // Check if username entered
    if(username === '') {
        return "No username entered";
    }
}

function hideScreen(screenName) {
    $(`#${screenName}-screen`).attr("hidden", true);
    $(`#${screenName}-screen`).hide();
    $(`#${screenName}-header`).hide();
}

function goToScreen(newScreen, oldScreen) {
    // Hide old screen
    $(`#${newScreen}-screen`).attr("hidden", true);
    $(`#${oldScreen}-screen`).hide();
    $(`#${oldScreen}-header`).hide();

    // Display new screen
    $(`#${newScreen}-screen`).attr("hidden", false);
    $(`#${newScreen}-screen`).show();
    $(`#${newScreen}-header`).show();
}

function addAnswerButtons() {
        /*
        - Re-creates all answer buttons.

        - The reason why we have to re-create all the buttons is because of an issue relating to the makeBtnHeightSame() function.
        - For some reason when the height of all divs is set intially to the maxHeight of the largest div, it never then sets to the new max height for the divs of the next displayed question. I don't know why this is. But this function deals with the problem, perhaps in an inefficient way.
        */
        $("#answer-btn-container").empty();

        $("#answer-btn-container").append(`
            <div class="col-12 col-md-6 button-wrapper mb-4 mt-md-5">
                <button id="answer-1" class="answer-btn"></button>
            </div>

            <div class="col-12 col-md-6 button-wrapper mb-4 mt-md-5">
                <button id="answer-2" class="answer-btn"></button>
            </div>

            <div class="col-12 col-md-6 button-wrapper mb-4 mt-md-5">
                <button id="answer-3" class="answer-btn"></button>
            </div>

            <div class="col-12 col-md-6 button-wrapper mb-4 mt-md-5">
                <button id="answer-4" class="answer-btn"></button>
            </div>
            `
        );
    }

function makeBtnHeightSame() {
    /*
    This function will make all the div containers of each answer button the same height
    This is to prevent mismatched heights between the buttons if the answer text of one button is very long

    Help for this function from the following source:
    https://css-tricks.com/snippets/jquery/equalize-heights-of-divs/
    */
    let maxHeight = 0;

    $(".answer-btn").each((i, button) => {
        if ($(button).height() > maxHeight) { 
            maxHeight = $(button).height();
        }
    });

    $(".answer-btn").height(maxHeight);
}

function continueBtnDisabled(state) {

    if (state) {
        $("#continue-btn").css('opacity', '0.5');
    } else {
        $("#continue-btn").css('opacity', '1');
    }
    
    $("#continue-btn").attr("disabled", state);
}

function answerBtnsDisabled(state) {
	$("#answer-btn-container button").each((i, button) => $(button).attr("disabled", state));
}

function smoothFocus(element, time) {
    /*
    For help with smoothly focusing on the continue button, I got help from the following source:
    https://css-tricks.com/snippets/jquery/smooth-scrolling/
    */

    let target = $(element);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
            scrollTop: target.offset().top
        }, time, () => {
            // Callback after animation
            // Must change focus!
            let $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
                return false;
            } else {
                $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
            }
        });
    }
}

function getLeaderboardPosition(difficulty, userID) {
   
   // Sort leaderboard data
   let leaderboardSortedData = sortLeaderboardData(difficulty);

    // Calculates user's position
    leaderboardSortedData.forEach((user, position) => {
        if (user.name === $('#username').html() && user.id === userID) {
            $('#position').html(position+1);
            $('#no-of-players').html(leaderboardSortedData.length);
        }
    });
}

function displayLeaderboardData(difficulty) {

    // Leaderboard header difficulty
    // For capitalizing the first letter of the string, got help from below:
    // https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
    $("#difficulty").html(difficulty.replace(/^\w/, (c) => c.toUpperCase()));

    // Empties leaderboard of any data to prevent duplicate data being appended below
    $("tbody").empty();

    // Sort leaderboard data
    let leaderboardSortedData = sortLeaderboardData(difficulty);

    // Show the top 12 names
    while (leaderboardSortedData.length > 12) {
        leaderboardSortedData.pop();
    }

    // Append user data to the leaderboard table for the specific category of difficulty
    leaderboardSortedData.forEach( (user, i) => {
        if (user.difficulty === difficulty) {
            $("tbody").append(
                `<tr>
                    <th>#${i+1}</th>
                    <td>${leaderboardSortedData[i].name}</td>
                    <td>${leaderboardSortedData[i].score}</td>
                </tr>`
            );
        }
    });
}

function sortLeaderboardData(difficulty) {
	// Retrieve names and scores from local storage
    let leaderboardData = JSON.parse(localStorage.getItem("userObjects"));
    let leaderboardSortedData = [];

    // Got help for below with the following link:
    // https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    leaderboardData = leaderboardData.sort((a, b) => (a.score > b.score) && a.difficulty === difficulty ? -1 : 1);

    // Add users whose difficulty matches the difficulty for the current game
    leaderboardData.forEach( (user, i) => {
        if (user.difficulty === difficulty) {
            leaderboardSortedData.push(user);
        }
    });

    return leaderboardSortedData;
}

function checkForErrors(responseCode) {
    /*
    Will return a boolean value:
        - true, if errors exist
        - false, if no errors exist
    */
    if (responseCode === 0) {
        // Code 0: Sucesss
        return false;
    } else if (responseCode === 1) {
        // Code 1: No results
        $("#error-response").html("No results from that particular category");
        $("#error-response-section").show();
        return true;
    } else if (responseCode === 2) {
        // Code 2: Invalid parameter. Contains an invalid parameter. Arguements passed in aren't valid. (Ex. Amount = Five)
        $("#error-response").html("Invalid parameter");
        $("#error-response-section").show();
        return true;
    } else if (responseCode === 3) {
        // Code 3: Token not found. Session Token does not exist.
        $("#error-response").html("Session token not found.");
        $("#error-response-section").show();
        return true;
    } else if (responseCode === 4) {
        // Code 4: Token empty. Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.
        $("#error-response").html("Session token empty");
        $("#error-response-section").show();
        return true;
    } else {
        $("#error-response").html("Unknown Error");
        $("#error-response-section").show();
        return true;
    }
}