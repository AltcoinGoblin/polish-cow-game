const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton'); // Get the start button

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load background music
const backgroundMusic = new Audio('assets/audio/PolishCow.mp3'); // Ensure this path is correct
backgroundMusic.loop = true;  // Loop the music continuously
backgroundMusic.volume = 0.5; // Set volume (0.0 to 1.0)

// Load player image
const playerImage = new Image();
playerImage.src = 'assets/images/player.png'; // Ensure this path is correct

// Game state
let isGameOver = false;
let score = 0;            // Track the current score
let cameraOffset = 0;     // Track how much the camera has scrolled up

// Start the game when the start button is clicked
startButton.addEventListener('click', () => {
  // Hide the start button
  startButton.style.display = 'none';

  // Function to initialize the game
  const startGame = () => {
    initPlatforms();
    backgroundMusic.play();
    gameLoop();
  };

  // Check if the player image is already loaded
  if (playerImage.complete) {
    startGame(); // If the image is loaded, start the game immediately
  } else {
    playerImage.onload = startGame; // Otherwise, wait for the image to load
  }
});



// Draw the score
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${Math.floor(score)}`, 20, 40);
}

// Player settings
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    width: 40,
    height: 60,
    dx: 0,                // Horizontal velocity
    dy: 0,                // Vertical velocity
    gravity: 0.33,        // Gravity force
    drag: 0.3,            // Horizontal drag
    bounceVelocity: -12.5 // Velocity after bouncing on a platform
  };
let highestY = player.y; // Track the highest point the player reaches

// Platform settings
const platformWidth = 100;
const platformHeight = 10;
const platformCount = 30;
const maxVerticalGap = 120; // Maximum vertical gap to ensure platforms are reachable
const minVerticalGap = 80; // Minimum vertical gap to prevent overlap
const horizontalMargin = 50; // Margin to ensure platforms are not too close to the edges

let platforms = []; // Initialize platforms array

// Ensure there's always a platform underneath the player at the start
function initPlatforms() {
  platforms = [];

  // Create a platform directly under the player
  platforms.push({
    x: player.x - (platformWidth / 2) + (player.width / 2),
    y: player.y + player.height + 10,
    width: platformWidth,
    height: platformHeight
  });
  
  let lastPlatformY = platforms[0].y;

  // Create additional random platforms
  let gap = canvas.height / platformCount;
  for (let i = 1; i < platformCount; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: i * gap + 100,
      width: platformWidth,
      height: platformHeight
    });
  }
}

// Draw platforms
function drawPlatforms() {
  ctx.fillStyle = 'green';
  platforms.forEach(platform => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

// Draw the player
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}
// Generate new platforms when the player ascends
function generateNewPlatforms() {
    // Find the highest platform
    let highestPlatform = platforms.reduce((highest, platform) =>
      platform.y < highest.y ? platform : highest
    );
  
    // Add new platforms until the highest platform is near the top
    while (highestPlatform.y > 0) {
      // Determine the new vertical position
      let newY = highestPlatform.y - getRandom(minVerticalGap, maxVerticalGap);
  
      // Ensure the new horizontal position is within a reasonable distance
      let newX = getRandom(
        Math.max(highestPlatform.x - 150, horizontalMargin),
        Math.min(highestPlatform.x + 150, canvas.width - platformWidth - horizontalMargin)
      );
  
      platforms.push({
        x: newX,
        y: newY,
        width: platformWidth,
        height: platformHeight
      });
  
      highestPlatform = platforms[platforms.length - 1];
    }
  
    // Remove platforms that are off the bottom of the screen
    platforms = platforms.filter(platform => platform.y < canvas.height);
  }
  
  
  // Helper function to get a random number between min and max
  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  let totalDistance = 0; // Track the total distance the player ascends

  function updatePlayer() {
    // Apply gravity
    player.dy += player.gravity;
    player.y += player.dy;
  
    // Apply horizontal movement with drag
    if (!keydown) {
      if (playerDir < 0) {
        player.dx += player.drag;
        if (player.dx > 0) {
          player.dx = 0;
          playerDir = 0;
        }
      } else if (playerDir > 0) {
        player.dx -= player.drag;
        if (player.dx < 0) {
          player.dx = 0;
          playerDir = 0;
        }
      }
    }
  
    player.x += player.dx;
  
    // Wrap player horizontally
    if (player.x + player.width < 0) {
      player.x = canvas.width;
    } else if (player.x > canvas.width) {
      player.x = -player.width;
    }
  
    // Platform collision
    platforms.forEach(platform => {
      if (
        player.dy > 0 &&
        player.y + player.height <= platform.y + player.dy &&
        player.y + player.height >= platform.y &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platformWidth
      ) {
        player.dy = player.bounceVelocity;
        player.y = platform.y - player.height;
      }
    });
  
    // Scroll the screen if the player moves above the middle
    if (player.y < canvas.height / 2) {
      let offset = canvas.height / 2 - player.y;
      player.y += offset; // Keep player near the middle
      cameraOffset += offset; // Track how much we've scrolled up
      totalDistance += offset; // Track the total distance ascended
  
      platforms.forEach(platform => {
        platform.y += offset; // Move platforms downward
      });
  
      // Generate new platforms as the player moves up
      generateNewPlatforms();
    }
  
    // Update the score based on the total distance ascended
    score = Math.floor(totalDistance);
  
    // Check for game over condition
    if (player.y > canvas.height) {
      gameOver();
    }
  }
  
  
  

// Game Over function
function gameOver() {
    isGameOver = true;
    backgroundMusic.pause(); // Pause the background music
    backgroundMusic.currentTime = 0; // Reset the music to the beginning
    ctx.fillStyle = 'red';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Press R to Restart', canvas.width / 2 - 100, canvas.height / 2 + 40);
  }
  


// Handle player movement
let playerDir = 0;
let keydown = false;

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      keydown = true;
      playerDir = -1;
      player.dx = -3;
    } else if (e.key === 'ArrowRight') {
      keydown = true;
      playerDir = 1;
      player.dx = 3;
    } else if (e.key === 'r' || e.key === 'R') {
      if (isGameOver) resetGame();
    }
  });

window.addEventListener('keyup', () => {
  keydown = false;
});



let animationFrameId; // To track the current animation frame ID

// Reset the game
function resetGame() {
    isGameOver = false;
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 100;
    player.dx = 0;
    player.dy = 0;
    score = 0;          // Reset the score
    highestY = player.y; // Reset the highest point
    cameraOffset = 0;   // Reset the camera offset
    totalDistance = 0;  // Reset the total distance
    initPlatforms();    // Reinitialize the platforms
  
    // Cancel the previous game loop if it exists
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  
    // Restart the background music
    backgroundMusic.play();
  
    // Start a new game loop
    gameLoop();
  }
  
  
// Game loop
function gameLoop() {
    if (!isGameOver) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  
      drawPlatforms();
      updatePlayer();
      drawPlayer();
      drawScore(); // Draw the score
  
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  

