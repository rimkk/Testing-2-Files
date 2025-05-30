# Bouncing Balls Game

A fun and interactive browser-based game where you control a paddle to bounce different types of balls and collect coins.

## Features

- Multiple types of balls with different behaviors:
  - Pink balls: Normal balls (10 points)
  - Purple balls: Special balls (20 points)
  - Red balls: Dangerous balls (lose a life if hit)
  - Gold balls: Coins (50 points, disappear when caught)
- Lives system (start with 3 lives)
- Coin collection system
- Continuous ball spawning
- Score tracking
- Game over screen with restart option

## How to Play

1. Use left and right arrow keys to move the paddle
2. Catch pink and purple balls to score points
3. Collect gold coins for bonus points
4. Avoid red balls - they cost you a life!
5. Try to survive as long as possible

## Running the Game

1. Clone the repository
2. Open `index.html` in a web browser
3. Or run a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Canvas API 