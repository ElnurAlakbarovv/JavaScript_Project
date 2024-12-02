document.addEventListener('DOMContentLoaded', () => {
    let form = document.querySelector("form");
    let username = document.querySelector('#username');
    let password = document.querySelector("#password");

    function login(e) {
        e.preventDefault();

        let userInput = username.value.trim();

        if (!validateUsernameOrEmail(userInput)) {
            toast("İstifadəçi adı və ya email düzgün formatda deyil.");
            return;
        }

        if (!validatePassword(password.value)) {
            toast("Şifrə minimum 8 simvol və düzgün qaydalara uyğun olmalıdır.");
            return;
        }

        axios.get('http://localhost:3000/users')
            .then(response => {
                const users = response.data;

                let findUser = users.find(
                    (user) =>
                        (user.username === userInput || user.email === userInput) &&
                        user.password === password.value
                );

                if (findUser) {
                    axios.patch(`http://localhost:3000/users/${findUser.id}`, { isLogged: true })
                        .then(() => {
                            toast("İstifadəçi uğurla daxil oldu!");
                            
                                window.location.pathname = "/index.html";
                          
                        })
                        .catch(err => {
                            console.error("Giriş zamanı xəta baş verdi:", err);
                            toast("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
                        });
                } else {
                    handleLoginAttempts(userInput);
                }
            })
            .catch(err => {
                console.error("İstifadəçi məlumatları alınmadı:", err);
                toast("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
            });
    }

    function handleLoginAttempts(userInput) {
        axios.get('http://localhost:3000/loginAttempts')
            .then(response => {
                let attempts = response.data.find(attempt => attempt.username === userInput);

                if (!attempts) {
                    axios.post('http://localhost:3000/loginAttempts', {
                        username: userInput,
                        count: 1,
                        lockedUntil: 0
                    });
                    toast(`İstifadəçi adı və ya şifrə yalnışdır. 2 cəhd qalıb.`);
                } else {
                    if (attempts.lockedUntil > Date.now()) {
                        let waitTime = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
                        toast(`Hesab müvəqqəti bağlanıb. ${waitTime} dəqiqə gözləyin.`);
                    } else {
                        attempts.count += 1;

                        if (attempts.count >= 3) {
                            attempts.lockedUntil = Date.now() + 15 * 60 * 1000;
                            toast("Hesab müvəqqəti olaraq 15 dəqiqəlik bağlandı.");
                        } else {
                            let remainingAttempts = 3 - attempts.count;
                            toast(`İstifadəçi adı və ya şifrə yalnışdır. ${remainingAttempts} cəhd qalıb.`);
                        }

                        axios.patch(`http://localhost:3000/loginAttempts/${attempts.id}`, attempts);
                    }
                }
            })
            .catch(err => {
                console.error("Login cəhdləri alınmadı:", err);
            });
    }

    function validateUsernameOrEmail(input) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        const emailRegex = /^\S+@\S+\.\S+$/;
        return usernameRegex.test(input) || emailRegex.test(input);
    }

    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;
        return passwordRegex.test(password);
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

    form.addEventListener("submit", login);
});
