var animate = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
canvas.style.position = "relative";
var width = 1024;
var height = 768;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var currentLevel = 0;

var patterns = [];
var levels = [];

var colors = ["#FFFFFF","#F08080","#FA8072","#E9967A","#FFA07A","#DC143C","#B22222", "#8B0000","#FFC0CB","#FFB6C1","#FF69B4","#FF1493",
              "#C71585","#DB7093","#FF7F50","#FF6347","#FF4500","#FF8C00","#FFA500", "#FFD700","#FFFF00","#FFFFE0","#FFFACD","#FAFAD2",
              "#FFEFD5","#FFE4B5","#FFDAB9","#EEE8AA","#F0E68C", "#BDB76B","#E6E6FA","#D8BFD8","#DDA0DD","#EE82EE","#DA70D6","#FF00FF",
              "#BA55D3","#9370DB","#663399","#8A2BE2","#9400D3","#9932CC","#8B008B","#800080","#4B0082","#6A5ACD","#483D8B","#7B68EE",
              "#ADFF2F","#7FFF00","#7CFC00","#00FF00","#32CD32","#98FB98","#90EE90","#00FA9A","#00FF7F","#3CB371","#2E8B57","#F0FFF0",
              "#228B22","#008000","#006400","#9ACD32","#6B8E23","#808000","#556B2F","#66CDAA","#8FBC8B","#20B2AA","#008B8B","#008080",
              "#00FFFF","#E0FFFF","#AFEEEE","#7FFFD4","#40E0D0","#48D1CC","#00CED1","#5F9EA0","#4682B4","#B0C4DE","#B0E0E6","#ADD8E6",
              "#87CEEB","#87CEFA","#00BFFF","#1E90FF","#6495ED","#4169E1", "#FFFFFF","#FFE4E1","#FFF0F5","#FAF0E6","#FAEBD7","#F5F5DC"];

for(var i = 1; i <= 5; i++) {
  var pattern = new Image();
  pattern.src = 'pattern'+i+'.jpg';
  patterns.push(pattern);
}

for(var i = 1; i <= 5; i++) {
  levels.push(new Level(i, patterns));
}

var color = colors[Math.floor(Math.random() * colors.length)];
var player = new Player(color);
var ball = new Ball(464, 300, color);

window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};

var keysDown = {};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});

var update = function() {
  player.update();
  ball.update(player.paddle, levels[currentLevel]);
}

var alive_still = function() {
  return levels[currentLevel].lives > 0;
}

//make the visual changes
var step = function() {
  if(levels[currentLevel].complete()) {
    currentLevel+=1;
    player.reset_position();
    ball.reset_position();
  }
  else {
    update();
  }
  render();
  if(!alive_still()) {
    render2();
  }
  else {
    animate(step);
  }
};

var render2 = function() {
  var btn = document.createElement("button");
  btn.innerHTML = "retry";
  btn.style.backgroundColor = "#338bff";
  btn.style.border = "none";
  btn.style.width = "125px";
  btn.style.height = "50";
  btn.style.position = "absolute";
  btn.style.left = "30%";
  btn.style.right = "40%";
  btn.style.top = "50%";
  btn.style.fontFamily = "Verdana";
  btn.style.fontSize = "xx-large";
  btn.style.borderRadius = "4px";
  btn.style.textTransform =  "uppercase";
  btn.onclick = function() {
    location.href = "index.html";
  };
  document.body.appendChild(btn);

}

//load all the visuals
var render = function() {
  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);
  player.set_color(color);
  player.render();
  ball.set_color(color);
  ball.render();
  levels[currentLevel].render();
  context.font = "30px Verdana";
  context.fillStyle = "#338bff";
  context.fillText("Lives:"+levels[currentLevel].lives, 0, 30);
  context.fillText("Level: "+(currentLevel+1), 0, 60);
};

function Ball(x, y, color) {
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 2.25;
  this.radius = 10;
  this.current_color = color;
}

Ball.prototype.reset_position = function() {
  this.x = 464;
  this.y = 300;
  this.x_speed = 0;
  this.y_speed = 2.25;
}

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = this.current_color;
  context.fill();
};

Ball.prototype.set_color = function(color) {
  this.current_color = color;
}

//change direction of ball 
Ball.prototype.update = function(paddle, level) {
  this.x+=this.x_speed;
  this.y+=this.y_speed;
  var left = this.x - 10;
  var top = this.y - 10;
  var right = this.x + 10;
  var bottom = this.y + 10;
  if(left < 0) { //hit left wall
    this.x = 10;
    this.x_speed = -this.x_speed;
  }
  else if(right > 1028) { //hit right wall
    this.x = 1014;
    this.x_speed = -this.x_speed;
  }
  else if(top < 0) { //hit ceiling
    this.y = 10;
    this.y_speed = -this.y_speed;
  }
  else if(bottom > 768) { //ball died, -1 life
    this.y = paddle.y - 10;
    this.x = paddle.x + 38;
    this.y_speed = -this.y_speed;
    levels[currentLevel].sub_life();
  }
  else if(paddle.x-10 <= this.x && this.x <= paddle.x+185 && bottom >= paddle.y-2 && bottom <= paddle.y+2) { //ball hit the player paddle
    if(this.x_speed == 0) {
      var random_number = Math.floor(Math.random() * 2);
      this.x_speed = random_number == 1 ? 3.25 : -3.25;
      this.y_speed = -3.25;
    }
    else {
      this.y_speed = -this.y_speed;
      color = colors[Math.floor(Math.random() * color.length)];
    }
  }
  else if(bottom >= 130 && top <= 226) { //interaction with a brick
    var delta = level.hit2(this.x, this.y);
    if(delta[0]) {
      this.x_speed = -this.x_speed;
    }
    if(delta[1]) {
      this.y_speed = -this.y_speed;
    }
  }
}

function Paddle(x, y, width, height, color) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
  this.current_color = color;
}

Paddle.prototype.render = function() {
  context.fillStyle = this.current_color;
  context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.set_color = function(color) {
  this.current_color = color;
}

//move the player paddle left and right
Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if(this.x < 0) {
    this.x = 0;
    this.x_speed = 0;
  } 
  else if (this.x + this.width > 1028) {
    this.x = 1028 - this.width;
    this.x_speed = 0;
  }
}

function Player(color) {
  this.paddle = new Paddle(425, 650, 175, 25, color);
}

Player.prototype.reset_position = function() {
  this.paddle.x = 425;
  this.paddle.y = 650;
};

Player.prototype.render = function() {
  this.paddle.render();
};

//check whether left or right arrow key is pressed
Player.prototype.update = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37) {
      this.paddle.move(-9, 0);
    } 
    else if (value == 39) {
      this.paddle.move(9, 0);
    } 
    else {
      this.paddle.move(0, 0);
    }
  }
};

Player.prototype.set_color = function(color) {
  this.paddle.set_color(color);
}

function Level(hits, pattern) {
  this.lives = 3;
  this.hits = hits;
  this.pattern = pattern;
  this.bricks = [[0, 0, 0, 0, 0, 0, 0, 0], 
                 [0, 0, 0, 0, 0, 0, 0, 0], 
                 [0, 0, 0, 0, 0, 0, 0, 0]];
}

//make appropriate changes if a brick is "hit"
Level.prototype.hit2 = function(x,y) {
  var delta = [false, false];
  for(var i = 0; i < this.bricks.length; i++) {
    for(var j = 0; j < this.bricks[i].length; j++) {
      var left = x - 10;
      var right = x + 10;
      var top = y - 10;
      var bottom = y + 10;
      if(this.bricks[i][j] < this.hits) {
        if(x >= j*128 && x <= j*128+128) {
          if(top >= 130 && top >= i*32+130 && top <= i*32+32+130) {
            this.bricks[i][j]+=1;
            delta[1] = true;
          }
          else if(bottom <= 226 && bottom >= i*32+130 && bottom <= i*32+32+130) {
            this.bricks[i][j]+=1;
            delta[1] = true;
          }
        }
        else if(y >= i*32+130 && y <= i*32+32+130) {
          if(left >= 0 && left >= j*128 && left <= j*128+128) {
            this.bricks[i][j]+=1;
            delta[0] = true;
           }
          else if(right <= 1024 && right >= j*128 && right <= j*128+128) {
            this.bricks[i][j]+=1;
            delta[0] = true;
          }
        }
        // if(delta[0] || delta[1]) {
        //   return delta;
        // }
      }
    }
  }
  return delta;
}

Level.prototype.render = function() {
  for(var i = 0; i < this.bricks.length; i++) {
    for(var j = 0; j < this.bricks[i].length; j++) {
      if(this.bricks[i][j] < this.hits) {
        context.drawImage(this.pattern[this.hits - this.bricks[i][j]-1], j*128, 130+32*i, 128, 32);
      }
    }
  }
}

//go to the next level
Level.prototype.complete = function() {
  for(var i = 0; i < this.bricks.length; i++) {
    for(var j = 0; j < this.bricks[i].length; j++) {
      if(this.bricks[i][j] < this.hits) {
        return false;
      }
    }
  }
  return true;
}

Level.prototype.sub_life = function() {
  this.lives-=1;
}
