# Quiz Game

The purpose of this website is to create a fun interactive general knowledge quiz game using the [Open Trivia Database REST API.](https://www.programmableweb.com/api/open-trivia-database-rest-api-v1)

## Table of Contents
- [User Experience (UX)](#user-experience-(ux))
    - [Strategy](#strategy)
        - [User Stories](#user-stories)
        - [Project Goal](#project-goal)
        - [Strategy Tradeoffs](#strategy-tradeoffs)
    - [Scope](#scope)
    - [Structure](#structure)
    - [Skeleton](#skeleton)
    - [Surface](#surface)
- [Technologies](#technologies)
- [Testing](#testing)
- [Deployment](#deployment)
- [Credits](#credits)

---
## User Experience (UX)

### Strategy

#### User Stories
As a **first-time player**, I want:
1. To see a visually appealing game.
2. To easily understand how the game works.
3. To be able to pick a quiz topic.
4. To be given feedback on my answers.
5. To be rewarded when I get the right answer.
6. To be able to track my score.

As a **returning player**, I want:
1.	To skip any instructions and jump straight into a new game.
2. To increase the difficulty for new challenges.
3. A large number of questions so that my playing experience is always different.

As a **site owner**, I want:
1.	To provide a fun interactive game for users.
2. To provide an inituitive game that will not confuse users.
3. To provide an educational game for users.
4. To create a game that is available on different devices.
5. To create a game that makes users want to play it again.

#### Project Goal
- Project goal:
    - The goal of this Quiz application is to provide an enjoyable interactive game that will test a user's general knowledge or knowledge about a specific topic. The game should be easy to understand, simple to interact with and give feedback to the user on all inputs.
- Focus:
    - The main focus of the project is to build a fun engaging interactive quiz game that will display many different and interesting questions generated from an external API.
- Definition:
    - We are creating an interactive Quiz application that will be playable on multiple devices.
- Value:
    - The value this project will provide, is that it will showcase to future employers my ability to use JavaScript to add interactivity to a web application, as well as my ability to retrieve data from an API.
    - The value for users of the application is that it will provide a fun engaging user experience.

#### Strategy Tradeoffs

Opportunity/Problem | Importance (1-5) | Viability/Feasibility (1-5)
:-------- |:--------:|:--------:
Display Timer | 2 | 3
Score Tracker | 4 | 5
Display Questions | 5 | 5
Present Answers | 5 | 5
Display questions based on difficulty | 4 | 5
Display questions based on topic | 3 | 5
Sounds / Music | 1 | 4
New Game / Exit Game | 5 | 5
Game Instructions | 3 | 5
End of Game information | 4 | 5
Give hints | 2 | 4

### Scope
- Main features (For Minimal Viable Product)
    - Display area for the questions generated from the Open Trivia API.
    - Answer presentation area, which will appear after the user submits his answer.
    - The ability to start a New game, or exit the current game.
    - End of game information will be given to the user.
    - Built using best practices of semantic HTML and accessibility.
    - Be fully responsive for mobile use.

- Secondary / Future Features:
    - Timer that displays how long the game has been on-going OR countdown to answer a question.
    - Display score that player has achieved after answering questions correctly.
    - Ability to select questions based on a particular topic.
    - Ability to select questions based on a particular difficulty.
    - Background music and sounds for the game.
    - There will be a game instructions page OR modal window on how to play the game.
    - Hint feature, which will subtract user points in order to reduce the possible correct answers from 4 to 2.

### Structure
The website will be broken down into three areas in order to achieve the project goals and meet the user stories:
1. Home Page:
- The Homepage will showcase the logo for the game. The page will display two buttons, a "Play" button and an "Instructions" button.
- "Play" button will take the user to the Game Page.
- "Instructions" button will take the user to the Instructions.
2. Instructions Page:
- Will give instructions on how to play the game. 
- Will include a button to return to the Home page.
3. Game Page:
- There will be a header / navbar which will display certain information about the user and game i.e. Game Logo, Questions remaining, User Score etc.
- Will display a randomly generated question for the user.
- Underneath each question will be four boxes of each of the possible correct answers.
- User will be given visual feedback on which answer they got correct or wrong.
- When the game is finished, the user will be presented with their stats. This may be a modal popup window. This modal window will include buttons to start a new game or to exit the game.
    - New Game button will generate a new set of quiz questions.
    - Exit Game button will return the user to the Home Page.

### Skeleton
1. Home Page Wireframe:
    - [Mobile](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/home/home-mobile.png)
    - [Tablet](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/home/home-tablet.png)
    - [Desktop](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/home/home-desktop.png)
2. Instructions Page Wireframe:
    - [Mobile](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/instructions/instructions-mobile.png)
    - [Tablet](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/instructions/instructions-tablet.png)
    - [Desktop](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/instructions/instructions-desktop.png)
3. Game Page Wireframe:
    - [Mobile](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/game/game-mobile.pdf)
    - [Tablet](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/game/game-tablet.pdf)
    - [Desktop](https://github.com/JamesSinnott1994/Quiz-Game/blob/master/wireframes/game/game-desktop.pdf)

### Surface
- Typography:
    - Two fonts will be used in this application:
        - The Calistoga font will be used for any headers.
        - The Caladea font will be used for the text, questions, and answers.
- Colour scheme:
    - Background colour  ![#e6ece2](https://placehold.it/15/e6ece2/000000?text=+)<br>
    - Text Colours  ![#2b2726](https://placehold.it/15/2b2726/000000?text=+) / ![#FFFFFF](https://placehold.it/15/FFFFFF/000000?text=+)<br>
    - Ordinary button colour  ![#c0bdae](https://placehold.it/15/c0bdae/000000?text=+)<br>
    - Correct answer colour  ![#63ba09](https://placehold.it/15/63ba09/000000?text=+)<br>
    - Wrong answer colour  ![#e35a47](https://placehold.it/15/e35a47/000000?text=+)<br>
    - Star Colour  ![#ffe785](https://placehold.it/15/ffe785/000000?text=+)<br>

- Media:
    - I will use a Logo image for the Home page
    - I will use images for the various quiz topics.
    - I may use some low fidelity background music.
    - I may use a sound for getting the correct answer.
    - I may use a sound for getting the wrong answer.

- Effects:
    - There will be a transition animation for buttons sliding into place.
    - There will be fading animations for buttons fading out of sight.
    - There will be hover effects for the various buttons.
    - There will be shadow effects for the various buttons.