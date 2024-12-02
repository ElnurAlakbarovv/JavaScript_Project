document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000";
    let isLogged;
    let users = [];
    let products = [];

    const adminPanel = document.querySelector(".adminPanel");
    const signOut = document.querySelector(".signOut");
    const signUp = document.querySelector(".signUp");
    const basketSup = document.querySelector("sup");

    async function fetchData() {
        try {
            const [usersResponse, productsResponse] = await Promise.all([
                axios.get(`${API_URL}/users`),
                axios.get(`${API_URL}/products`)
            ]);

            users = usersResponse.data;
            products = productsResponse.data;

            isLogged = users.find(user => user.isLogged === true);

            console.log(isLogged);

            if (!isLogged) {
                toasts("Please login to access your wishlist");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
                return;
            }

            if (isLogged.status === "admin") {
                adminPanel.classList.remove("d-none");
            } else {
                adminPanel.classList.add("d-none");
            }
            if (isLogged) {
                signOut.classList.remove("d-none");
                signUp.classList.add("d-none");
              } else {
                signOut.classList.add("d-none");
                signUp.classList.remove("d-none");
              }

            if (isLogged.wishList && isLogged.wishList.length > 0) {
                isLogged.wishList.forEach(product => {
                    createWishlistItem(product);
                });
            } else {
                const empty = document.createElement("h3");
                empty.classList.add("empty");   
                const wishlistContainer = document.querySelector(".wishlist");
                wishlistContainer.appendChild(empty);
            }

            updateBasketCount();
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    }

    fetchData();

    function createWishlistItem(product) {
        const card = document.createElement("div");
        card.classList.add("bag_card");
        card.addEventListener("click", () => {
            window.location.href = `product-detail.html?id=${product.id}`;
        });

        const col = document.createElement("div");
        col.classList.add("col-md-6", "col-lg-4");

        const head = document.createElement("div");
        head.classList.add("head");

        const perc_img = document.createElement("img");
        const wishlistBtn = document.createElement("img");

        if (isLogged && isLogged.wishList.some(item => item.id === product.id)) {
            wishlistBtn.src = "./assets/images/Group 25518.png";
        } else {
            wishlistBtn.src = "./assets/icons/Group 153.svg";
        }

        wishlistBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleAddWishList(product.id, wishlistBtn);
        });

        const image = document.createElement("div");
        image.classList.add("image", "text-center");

        const card_img = document.createElement("img");
        card_img.src = product.image;

        const title = document.createElement("div");
        title.classList.add("card_text");

        const p = document.createElement("p");
        p.textContent = product.title.slice(0, 30) + " ...";

        const card_price = document.createElement("div");
        card_price.classList.add("card_price");

        const price = document.createElement("p");
        price.textContent = `$ ${product.price}`;
        const span = document.createElement("span");
        span.textContent = product.category;

        const button = document.createElement("button");
        button.classList.add("btn", "add_to_card");
        button.textContent = "Add to cart";
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            addBasket(product.id);
        });

        head.append(perc_img, wishlistBtn);
        image.append(card_img);
        title.append(p);
        card_price.append(price, span);
        card.append(head, image, title, card_price, button);
        col.append(card);

        const cards = document.querySelector(".wishlist");
        cards.append(col);
    }

    async function toggleAddWishList(productId, heartElement) {
        if (!isLogged) {
            window.location.pathname = "/login.html";
            return;
        }

        const userIndex = users.findIndex(user => user.id === isLogged.id);
        if (userIndex === -1) return;

        if (!isLogged.wishList) isLogged.wishList = [];

        const productIndex = isLogged.wishList.findIndex(product => product.id === productId);

        if (productIndex !== -1) {
            isLogged.wishList.splice(productIndex, 1);
            heartElement.src = "./assets/icons/Group 153.svg";
        } else {
            const product = products.find(product => product.id === productId);
            if (product) {
                isLogged.wishList.push(product);
                heartElement.src = "./assets/images/Group 25518.png";
            }
        }

        users[userIndex] = isLogged;

        try {
            await axios.patch(`${API_URL}/users/${isLogged.id}`, { wishList: isLogged.wishList });
            console.log("Wishlist updated:", isLogged.wishList);
        } catch (error) {
            console.error("Wishlist update failed:", error);
        }
    }

    async function addBasket(productId) {
        if (!isLogged) {
            window.location.pathname = "/login.html";
            return;
        }

        const userIndex = users.findIndex(user => user.id === isLogged.id);
        if (userIndex === -1) return;

        let basket = isLogged.basket || [];
        const existingProduct = basket.find(product => product.id === productId);

        if (existingProduct) {
            existingProduct.count++;
        } else {
            let product = products.find(product => product.id === productId);
            if (!product) return;

            product = { ...product, count: 1 };
            basket.push(product);
        }

        isLogged.basket = basket;
        users[userIndex] = isLogged;

        try {
            await axios.patch(`${API_URL}/users/${isLogged.id}`, { basket });
            console.log("Basket updated:", basket);
            updateBasketCount();
        } catch (error) {
            console.error("Basket update failed:", error);
        }
    }

    function updateBasketCount() {
        if (isLogged && isLogged.basket) {
            const totalCount = isLogged.basket.reduce((sum, product) => sum + product.count, 0);
            basketSup.textContent = totalCount;
        } else {
            basketSup.textContent = "0";
        }
    }

    signOut.addEventListener("click", async () => {
        if (isLogged) {
            try {
                await axios.patch(`${API_URL}/users/${isLogged.id}`, { isLogged: false });
                console.log("User logged out");
                window.location.reload();
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }
    });

    function toasts(text) {
        Toastify({
            text: text,
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast();
    }
});
