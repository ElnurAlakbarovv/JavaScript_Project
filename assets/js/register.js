document.addEventListener("DOMContentLoaded", () => {
    let form = document.querySelector("form");
    let name = document.querySelector("#name");
    let surname = document.querySelector("#surname");
    let username = document.querySelector("#username");
    let email = document.querySelector("#email");
    let password = document.querySelector("#password");
    let currentPassword = document.querySelector("#currentpassword");
  
    let isLogged = false;
  
    const API_URL = "http://localhost:3000/users";
  
    async function register(e) {
      e.preventDefault();
  
      if (!validateInputs()) return;
  
      try {
        let response = await axios.get(API_URL);
        let users = response.data;
  
        let uniqueUser = users.some(
          (user) => user.username === username.value || user.email === email.value
        );
  
        if (!uniqueUser) {
          let newUsr = {
            name: name.value,
            surname: surname.value,
            username: username.value,
            email: email.value,
            password: password.value,
            isLogged: isLogged,
            wishList: [],
            basket: [],
            status:"member"
          };
  
          await axios.post(API_URL, newUsr);
  
            
            window.location.pathname = "/login.html";
        } else {
          toast("İstifadəçi artıq mövcuddur");
        }
      } catch (error) {
        console.error("Xəta baş verdi:", error);
        toast("Serverdə xəta baş verdi. Yenidən cəhd edin.");
      }
    }
  
    function validateInputs() {
      let isValid = true;
  
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username.value)) {
        toast(
          "İstifadəçi adı 3-20 simvol arasında olmalı və yalnız əlifba, rəqəm, alt xətt və tire olmalıdır."
        );
        isValid = false;
      }
  
      if (!/^\S+@\S+\.\S+$/.test(email.value)) {
        toast("E-poçt düzgün formatda deyil.");
        isValid = false;
      }
  
      if (checkPasswordStrength(password.value) !== "Güclü") {
        toast(
          "Şifrə güclü olmalıdır: ən azı bir böyük hərf, bir kiçik hərf, bir rəqəm və bir xüsusi simvol daxil edin."
        );
        isValid = false;
      }
  
      if (password.value !== currentPassword.value) {
        toast("Şifrə təsdiqi uyğun deyil.");
        isValid = false;
      }
  
      return isValid;
    }
  
    function checkPasswordStrength(password) {
      let strength = "Zəif";
      let color = "red";
  
      if (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[@#$%^&*]/.test(password)
      ) {
        strength = "Güclü";
        color = "green";
      } else if (password.length >= 6) {
        strength = "Orta";
        color = "orange";
      }
      return strength;
    }
  
    function toast(message) {
      Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
      }).showToast();
    }
  
    password.addEventListener("input", () => {
      checkPasswordStrength(password.value);
    });
  
    form.addEventListener("submit", register);
  });
  