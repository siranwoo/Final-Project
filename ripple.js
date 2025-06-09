//input ripples//
//source code link: https://happycoding.io/tutorials/p5js/input/mouse-ripple//

(function(){
    // save expanding circles//
    const UserInput = {
      circles: [],
  
      // random color generator//
      randomColor() {
        return {
          r: random(255),
          g: random(255),
          b: random(255)
        };
      },
  
      updateAndDraw() {  // clear all previous drawings//
        this.circles.forEach(c => {
          c.size += 10;
          // fading effect: calculate alpha based on size//
          const fadeMax = max(width, height) * 2; //max size for fading//
          let alpha = map(c.size, 0, fadeMax, 255, 0);  //size to alpha mapping//
          alpha = constrain(alpha, 0, 255);  //restict alpha to 0-255 range//
  
          //ripples//
          const sizes = [c.size, c.size * 0.75, c.size * 0.5];  // sizes of the circles//
          sizes.forEach((s, i) => {  // draw three concentric circles with different colors//
            const col = c.colors[i]; // random color for each circle//
            stroke(col.r, col.g, col.b, alpha);  // set stroke color with alpha//
            strokeWeight(5);
            noFill();
            circle(c.x, c.y, s);
          });
        });
  
        // only stop after the circle is off the canvas//
        this.circles = this.circles.filter(c => {
          const r = c.size / 2;
          const offLeft   = c.x + r < 0;
          const offRight  = c.x - r > width;
          const offTop    = c.y + r < 0;
          const offBottom = c.y - r > height;
          return !(offLeft || offRight || offTop || offBottom);
        });
  
        if (this.circles.length === 0) {
          noLoop();
        }
      },
  
      mousePressed() {
        // generate 3 random colors when mouse is pressed//
        const newColors = [
          this.randomColor(),
          this.randomColor(),
          this.randomColor()
        ];
        this.circles.push({ x: mouseX, y: mouseY, size: 0, colors: newColors });
        loop();
      }
    };
  
    // save and extend the global draw function//
    const _origDraw = window.draw;
    window.draw = function() {  // call original draw if it exists
      _origDraw && _origDraw();  
      UserInput.updateAndDraw();  // call our custom updateAndDraw function
    };
  
    // save and extend the global mousePressed//
    const _origMouse = window.mousePressed;
    window.mousePressed = function() {  // call original mousePressed if it exists
      _origMouse && _origMouse(); 
      UserInput.mousePressed();  // call our custom mousePressed function
    };
  })();
  