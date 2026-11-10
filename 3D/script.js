const carousel = document.getElementById("carousel");
const items = document.querySelectorAll(".item");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const radius = 350;
let currAngle = 0;

const angleStep = 360 / items.length;
items.forEach((item, index) => {
  const angle = angleStep * index;
  item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
});

function rotateCarousel(direction) {
  currAngle += direction * angleStep;
  carousel.style.transform = `rotateY(${currAngle * -1}deg)`;
}

prevBtn.addEventListener("click", () => rotateCarousel(-1));
nextBtn.addEventListener("click", () => rotateCarousel(1));

/* Uncomment to automatically go to next slide every 5 seconds
setInterval(() => {
  nextBtn.click();
}, 5000);
*/