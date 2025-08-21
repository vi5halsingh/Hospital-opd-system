let slideIndex = 0;
let slideInterval;

function showSlides() {
  let slides = document.getElementsByClassName("mySlides");
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  slides[slideIndex - 1].style.display = "block";
  slideInterval = setTimeout(showSlides, 3000); // Change image every 3 seconds
}

function startSlideshow() {
  showSlides();
}

function stopSlideshow() {
  clearTimeout(slideInterval);
}

document.addEventListener("DOMContentLoaded", function () {
  let slides = document.getElementsByClassName("mySlides");
  for (let i = 0; i < slides.length; i++) {
    slides[i].addEventListener("mouseover", stopSlideshow);
    slides[i].addEventListener("mouseout", startSlideshow);
  }
  startSlideshow();
});

function loginFunction() {
  const modal = document.getElementById("loginModal");
  const displayStatus = modal.style.display;

  // Toggle the modal visibility when the login button is clicked
  if (displayStatus === "block") {
    modal.style.display = "none";
    // document.body.classList.remove("no-scroll");
  } else {
    modal.style.display = "block";
    // document.body.classList.add("no-scroll");
  }
}
const loginbtn = document.getElementById("loginBtn");
loginbtn.addEventListener("mouseenter", () => {
  loginFunction();
});
const modal = document.getElementById("loginModal");
modal.addEventListener("mouseleave", () => {
  modal.style.display = "none";
});

window.onclick = function (event) {
  const modal = document.getElementById("loginModal");
  const modal_content = document.querySelector(".modal-content");
  const loginBtn = document.getElementById("loginBtn");

  if (event.target !== modal_content && event.target !== loginBtn) {
    modal.style.display = "none";
    document.body.classList.remove("no-scroll");
  }
};

document
  .getElementById("nearest-doctors")
  .addEventListener("click", function () {
    window.location.href = "/nearest-doctors";
  });

async function commingSoon() {
  alert("this service will be comming soon pleas! stay tune with us");
}
async function bookAppointmnet() {
  // window.location.href ='/nearest-doctors';
  window.location.href = "/api/appointment-booking";
}

// Hamburger menu functionality for mobile
const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const mainNav = document.getElementById("mainNav");

function openMenu() {
  mainNav.classList.add("open");
  openMenuBtn.style.setProperty("display", "none");
  closeMenuBtn.style.display = "inline-block";
}
//  if (window.innerWidth > 768) {
//     openMenuBtn.style.display = "none";
//     closeMenuBtn.style.display = "none";
//   }
function closeMenu() {
  mainNav.classList.remove("open");
  openMenuBtn.style.display = "inline-block";
  closeMenuBtn.style.display = "none";
}

if (openMenuBtn && closeMenuBtn && mainNav) {
  openMenuBtn.style.display = "inline-block";
  openMenuBtn.addEventListener("click", openMenu);
  closeMenuBtn.addEventListener("click", closeMenu);

  // Close menu when a nav link is clicked (on mobile)
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) closeMenu();
    });
  });
}
