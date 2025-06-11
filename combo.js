// user-input animation//
// --------------------------------------------------
// Module to combine concentric circle rotation/scale animation//

(function() {
    // Map storing animation state for each concentric circle//
    const circleStates = new Map();
    // Index of the currently selected circle (if any)//
    let selectedCircleIndex = null;
    // Array to track active ripple effects//
    const ripples = [];
  
    //generate random colour//
    function randomColour() {
      return {
        r: random(255),
        g: random(255),
        b: random(255)
      };
    }
  
    // Initialise animation states for all concentric circles.//
    //  Called once after window load when circleSystem is ready.//
    function initStates() {
      if (!circleSystem || !circleSystem.circles) return;  // Ensure circleSystem is defined//
      circleSystem.circles.forEach((c, idx) => {  // Iterate over each circle in the system//
        circleStates.set(idx, {
          angle: 0,
          scale: 1,
          targetAngle: 0,
          targetScale: 1,
          animating: false
        });
      });
    }

    //draw handler for both concentric circles and ripples//
    function handleDraw() {
      // Clear canvas//
      CanvasManager.clearBackground(); 
      let anyAnimating = false;  // Track if any circle is animating//
  
      // 1) Concentric circles animation//
      circleSystem.circles.forEach((c, idx) => {
        const state = circleStates.get(idx);
        if (state.animating) {
          // Smoothly interpolate current angle and scale towards targets
          state.angle += (state.targetAngle - state.angle) * 0.2;  // Adjust angle towards target//
          state.scale += (state.targetScale - state.scale) * 0.2;  // Adjust scale towards target//
          // If close to targets, finalise and stop animating
          if (
            abs(state.targetAngle - state.angle) < 0.001 &&  // Check if angle is close to target,used abs to replace Math.abs//
            abs(state.targetScale - state.scale) < 0.001
          ) {
            state.angle = state.targetAngle;  // Set final angle//
            state.scale = state.targetScale;  // Set final scale//
            state.animating = false;  // Stop animating this circle//
          } else {
            anyAnimating = true;  // At least one circle is still animating//
          }
        }
        // Apply transform and draw circle at its centre
        push();
        translate(c.x, c.y);
        rotate(state.angle);
        scale(state.scale);
        DecorateWheels.drawWheel({ ...c, x: 0, y: 0 });
        pop();
      });
  
      // 2) Ripple effect animation
      ripples.forEach(r => {
        // Expand ripple diameter
        r.size += 10;
        // Fade out based on size relative to canvas
        const fadeMax = max(width, height) * 2;
        let alpha = map(r.size, 0, fadeMax, 255, 0);
        alpha = constrain(alpha, 0, 255);
        // Draw three rings per ripple with distinct colours
        [r.size, r.size * 0.75, r.size * 0.5].forEach((s, i) => {
          const col = r.colors[i];
          stroke(col.r, col.g, col.b, alpha);
          strokeWeight(5);
          noFill();
          circle(r.x, r.y, s);
        });
      });
  
      // Remove ripples that moved completely off-canvas
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const radius = r.size / 2;
        if (
          r.x + radius < 0 ||
          r.x - radius > width ||
          r.y + radius < 0 ||
          r.y - radius > height
        ) {
          ripples.splice(i, 1);
        }
      }
  
      // Continue looping if any animation is active or ripples exist
      if (anyAnimating || ripples.length > 0) {
        loop();
      } else {
        noLoop();
      }
    }
  
    /**
     * Mouse press handler
     * Toggles selection animation on concentric circles
     * Adds a new ripple at click location
     */
    function handleMousePressed() {
      const mx = mouseX;
      const my = mouseY;
      let clickedIdx = null;
      // Detect which circle (if any) contains the click point//
      circleSystem.circles.forEach((c, idx) => {
        if (dist(mx, my, c.x, c.y) <= c.radius) {
          clickedIdx = idx;
        }
      });
  
      if (clickedIdx !== null) {
        // If a different circle was selected before, reset it//
        if (selectedCircleIndex !== null && selectedCircleIndex !== clickedIdx) {
          const prev = circleStates.get(selectedCircleIndex);
          prev.targetAngle = 0;
          prev.targetScale = 1;
          prev.animating = true;
        }
        const st = circleStates.get(clickedIdx);
        // If clicking the same circle and it's already shrunken, restore it//
        if (
          selectedCircleIndex === clickedIdx &&
          !st.animating &&
          st.scale < 1
        ) {
          st.targetAngle = 0;
          st.targetScale = 1;
        } else {
          // Otherwise rotate by 90° and shrink to half size//
          st.targetAngle = st.angle + HALF_PI;
          st.targetScale = 0.5;
        }
        st.animating = true;
        selectedCircleIndex = clickedIdx;
      }
  
      // Always add a ripple at the click location//
      ripples.push({
        x: mx,
        y: my,
        size: 0,
        colors: [randomColour(), randomColour(), randomColour()]
      });
  
      // Ensure draw loop runs to animate ripple//
      loop();
    }
  
    // On window load, initialise states and merge with existing handlers//
    window.addEventListener('load', () => {
      initStates();
      const origDraw = window.draw || function() {};
      const origMouse = window.mousePressed || function() {};
      // Override global draw to include custom animations//
      window.draw = () => {
        origDraw();
        handleDraw();
      };
      // Override global mousePressed to include custom handler//
      window.mousePressed = () => {
        origMouse();
        handleMousePressed();
      };
    });
  })();
  