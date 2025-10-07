// ---------- INTRO SCENE ----------
const birthdayText = document.getElementById('birthday-text');
const kissEmoji = document.getElementById('kiss-emoji');
const kissSound = document.getElementById('kiss-sound');
const kissExitSound = document.getElementById('kiss-exit-sound');
const clickStart = document.getElementById('click-start');
const photoContainer = document.querySelector('.photo-container');

let clickCount = 0;

document.getElementById('intro-scene').addEventListener('click', () => {
  clickCount++;

  if (clickCount === 1) {
    clickStart.style.display = 'none';

    const tl1 = gsap.timeline();
    tl1.to(birthdayText, { duration: 1.5, opacity: 1, scale: 1.2, ease: "power2.out" });
    tl1.to(photoContainer, { duration: 1.5, opacity: 1, scale: 1, ease: "power2.out" }, "+=0.3");
    tl1.add(() => createConfetti(300));
    tl1.to(kissEmoji, { duration: 1, opacity: 1, scale: 1.5, x: 0, y: 0, ease: "back.out(1.7)", onStart: () => kissSound.play() }, "+=0.5");
  } else if (clickCount === 2) {
    const tl2 = gsap.timeline();
    tl2.add(() => kissExitSound.play());
    tl2.to(kissEmoji, { duration: 1.5, scale: 25, opacity: 0, ease: "power2.in" });
    tl2.to(birthdayText, { duration: 1.5, opacity: 0, ease: "power2.in" }, "-=1.5");
    tl2.to(photoContainer, { duration: 1.5, opacity: 0, ease: "power2.in", onComplete: () => startSlideshow() }, "-=1.5");
  }
});

// ---------- CONFETTI ----------
function createConfetti(count) {
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    document.body.appendChild(confetti);

    const x = Math.random() * window.innerWidth;
    const y = -20;
    const rotation = Math.random() * 360;
    const size = Math.random() * 10 + 5;
    const color = `hsl(${Math.random() * 360}, 80%, 60%)`;

    confetti.style.left = x + 'px';
    confetti.style.top = y + 'px';
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    confetti.style.background = color;
    confetti.style.transform = `rotate(${rotation}deg)`;

    gsap.to(confetti, { duration: Math.random() * 2 + 2, y: window.innerHeight + 50, rotation: Math.random() * 720, opacity: 0, ease: "power1.out", onComplete: () => confetti.remove() });
  }
}

// ---------- SLIDESHOW ----------
function startSlideshow() {
  const slideshow = document.getElementById('slideshow-scene');
  const slides = document.querySelectorAll('.slide');
  const clickNext = document.getElementById('click-next');
  const roomScene = document.getElementById('room-scene');

  slideshow.style.pointerEvents = 'auto';
  const tl = gsap.timeline();
  tl.to(slideshow, { duration: 1, opacity: 1 });

  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      gsap.to(slide, { duration: 0.5, opacity: i === index ? 1 : 0 });
      gsap.to(slide.querySelector('.caption'), { duration: 0.5, opacity: i === index ? 1 : 0 });
    });
  }

  function autoPlaySlides() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      showSlide(currentSlide);
      setTimeout(autoPlaySlides, 2500);
    } else {
      clickNext.style.pointerEvents = 'auto';
      clickNext.style.opacity = 1;
    }
  }

  showSlide(currentSlide);
  setTimeout(autoPlaySlides, 2500);

  clickNext.addEventListener('click', () => {
    gsap.to(slideshow, { duration: 1, opacity: 0, pointerEvents: 'none' });
    gsap.to(roomScene, { duration: 1, opacity: 1, pointerEvents: 'auto', onComplete: () => showNextBox() });
  });
}

// ---------- ROOM SCENE BOXES ----------
const boxes = [
  { id: 'box1', gif: 'img/flower.gif', final: { top: '20px', right: '20px' } },
  { id: 'box2', gif: 'img/heart.gif', final: { top: '20px', left: '20px' } },
  { id: 'box3', gif: 'img/player.gif', final: { bottom: '20px', left: '20px' }, audio: 'music/favorite-song.mp3' },
  { id: 'box4', gif: 'img/letter.jpeg', text: "💌 Happy Birthday, My Love!" }
];

const popSound = document.getElementById('pop-sound');
let boxIndex = 0;

function showNextBox() {
  if (boxIndex >= boxes.length) return;

  const currentBox = document.getElementById(boxes[boxIndex].id);
  currentBox.style.display = 'flex';

  currentBox.addEventListener('click', () => {
    popSound.currentTime = 0;
    popSound.play();
    createConfetti(100);

    const boxData = boxes[boxIndex];
    const gif = document.createElement('img');
    gif.src = boxData.gif;
    gif.style.position = 'absolute';
    const rect = currentBox.getBoundingClientRect();
    gif.style.left = rect.left + 'px';
    gif.style.top = rect.top + 'px';
    gif.style.width = rect.width + 'px';
    gif.style.height = rect.height + 'px';
    gif.style.zIndex = 20;
    document.body.appendChild(gif);

    if (boxData.id === 'box4') {
      // Envelope handling
      gsap.to(gif, {
        duration: 1.5,
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        width: '300px',
        height: '200px',
        ease: "power2.out",
        onComplete: () => {
          gif.style.cursor = 'pointer';
          gif.addEventListener('click', () => openFullscreenLetter(gif));
        }
      });
    } else {
      // Normal boxes
      gsap.to(gif, {
        duration: 1.5,
        left: boxData.final.left || '',
        right: boxData.final.right || '',
        top: boxData.final.top || '',
        bottom: boxData.final.bottom || '',
        width: '200px',
        height: '200px',
        scale: 1,
        ease: "power2.out"
      });

      // Play audio if any
      if (boxData.audio) {
        const audio = new Audio(boxData.audio);
        audio.loop = true;
        audio.play();
      }
    }

    currentBox.style.display = 'none';
    boxIndex++;
    if (boxIndex < boxes.length) setTimeout(showNextBox, 700);
  }, { once: true });
}

// ---------- FULLSCREEN LETTER (Responsive & Beautiful) ----------
function openFullscreenLetter(envelopeImg) {
  // Fade out envelope
  gsap.to(envelopeImg, { duration: 0.8, opacity: 0, onComplete: () => envelopeImg.remove() });

  // Background letter image (portrait fit: top & bottom fill, center aligned)
  const bg = document.createElement('img');
  bg.src = 'img/page.jpg';
  bg.style.position = 'fixed';
  bg.style.top = '0';
  bg.style.bottom = '0';
  bg.style.left = '50%';
  bg.style.transform = 'translateX(-50%)';
  bg.style.height = '100vh'; // touches top & bottom
  bg.style.width = 'auto';   // keeps aspect ratio
  bg.style.objectFit = 'contain';
  bg.style.zIndex = 998;
  document.body.appendChild(bg);

  // Text container same size as background
  const textWrapper = document.createElement('div');
  textWrapper.style.position = 'fixed';
  textWrapper.style.top = '0';
  textWrapper.style.left = '50%';
  textWrapper.style.transform = 'translateX(-50%)';
  textWrapper.style.height = '100vh';
  textWrapper.style.width = 'auto';
  textWrapper.style.display = 'flex';
  textWrapper.style.justifyContent = 'center';
  textWrapper.style.alignItems = 'center';
  textWrapper.style.flexDirection = 'column';
  textWrapper.style.padding = '8vh 10vw'; // ensures margin inside the page edges
  textWrapper.style.zIndex = 999;
  textWrapper.style.pointerEvents = 'none'; // no interference with click
  document.body.appendChild(textWrapper);

  // The actual letter text
  const letter = document.createElement('p');
  letter.style.fontFamily = "'Dancing Script', cursive";
  letter.style.color = '#6b4226';
  letter.style.textAlign = 'left';
  letter.style.whiteSpace = 'pre-wrap';
  letter.style.lineHeight = '1.6';
  letter.style.letterSpacing = '0.5px';
  letter.style.textShadow = '1px 1px 4px rgba(0,0,0,0.2)';
  letter.style.maxWidth = '90%';
  letter.style.opacity = 0;
  letter.style.margin = 0;
  textWrapper.appendChild(letter);

  // Responsive font scaling
  const resizeFont = () => {
    const scale = Math.min(window.innerWidth / 900, window.innerHeight / 1600);
    const baseSize = window.innerWidth < 500 ? 1.3 : window.innerWidth < 1024 ? 1.6 : 1.9;
    letter.style.fontSize = `${baseSize * scale}rem`;
  };

  resizeFont();
  window.addEventListener('resize', resizeFont);

  // 🔥 Your full text goes here 🔥
  const text =
    `Hiee Babyy.....💋

First... Happyyyyyy Birthdayyyyyyy💋💗
Isse aage... ni pata... I'm veryyy veryyy proud of youuuu... You’re justtt soo perfecttttt there’s literally nothing to say tht… Youuuu Soooooo BEAUTIFUL tht u don’t even knowww wht MAGIC you do when you jst smile at me 😭❤️...
How do you evn do ittttt?? Every time u laugh, I swear the world gets brighter 😭💖. You're the MOST BEAUTIFUL... INFACT THE ONLY BEAUTIFUL GIRL IN THIS WORLD😭... YOU'RE THE BESTTTTT✨.... YOU'RE SOO SUPENTOFANTASTICABSOLUTEFREAKINGOLIGILYGORGEOUS💋❤️✨... The most amazing... mind-blowingly beautiful... ridiculously perfect human on the entire planet 🌎💞...
The one who makes my heart do backflips every time YOU smile 😭💓
The queen of my world... the spark in my life.... the reason I grin like an idiot for no reason 😭💗
The laughter.... the chaos.... the magic!! YOU ARE literally EVERYTHING and more thn I ever dreamed of 💖🔥
If there was an award for being insanely perfect.... you’d have the trophy... the crown, the parade.... AND A MILLION FIREWORKS in YOUR HONOR🔥🎆😭✨❤️💋🥹💗....
Pleaseee stayyy as you areee.... GROW STRONGER.... SHARPER and.... BRIGHTER... YOU'RE THE BESTTTTTT💋💗
HAPPYYY BIRTHDAYYY ONCEEE AGAINNNNN BABYYYYY🥹💋💗
I LOVEEEE YOU MERI JAANNNN💋❤️`;

  // Fade in and type
  gsap.to(letter, { duration: 1, opacity: 1, ease: "power2.out" });

  let i = 0;
  const type = setInterval(() => {
    letter.innerText += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(type);
      showCloseButton(textWrapper, bg);
    }
  }, 45);
}



// ---------- CLOSE BUTTON ----------
function showCloseButton(letter, bg) {
  const btn = document.createElement('button');
  btn.innerText = 'Close ✖';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.padding = '10px 20px';
  btn.style.fontSize = '1rem';
  btn.style.cursor = 'pointer';
  btn.style.zIndex = 1000;
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.background = '#d81b60';
  btn.style.color = 'white';
  btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
  btn.style.transition = '0.3s';
  btn.onmouseover = () => btn.style.background = '#ad1457';
  btn.onmouseout = () => btn.style.background = '#d81b60';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    letter.remove();
    bg.remove();
    btn.remove();

    // Re-add envelope
    const envelope = document.createElement('img');
    envelope.src = 'img/letter.jpeg';
    envelope.style.position = 'fixed';
    envelope.style.left = '50%';
    envelope.style.top = '50%';
    envelope.style.transform = 'translate(-50%, -50%)';
    envelope.style.width = '300px';
    envelope.style.height = '200px';
    envelope.style.zIndex = 20;
    document.body.appendChild(envelope);

    envelope.style.cursor = 'pointer';
    envelope.addEventListener('click', () => openFullscreenLetter(envelope));
  }, { once: true });
}
