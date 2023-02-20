const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;
var leftScore = 0;
var rightScore = 0;
var paddleSpeed = 6;
var ballSpeed = 4;

var loopCounter = 0;
var collisions = 0;
var showComputerLevel = false;
var computerLevelCounter = 0;

function Theme(){
  var formColor;
  var form = document.getElementById('colorTheme');
  formColor = form.options[form.selectedIndex].text;
  document.getElementById('body').style.backgroundColor = formColor;
}

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: -ballSpeed,
  dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// game loop
function loop() {
  loopCounter += 1;

  let frameID = requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  // move paddles by their velocity
  leftPaddle.y += leftPaddle.dy;

  //Makes paddle track but adds random to occasionally miss
  if (loopCounter % 2 === 0 || leftScore === 6){
  if (Math.random() < 0.50) {
  } else {
    if (rightPaddle.y > ball.y)
      rightPaddle.y -= paddleSpeed * (leftScore + 6)/ 12;
    else if(rightPaddle.y + rightPaddle.height < ball.y)
      rightPaddle.y += paddleSpeed * (leftScore + 6)/ 12;
    else if(ball.dy > 0)
      rightPaddle.y += paddleSpeed * (leftScore + 6)/ 12;
    else
      rightPaddle.y -= paddleSpeed * (leftScore + 6)/ 12;
  }

  loopCounter = 0;
}

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  // draw paddles
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;
    if (ball.x < 0 && collisions > 0) {
      rightScore++;

    } else if (ball.x > canvas.width && collisions > 0) {
      leftScore++;
      showComputerLevel = true;
      computerLevelCounter = 0;
    }

    if(leftScore === 7 || rightScore === 7){
      context.clearRect(0,0,canvas.width,canvas.height);
      cancelAnimationFrame(frameID);
      return gameOver();
    }

    collisions = 0;

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      if(leftScore === 6){
        ball.y = canvas.height/2;
        ball.dx = -ballSpeed * 3;
        ball.dy = -ball.dy;
      }
      else{
        ball.y = canvas.height/2;
        ball.dx = -ballSpeed;
      }
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    collisions += 1;
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
    collisions += 1;
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
  context.font = "30px serif";
  context.fillText("You: " + leftScore, 50, 50);
  context.fillText("Computer: " + rightScore, canvas.width - 200, 50);


  context.fillStyle = "#ff0000";
  context.font = "50px bold";
  //If a user scores, display level text.
  if(showComputerLevel && leftScore === 6 && computerLevelCounter < 60){
    context.fillText("LVL. 7, FINAL LEVEL!", canvas.width/8, canvas.height/2);
    computerLevelCounter += 1;
  }
  else if(showComputerLevel && computerLevelCounter < 60){
    context.fillText("Computer Level: " + (leftScore + 1), canvas.width/4, canvas.height/2);
    computerLevelCounter += 1;
  }
  else if (computerLevelCounter === 60){
    showComputerLevel = false;
    computerLevelCounter = 0;
  }
  context.fillStyle = "#000000";
  context.font = "30px serif";

}
// listen to keyboard events to move the paddles
document.addEventListener('keydown', function(e) {
  // w key
  if (e.which === 87) {
    leftPaddle.dy = -paddleSpeed;
  }
  // a key
  else if (e.which === 83) {
    leftPaddle.dy = paddleSpeed;
  }
});

function gameOver(){
  document.getElementById("winner").innerHTML = (leftScore > rightScore)? "You": "The Computer";
  document.getElementById("gameOverModal").style.display = "block";
}

function playAgain(){
  //Makes modal disappear
  document.getElementById("gameOverModal").style.display = "none";

  //Resetting scores
  rightScore = 0;
  leftScore = 0;

  //Resetting board
  ball.resetting = false;
  ball.x = canvas.width /2;
  ball.y = canvas.height/2;
  ball.dx = -ballSpeed;

  rightPaddle.y = canvas.height / 2;
  leftPaddle.y = canvas.height / 2;

  finalTextShown = false;
  finalTextCounter = 0;
  collisions = 0;
  //Begins animation of game again.
  requestAnimationFrame(loop);
}

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function(e) {
  /*
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }
  */
  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
});

// start the game
requestAnimationFrame(loop);
