## Testing

### Browser Compatability

- I tested the appearance and responsiveness of the website across many different devices and browsers. Generally, the appearance and responsiveness looks quite good on the different devices, and there is no difference between the browsers.

- Browsers tested:
    - Brave
    - Chrome
    - Firefox
    - Microsoft Edge
- Devices tested:
    - Windows laptop
    - iPad
    - Android Phone
- Devices tested in DevTools:
    - Moto G4
    - iPhone 6/7/8
    - iPad
- Custom responsive viewport sizes created for testing on larger screens than my laptop:
    - 1280px x 802px (Larger laptop)
    - 1600px x 992px (Desktop)

### Code Validation

Testing HTML with [The W3C Markup Validation Service ](https://validator.w3.org/)

- Home page:
    - Minor warning about the section containing the "Play" and "Instructions" buttons lacking a header. Not an issue as the buttons are self-explanatory and therefore the section does not need an "identifying heading".
- Instructions page:
    - Same warning as above, this time about no h2-h6 heading element for the section containing the instructions text. Again this is not an issue for the instructions page as there is a h1 element in the header element which describes the content in the section containing the text.
- Game page:
    - 11 similar warning about the no h2-h6 heading in section elements. Again this is not an issue for the game page.
    - 5 warnings about the document containing more than one `main` element.
        - The reason for having mulitple `main` elements is that each element represents a screen of the Game page.
        - Initially, the display for 5 of the 6 `main` elements was set to none, so they were not seen until the user clicked through each of the screens. This wasn't good enough for the HTML validator however, so the solution was to add a `hidden` attribute to 5 of the elements.

### Performance Testing

Testing page with Lighthouse in Chrome Dev Tools to optimise performance, accessibility, best practices and SEO

#### Desktop Performance

- Lighthouse Desktop Home page report:

![Lighthouse Desktop Home Page Report](readme-images/desktop-home-performance.png)

- Lighthouse Desktop Instructions page report:

![Lighthouse Desktop Instructions Page Report](readme-images/desktop-instructions-performance.png)

- Lighthouse Desktop Game page report:

![Lighthouse Desktop Game Page Report](readme-images/desktop-game-performance.png)

#### Mobile Performance

- Lighthouse Mobile Home page report:

![Lighthouse Mobile Home Page Report](readme-images/mobile-home-performance.png)

- Lighthouse Mobile Instructions page report:

![Lighthouse Mobile Instructions Page Report](readme-images/mobile-instructions-performance.png)

- Lighthouse Mobile Game page report:

![Lighthouse Mobile Game Page Report](readme-images/mobile-game-performance.png)

- Performance, Accessibility, Best Practices and SEO were roughly the same on desktop and mobile. The only slight difference with performance was on mobile, however this was still of a high standard (92).

![Lighthouse Post-Optimisation Mobile Report](readme-images/home-mobile-post-performance.PNG)

---
## Bugs

**Bug:** Bug with nav list items appearing as block elements when their containing div is shown by the jquery code.

**Fix:** The solution here was to use:

    $("#game-header").css("display", "flex");

As opposed to:

    $("#game-header").show()

**Bug:** When the height of all of the answer button divs is set intially to the max height of the largest div (based on it's text), it never then sets to the new max height for the divs of the next displayed question.

**Fix:** The solution I used was to re-create the buttons for the next displayed question. This is perhaps an inefficient way of dealing with the bug, but I couldn't figure out why the max height of the buttons would not change for the next displayed question.

**Bug:** Leaderboard data was being appended to each time the Leaderboard screen was shown.

**Fix:** Solution was to empty the Leaderboard list element using: leaderboard-list.empty()

**Bug:** Countdown timer was decrementing faster if users answered questions quickly.

**Fix:** Solution I used was to make the timer variable a global variable which was easier to turn on and off.