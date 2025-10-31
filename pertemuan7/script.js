const tombolBuka = document.getElementById("tombolBuka");
const tombolTutup = document.getElementById("tombolTutup");
const modalOverlay = document.getElementById("modalOverlay");

tombolBuka.addEventListener("click", () => {
    modalOverlay.classList.add("popup-tampil");
});

tombolTutup.addEventListener("click", () => {
    modalOverlay.classList.remove("popup-tampil");
});

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove("popup-tampil");
    }
});