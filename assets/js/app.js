/*jshint esversion: 6 */
$(document).ready(function() {

    // Variable declarations
    let topic, difficulty, question, correctAnswer, incorrectAnswers;
    let questionsAnswered = 0, score = 0, noOfCorrectAnswers = 0, time = 60, startingTime = 60;
    let times = { "easyTime": 60,  "mediumTime": 30, "hardTime": 20, "randomTime": 35 };
    let quizData = [];
    const amountOfQuestions = 10;
    let username = '';
    let anyErrors = false, gameScreenDisplayed = false, timerStopped = true;

    // Generates random string for the User ID: https://gist.github.com/6174/6062387
    let userID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    let session = window.sessionStorage; // Session storage

    // Check if username in session storage, if so display prompt
    if (session.getItem("username") !== null) displayPrompt(session);

    // Create buttons
    createTopicButtons();
    createDifficultyButtons();

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
        if (time <= 10) $("#timer-container").css('color', 'red');

        // If time elapses, play wrong sound, show correct answer
        if (time <= 0 && !timerStopped) {
            timerStopped = true;
            time = startingTime;
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
                changeScreen("username", "topic");
            }
            hidePrompt();
        });
    });

    // Binds a click event to the username button
    $("#username-btn").bind('click', () => {
    	username = $('#user-input').val(); // Gets username from input box
        validateUsername(username, session);
    });

    // Binds a keypress event to the page document for entering username
    $(document).on('keypress', e => {
        username = $('#user-input').val(); // Gets username from input box
        
        // "e.which === 13" refers to the "Enter" key being pressed
        if (e.which === 13) validateUsername(username, session);
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

            changeScreen("topic", "difficulty");
        });
    });

    // Binds a click event to each button on the Difficulty screen
    $("#difficulty-section button").each((i, button) => {
        $(button).bind('click', () => {
            // Get difficulty of button that was clicked
            // Helps us get data from the Quiz API
            difficulty = $(button).html().toLowerCase();

            // Sets time based on difficulty
            startingTime = times[`${difficulty}Time`];
            time = startingTime;
            $("#timer").html(`${time}`);

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
            let url = `https://opentdb.com/api.php?amount=${amountOfQuestions}&category=${topic}&type=multiple`;
            if (difficulty !== "random") {
                url = `https://opentdb.com/api.php?amount=${amountOfQuestions}&category=${topic}&difficulty=${difficulty}&type=multiple`;
            }
            xhr.open("GET", url, true);

            // Send the request
            xhr.send();
        });
    };

    // Display each question
    function displayQuestion() {

    	// Don't display Game screen again for the next question
        if (!gameScreenDisplayed) {
            changeScreen("difficulty");

            // Show Game screen
            $("#game-screen").attr("hidden", false);
            $("#game-screen").fadeIn(1000);
            $("#game-header").css('display', 'flex');

            gameScreenDisplayed = true;
        }

        timerStopped = false;
        addAnswerButtons();

        // Quiz data to display on Game page
        question = quizData[0].question;
        correctAnswer = quizData[0].correct_answer;
        incorrectAnswers = quizData[0].incorrect_answers; // 3 incorrect answers

        // Generate a random number between 1 and 4 so that the correct answer
        // is randomly placed
        let randomNumber = 1 + Math.floor(Math.random() * 4);

        // Display the question retrieved from the quiz data
        // and place it in the h2 question element
        $("#question").html(question);

        // Places the correct answer in one of the game buttons
        $(`#answer-${randomNumber}`).html(correctAnswer);

        // Places the incorrect answers in the buttons
        for (let i = 1; i <= 4; i++) {
            if ( $(`#answer-${i}`).html() === correctAnswer) {
                continue; // Skip button that already has correct answer
            } else {
                $(`#answer-${i}`).html(incorrectAnswers[0]); // Place first item from this array
                incorrectAnswers.shift(); // Remove first item from this array
            }
        }

        // Make the height of all our answer buttons the same
        makeBtnHeightSame();

        // Binds a click event to each answer button on the Game screen
        $("#answer-btn-container button").each((i, button) => {
            $(button).bind('click', () => {

                let answer = $(button).html(); // Gets answer from the button that was clicked
                timerStopped = true; // Stop the timer

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

    } // End of displayQuestion() function

    // Display the amount of questions in the Heads-Up-Display
    $("#questions-amount").html(amountOfQuestions);

    // Binds click event listener to Continue button
    $("#continue-btn").bind('click', () => {

        // Display next question if more questions exist
        if (quizData.length > 1) {
            quizData.shift(); // Get rid of last displayed question
            time = startingTime; // Reset timer
            timerStopped = false; // Restart timer
            $("#timer").html(`${time}`);
            $("#timer-container").css('color', 'black');

            // Animation to fade from question to question
            changeScreen("game");
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
            changeScreen("game");

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
        changeScreen("game-over");

        // Display Game Over screen
        $("#leaderboard-screen").attr("hidden", false);
        $("#leaderboard-screen").css('display', 'grid');
        $("#leaderboard-header").show();
    });

    // Click event that displays Game Over Screen
    $('#game-stats-btn').bind('click', () => {

        // Display Game Over screen
        changeScreen("leaderboard");

        // Show Game Over Screen
        $("#game-over-screen").attr("hidden", false);
        $("#game-over-screen").css('display', 'grid');
        $("#game-over-header").show();
    });

});

/* ********************** HELPER FUNCTIONS ********************** */

function createTopicButtons() {
    /* 
    Dynamically creates the topic buttons for the Topic screen
    */
    let topics = [
        { "name": "General Knowledge", "value": 9, "colour": "#21AC11" },
        { "name": "Entertainment", "value": 11, "colour": "#F26581" },
        { "name": "Science", "value": 17, "colour": "#4280ef" },
        { "name": "History", "value": 23, "colour": "#EA7216" },
        { "name": "Mythology", "value": 20, "colour": "DarkMagenta" },
        { "name": "Geography", "value": 22, "colour": "ForestGreen" },
        { "name": "Sports", "value": 21, "colour": "FireBrick" },
        { "name": "Politics", "value": 24, "colour": "LightSlateGrey" }
    ];

    // Add each topic button to the Game page
    topics.forEach( (topic, i) => {
        $("#topic-section").append(`
            <div class="col-12 col-md-6 col-lg-3 button-wrapper mb-5">
                <!-- "value" attribute corresponds to "category" value for the API query string -->
                <button class="screen-btn" value=${topic.value} style="background-color: ${topic.colour};">${topic.name}</button>
            </div>
        `);
    });
}

function createDifficultyButtons() {
    /* 
    Dynamically creates the difficulty buttons for the Difficulty screen
    */
    let difficulties = [
        { "type": "Easy", "breakpoints": "col-12 col-md-6 col-lg-4", "colour": "#21AC11" },
        { "type": "Medium", "breakpoints": "col-12 col-md-6 col-lg-4", "colour": "#4280ef" },
        { "type": "Hard", "breakpoints": "col-12 col-md-6 col-lg-4", "colour": "#f91414" },
        { "type": "Random", "breakpoints": "col-12 col-md-6 col-lg-12", "colour": "LightSlateGrey" }
    ];

    // Add each button to the Game page
    difficulties.forEach( (difficulty, i) => {
        $("#difficulty-section").append(`
            <div class="${difficulty.breakpoints} button-wrapper mb-5">
                <button class="screen-btn" style="background-color: ${difficulty.colour};">${difficulty.type}</button>
            </div>
        `);
    });
}

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

function validateUsername(username, session) {
    let issue = '';

    // Check if username entered
    if(username === '') {
        issue = "No username entered";
    }

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
            changeScreen("username", "topic");
            $(document).off('keypress'); // Turn off keypress detection
    }
}

function changeScreen(screenToHide, screenToShow = null) {
    // Hide old screen
    $(`#${screenToHide}-screen`).attr("hidden", true);
    $(`#${screenToHide}-screen`).hide();
    $(`#${screenToHide}-header`).hide();

    // Display new screen
    if (screenToShow !== null) {
        $(`#${screenToShow}-screen`).attr("hidden", false);
        $(`#${screenToShow}-screen`).show();
        $(`#${screenToShow}-header`).show();
    }
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

    // The amount of players who can be displayed on the Leaderboard
    // Also limits the number of users of a specific difficulty who can be stored in local storage
    let leaderboardLimit = 10;

    // Leaderboard data sorted by score and difficulty
    let sortedUsers = sortLeaderboardData(difficulty);

    // Gets the amount of players currently stored in local storage for this difficulty
    let amountOfPlayers = sortedUsers.length;
    if (sortedUsers.length > leaderboardLimit) {
        // This will occur if there are 11 players stored in local storage
        // This happens as culling has not taken effect yet
        amountOfPlayers = leaderboardLimit;
    }

    // Calculates user's position
    sortedUsers.forEach((user, position) => {
        if (user.name === $('#username').html() && user.id === userID) {
            let userPosition = (position+1);

            // Tells user whether or not they made it onto the Leaderboard
            if ( userPosition > leaderboardLimit ) {
                $('#position-wrapper').append(
                    `
                    <p>Sorry ${user.name}, you didn't make it into the <b>Top ${leaderboardLimit}</b> on the <b>Leaderboard</b> :(</p>
                    `
                );
            } else {
                $('#position-wrapper').append(
                    `
                    <p>
                    You are at position <b>${userPosition}</b> 
                    out of <b>${amountOfPlayers}</b> 
                    players on the leaderboard.
                    </p>
                    `
                );
            }
            // Remove bottom placed player (Prevents local storage from getting too big)
            cullLeaderboardData(difficulty, sortedUsers, leaderboardLimit);
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
    let sortedUsers = sortLeaderboardData(difficulty);

    // Append user data to the leaderboard table for the specific category of difficulty
    sortedUsers.forEach( (user, i) => {
        if (user.difficulty === difficulty) {
            $("tbody").append(
                `<tr>
                    <th>#${i+1}</th>
                    <td>${sortedUsers[i].name}</td>
                    <td>${sortedUsers[i].score}</td>
                </tr>`
            );
        }
    });
}

function sortLeaderboardData(difficulty) {
	// Retrieve names and scores from local storage
    let allUsers = JSON.parse(localStorage.getItem("userObjects"));

    // Will sort the leaderboard data associated with the specific difficulty
    let sortedUsers = [];

    // Sort data by score and difficulty
    // Got help for below with the following link:
    // https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/
    allUsers = allUsers.sort((a, b) => (a.score > b.score) && a.difficulty === difficulty ? -1 : 1);

    // Add users whose difficulty matches the difficulty for the current game
    allUsers.forEach( (user, i) => {
        if (user.difficulty === difficulty) sortedUsers.push(user);
    });

    return sortedUsers;
}

function cullLeaderboardData(difficulty, usersOfCurrentDifficulty, leaderboardLimit) {
    /*
    Culling takes effect after the leaderboard position of the current user is calculated.

    Any user object which doesn't make it into the top number of scores is removed from local storage. 
    This is all to prevent too many user objects being stored in local storage.

    Function takes in the usersOfCurrentDifficulty array, this will be culled below if it's length exceeds the
    leaderboard limit for that difficulty. Once culled, it is then combined with the usersOfOtherDifficulties
    array and saved in local storage.
    */

    // Retrieve names and scores from local storage
    let allUsers = JSON.parse(localStorage.getItem("userObjects"));

    // Other difficulty user data
    let usersOfOtherDifficulties = [];

    // Gets users whose difficulty is not the same as the current difficulty
    allUsers.forEach( (user, i) => {
        if (user.difficulty !== difficulty) usersOfOtherDifficulties.push(user);
    });

    // Cull usersOfCurrentDifficulty array if it exceeds the limit of players stored
    while (usersOfCurrentDifficulty.length > leaderboardLimit) {
        usersOfCurrentDifficulty.pop();
    }

    // Combine usersOfCurrentDifficulty & usersOfOtherDifficulties
    let postCullingUsers = usersOfOtherDifficulties.concat(usersOfCurrentDifficulty);

    // Save in local storage
    localStorage.setItem('userObjects', JSON.stringify(postCullingUsers));
}

function checkForErrors(responseCode) {
    /*
    Will return a boolean value:
        - true, if errors exist
        - false, if no errors exist
    */
    let anyErrors = false;

    let errorResponses = [
        { "responseCode": 0, "errorResponse": "", "status": false },
        { "responseCode": 1, "errorResponse": "No results from that particular category", "status": true },
        { "responseCode": 2, "errorResponse": "Invalid parameter", "status": true },
        { "responseCode": 3, "errorResponse": "Session token not found.", "status": true },
        { "responseCode": 4, "errorResponse": "Session token empty", "status": true }
    ];

    // Display error to user if any exists
    errorResponses.forEach( error => {
        if (responseCode === error.responseCode) {
            $("#error-response").html(error.errorResponse);
            $("#error-response-section").show();
            anyErrors = error.status;
        }
    });
    return anyErrors;
}