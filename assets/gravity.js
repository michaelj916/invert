const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const compressor = audioContext.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
compressor.knee.setValueAtTime(20, audioContext.currentTime);
compressor.ratio.setValueAtTime(1, audioContext.currentTime);
compressor.attack.setValueAtTime(11, audioContext.currentTime);
compressor.release.setValueAtTime(10.25, audioContext.currentTime);
compressor.connect(audioContext.destination);

const Engine = Matter.Engine,
  Events = Matter.Events,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies;

let [w, h] = [window.innerWidth, window.innerHeight];

const engine = Engine.create();

//engine.enableSleeping = true;
engine.positionIterations = 3;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: w,
    height: h,
    background: "transparent",
    wireframes: false,
  },
});

engine.world.gravity.y = -1;

const ttop = Bodies.rectangle(0, -20, w * 2, 40, { isStatic: true }),
  left = Bodies.rectangle(-10, 0, 20, h * 2, { isStatic: true }),
  right = Bodies.rectangle(w, 0, 10, h * 2, { isStatic: true }),
  bottom = Bodies.rectangle(0, h + 20, w * 2, 40, { isStatic: true });

const frame = [ttop, left, right, bottom];

const rnd = (from, to) => Math.random() * (to - from) + from;
const rr = Math.round((window.innerWidth * window.innerHeight) / 3700);
const res = Math.max(Math.min(rr, 500), 50);
const bodies = [];
for (let i = 0; i < res; i++) {
  const x = rnd(0, w);
  const y = rnd(h * 0.50, h * 0.50);
  let xx = rnd(1, 50);
  let yy = rnd(1, 50);
  if (Math.random() > 1 / Math.PI) {
    xx = rnd(1, 100);
    yy = rnd(1, 100);
  }
  const tmp = Bodies.rectangle(x, y, xx, yy);
  // tmp.frictionAir = Math.random() * 1;
  //Matter.Body.rotate(tmp, Math.random() * 3);
  Matter.Body.rotate(tmp, Math.random() * 3);
  //tmp.mass = Math.random() * 0.4;
  //tmp.density = Math.random();
  //tmp.render.fillStyle = Math.random() > 0.8 ? "white" : "orangered";
  tmp.render.fillStyle = "#e9d3f5";
  if (Math.random() > 0.8) {
    tmp.render.fillStyle = "#feffde";
  }
  bodies.push(tmp);
}

World.add(engine.world, [...bodies, ...frame]);
Engine.run(engine);
Render.run(render);

const flip = (_) => {
  bodies.map((b) => (b.isStatic = Math.random() > 1.2));
  engine.world.gravity.y = engine.world.gravity.y * -0.7;
  //engine.timing.timeScale = 0.1;
};
flip();

setInterval(flip, 100 * 1000 );

const callback = (e) => {
  //console.log(e);
  if (e.pairs[0].collision.collided) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(
      //e.pairs.filter((f) => f.collision.depth > 5.5).length * 504 + 3,
      300,
      audioContext.currentTime + 0.1
    );
    //Math.random() * 1500,
    //e.pairs[0].collision.axisBody.angle * 30;
    oscillator.connect(compressor);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
};

//Events.on(engine, "collisionEnd", callback);

document.body.addEventListener("click", flip);

const init = (_) => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
};
document.body.addEventListener("click", init, { once: true });

const resize = (_) => {
  let [w, h] = [window.innerWidth, window.innerHeight];

  //Matter.Body.setPosition(ttop, { x: w, y: 0 });
  left.height = h * 2;
  //Matter.Body.setPosition(left, { x: 10, y: 0, h: h * 2 });

  Matter.Body.setPosition(right, { x: w, y: 0 });
  Matter.Body.set(bottom, { x: 0, y: h, w: w * 2 });

  //Matter.Body.set(right, (x: w), (y: 0), (width: 10), (height: h));
  // Matter.Body.set(right, { x: w - 20 });

  //console.log(right);
  //Matter.Body.set(right, "position.x", w - 20);

  render.canvas.width = w;
  render.canvas.height = h;
};

window.onresize = resize;
