$(document).ready(function() {

    console.log("UP HIGH");

    // Variable declarations
    let topic = "";
    let difficulty = "";

    // Binds a click event to each button in the topic section
    $("#topic-section button").each(function() {
        $(this).bind('click', function() {

            // Assign topic to button that was clicked on
            topic = $(this).html();
            alert(`User clicked on ${topic}`);

            // Hide Topic screen
            $("#topic-screen").hide();
             $("#topic-header").hide();

            // Display difficulty screen
            $("#difficulty-screen").show();
             $("#difficulty-header").show();
        });
    });

    // Binds a click event to each button in the difficulty section
    $("#difficulty-section button").each(function() {
        $(this).bind('click', function() {

            // Assign topic to button that was clicked on
            difficulty = $(this).html();
            alert(`User clicked on ${difficulty}`);

            // Hide Difficulty screen
            $("#difficulty-screen").hide();
             $("#difficulty-header").hide();
        });
    });

    console.log("DOWN LOW");

});