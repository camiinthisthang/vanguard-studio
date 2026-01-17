// p5.js function documentation for educational tooltips

export interface FunctionDoc {
  name: string;
  description: string;
  args: { name: string; description: string }[];
  example?: string;
}

export const p5Functions: Record<string, FunctionDoc> = {
  // Drawing shapes
  arc: {
    name: "arc",
    description: "Draws an arc (part of a circle or ellipse)",
    args: [
      { name: "x", description: "x position of the center" },
      { name: "y", description: "y position of the center" },
      { name: "w", description: "width of the arc" },
      { name: "h", description: "height of the arc" },
      { name: "start", description: "angle to start (in radians)" },
      { name: "stop", description: "angle to stop (in radians)" },
    ],
    example: "arc(50, 50, 80, 80, 0, PI)",
  },
  circle: {
    name: "circle",
    description: "Draws a circle on the screen",
    args: [
      { name: "x", description: "x position of the center" },
      { name: "y", description: "y position of the center" },
      { name: "d", description: "diameter (size) of the circle" },
    ],
    example: "circle(200, 200, 50)",
  },
  ellipse: {
    name: "ellipse",
    description: "Draws an oval/ellipse shape",
    args: [
      { name: "x", description: "x position of the center" },
      { name: "y", description: "y position of the center" },
      { name: "w", description: "width" },
      { name: "h", description: "height" },
    ],
    example: "ellipse(200, 200, 80, 50)",
  },
  rect: {
    name: "rect",
    description: "Draws a rectangle on the screen",
    args: [
      { name: "x", description: "x position of top-left corner" },
      { name: "y", description: "y position of top-left corner" },
      { name: "w", description: "width" },
      { name: "h", description: "height" },
    ],
    example: "rect(100, 100, 80, 60)",
  },
  square: {
    name: "square",
    description: "Draws a square (equal width and height)",
    args: [
      { name: "x", description: "x position of top-left corner" },
      { name: "y", description: "y position of top-left corner" },
      { name: "s", description: "size (width and height)" },
    ],
    example: "square(100, 100, 50)",
  },
  line: {
    name: "line",
    description: "Draws a straight line between two points",
    args: [
      { name: "x1", description: "x of start point" },
      { name: "y1", description: "y of start point" },
      { name: "x2", description: "x of end point" },
      { name: "y2", description: "y of end point" },
    ],
    example: "line(0, 0, 100, 100)",
  },
  triangle: {
    name: "triangle",
    description: "Draws a triangle with three corners",
    args: [
      { name: "x1", description: "x of first corner" },
      { name: "y1", description: "y of first corner" },
      { name: "x2", description: "x of second corner" },
      { name: "y2", description: "y of second corner" },
      { name: "x3", description: "x of third corner" },
      { name: "y3", description: "y of third corner" },
    ],
    example: "triangle(100, 200, 150, 100, 200, 200)",
  },

  // Colors and styling
  fill: {
    name: "fill",
    description: "Sets the color used to fill shapes",
    args: [
      { name: "r", description: "red (0-255) or grayscale" },
      { name: "g", description: "green (0-255), optional" },
      { name: "b", description: "blue (0-255), optional" },
    ],
    example: "fill(255, 0, 0) // red",
  },
  stroke: {
    name: "stroke",
    description: "Sets the outline color for shapes",
    args: [
      { name: "r", description: "red (0-255) or grayscale" },
      { name: "g", description: "green (0-255), optional" },
      { name: "b", description: "blue (0-255), optional" },
    ],
    example: "stroke(0) // black outline",
  },
  strokeWeight: {
    name: "strokeWeight",
    description: "Sets the thickness of lines and outlines",
    args: [{ name: "weight", description: "thickness in pixels" }],
    example: "strokeWeight(4) // 4px thick",
  },
  background: {
    name: "background",
    description: "Clears and fills the canvas with a color",
    args: [
      { name: "r", description: "red (0-255) or grayscale" },
      { name: "g", description: "green (0-255), optional" },
      { name: "b", description: "blue (0-255), optional" },
    ],
    example: "background(220) // light gray",
  },
  noFill: {
    name: "noFill",
    description: "Makes shapes transparent (no fill color)",
    args: [],
    example: "noFill()",
  },
  noStroke: {
    name: "noStroke",
    description: "Removes the outline from shapes",
    args: [],
    example: "noStroke()",
  },

  // Transformations
  translate: {
    name: "translate",
    description: "Moves the origin point to a new position",
    args: [
      { name: "x", description: "amount to move right" },
      { name: "y", description: "amount to move down" },
    ],
    example: "translate(200, 200)",
  },
  rotate: {
    name: "rotate",
    description: "Rotates everything drawn after this",
    args: [{ name: "angle", description: "rotation angle in radians" }],
    example: "rotate(PI/4) // 45 degrees",
  },
  scale: {
    name: "scale",
    description: "Scales (resizes) everything drawn after this",
    args: [
      { name: "x", description: "horizontal scale factor" },
      { name: "y", description: "vertical scale factor, optional" },
    ],
    example: "scale(2) // double size",
  },
  push: {
    name: "push",
    description: "Saves the current drawing settings",
    args: [],
    example: "push() // save settings",
  },
  pop: {
    name: "pop",
    description: "Restores previously saved settings",
    args: [],
    example: "pop() // restore settings",
  },

  // Math & random
  random: {
    name: "random",
    description: "Generates a random number",
    args: [
      { name: "min", description: "minimum value (or max if only arg)" },
      { name: "max", description: "maximum value, optional" },
    ],
    example: "random(100) // 0 to 100",
  },
  map: {
    name: "map",
    description: "Converts a number from one range to another",
    args: [
      { name: "value", description: "the number to convert" },
      { name: "start1", description: "original range start" },
      { name: "stop1", description: "original range end" },
      { name: "start2", description: "new range start" },
      { name: "stop2", description: "new range end" },
    ],
    example: "map(mouseX, 0, 400, 0, 255)",
  },
  constrain: {
    name: "constrain",
    description: "Limits a number to stay within a range",
    args: [
      { name: "n", description: "the number to limit" },
      { name: "low", description: "minimum allowed value" },
      { name: "high", description: "maximum allowed value" },
    ],
    example: "constrain(x, 0, 400)",
  },
  dist: {
    name: "dist",
    description: "Calculates distance between two points",
    args: [
      { name: "x1", description: "x of first point" },
      { name: "y1", description: "y of first point" },
      { name: "x2", description: "x of second point" },
      { name: "y2", description: "y of second point" },
    ],
    example: "dist(0, 0, mouseX, mouseY)",
  },
  lerp: {
    name: "lerp",
    description: "Finds a number between two numbers",
    args: [
      { name: "start", description: "first value" },
      { name: "stop", description: "second value" },
      { name: "amt", description: "amount between (0.0 to 1.0)" },
    ],
    example: "lerp(0, 100, 0.5) // returns 50",
  },

  // Text
  text: {
    name: "text",
    description: "Draws text on the screen",
    args: [
      { name: "str", description: "the text to display" },
      { name: "x", description: "x position" },
      { name: "y", description: "y position" },
    ],
    example: 'text("Hello!", 200, 200)',
  },
  textSize: {
    name: "textSize",
    description: "Sets the size of text",
    args: [{ name: "size", description: "font size in pixels" }],
    example: "textSize(32)",
  },
  textAlign: {
    name: "textAlign",
    description: "Sets how text is aligned",
    args: [
      { name: "horizAlign", description: "LEFT, CENTER, or RIGHT" },
      { name: "vertAlign", description: "TOP, CENTER, or BOTTOM" },
    ],
    example: "textAlign(CENTER, CENTER)",
  },

  // Setup
  createCanvas: {
    name: "createCanvas",
    description: "Creates the drawing canvas",
    args: [
      { name: "w", description: "width in pixels" },
      { name: "h", description: "height in pixels" },
    ],
    example: "createCanvas(400, 400)",
  },
  frameRate: {
    name: "frameRate",
    description: "Sets how fast the animation runs",
    args: [{ name: "fps", description: "frames per second" }],
    example: "frameRate(60) // 60 fps",
  },
};

// Parse code and find frequently used functions
export function findFrequentFunctions(code: string, minCount = 4): { func: FunctionDoc; count: number }[] {
  const counts: Record<string, number> = {};

  // Find all function calls
  const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let match;

  while ((match = regex.exec(code)) !== null) {
    const funcName = match[1];
    if (p5Functions[funcName]) {
      counts[funcName] = (counts[funcName] || 0) + 1;
    }
  }

  // Return functions used 4+ times
  return Object.entries(counts)
    .filter(([_, count]) => count >= minCount)
    .map(([name, count]) => ({ func: p5Functions[name], count }))
    .sort((a, b) => b.count - a.count);
}
