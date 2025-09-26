// File: password.js
var password = prompt("Password:");

if(password == "kopi"){
    alert("Selamat datang bos!");
} else {
    alert("Password salah, coba lagi!")
    window.location = "dialogpromt.html";
}