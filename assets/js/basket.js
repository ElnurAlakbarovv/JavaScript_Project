document.addEventListener('DOMContentLoaded', () => {
    let isLogged;
    let basket = [];
    let wishlist = [];
    let total = document.querySelector(".total-price");
    let basketSup = document.querySelector("sup");
    let adminPanel = document.querySelector(".adminPanel");
    let signOut = document.querySelector(".signOut");
    let signUp = document.querySelector(".signUp");

    axios.get('http://localhost:3000/users')
        .then(response => {
            let users = response.data;
            isLogged = users.find(user => user.isLogged === true);

            if (isLogged) {
                basket = isLogged.basket || [];
                wishlist = isLogged.wishlist || []; 
                updateBasketSup();
                createBasketItem();

                signUp.classList.add("d-none");
                signOut.classList.remove("d-none");

                if (isLogged.status === "admin") {
                    adminPanel.classList.remove("d-none");
                }
            } else {
                toast("Sistemdə daxil olmuş istifadəçi tapılmadı!");
            }
        })
        .catch(err => {
            console.error("İstifadəçi məlumatları alınmadı:", err);
        });

    function createBasketItem() {
        let totalPrice = 0;
        const basketContainer = document.querySelector(".basket");
        basketContainer.innerHTML = ""; 

        if (basket.length > 0) {
            basket.forEach((product) => {
                let basketItem = document.createElement("div");
                basketItem.classList.add("basket-card");

                let basketImage = document.createElement("div");
                basketImage.classList.add("basket-image");

                let img = document.createElement("img");
                img.src = product.image;
                img.alt = product.title;
                img.style.cursor = "pointer";
                img.addEventListener("click", () => {
                    window.location.href = `product_detail.html?id=${product.id}`;
                });

                basketImage.appendChild(img);

                let textDiv = document.createElement("div");
                textDiv.classList.add("text");

                let productTitle = document.createElement("p");
                productTitle.textContent = product.title.slice(0, 30) + "...";

                let sizeInfo = document.createElement("span");
                sizeInfo.textContent = "Size: XS Color: Grey";

                let deliveryInfo = document.createElement("span");
                deliveryInfo.textContent = "Delivery: 25-32 days";

                let qualityInfo = document.createElement("span");
                qualityInfo.textContent = "Quality";

                let countDiv = document.createElement("div");
                countDiv.classList.add("count");

                let minusBtn = document.createElement("button");
                minusBtn.textContent = "-";
                minusBtn.setAttribute("data-id", product.id);
                minusBtn.addEventListener("click", () => decrementCount(product.id));

                let quantityInput = document.createElement("input");
                quantityInput.type = "text";
                quantityInput.value = product.count;
                quantityInput.disabled = true;

                let plusBtn = document.createElement("button");
                plusBtn.textContent = "+";
                plusBtn.setAttribute("data-id", product.id);
                plusBtn.addEventListener("click", () => incrementCount(product.id));

                countDiv.append(minusBtn, quantityInput, plusBtn);

                textDiv.append(productTitle, sizeInfo, deliveryInfo, qualityInfo, countDiv);

                let priceDiv = document.createElement("div");
                priceDiv.classList.add("price");

                let priceText = document.createElement("p");
                priceText.textContent = `US $${(product.price * product.count).toFixed(2)}`;

                let wishAndRemoveDiv = document.createElement("div");
                wishAndRemoveDiv.classList.add("wish-and-remove");

                let wishIcon = document.createElement("img");
                wishIcon.src = product.isWished ? "./assets/images/Group 25518.png" : "./assets/icons/Group 153.svg";
                wishIcon.alt = "Wishlist";
                wishIcon.style.cursor = "pointer";
                wishIcon.addEventListener("click", () => toggleWishlist(product.id, wishIcon));

                let removeIcon = document.createElement("img");
                removeIcon.src = "./assets/icons/Group 25615.svg";
                removeIcon.alt = "Remove";
                removeIcon.addEventListener("click", () => removeItem(product.id));

                wishAndRemoveDiv.append(wishIcon, removeIcon);

                priceDiv.append(priceText, wishAndRemoveDiv);

                basketItem.append(basketImage, textDiv, priceDiv);
                basketContainer.appendChild(basketItem);

                totalPrice += product.price * product.count;

                if (product.count === 1) {
                    minusBtn.setAttribute("disabled", "true");
                } else {
                    minusBtn.removeAttribute("disabled");
                }
            });
        } else {
            let emptyMessage = document.createElement("p");
            emptyMessage.classList.add("empty-message");
            basketContainer.appendChild(emptyMessage);
        }

        total.textContent = `Total: $${totalPrice.toFixed(2)}`;
    }

    function toggleWishlist(productId, icon) {
        let product = basket.find(p => p.id === productId);

        if (product) {
            product.isWished = !product.isWished; 
            if (product.isWished) {
                icon.src = "./assets/images/Group 25518.png"; 
                wishlist.push(product); 
            } else {
                icon.src = "./assets/icons/Group 153.svg"; 
                wishlist = wishlist.filter(p => p.id !== productId);
            }
        }

        updateBasketOnServer();
    }

    function updateBasketOnServer() {
        if (isLogged) {
            axios.patch(`http://localhost:3000/users/${isLogged.id}`, { basket, wishlist })
                .then(() => {
                    console.log("Səbət və wishlist məlumatları yeniləndi.");
                })
                .catch(err => {
                    console.error("Məlumatlar yenilənmədi:", err);
                });
        }
    }

    function updateBasketSup() {
        const totalCount = basket.reduce((sum, product) => sum + product.count, 0);
        basketSup.textContent = totalCount;
    }
    
    function incrementCount(productId) {
        let exsistProduct = basket.find((product) => product.id === productId);

        if (exsistProduct) {
            exsistProduct.count++;
        }

        updateBasketOnServer();
        createBasketItem();
        updateBasketSup();
    }

    function decrementCount(productId) {
        let exsistProduct = basket.find((product) => product.id === productId);

        if (exsistProduct && exsistProduct.count > 1) {
            exsistProduct.count--;
        }

        updateBasketOnServer();
        createBasketItem();
        updateBasketSup();
    }

    function removeItem(productId) {
        basket = basket.filter((product) => product.id !== productId);
        updateBasketOnServer();
        createBasketItem();
        updateBasketSup();
    }

    function clearBasket() {
        basket = [];
        updateBasketOnServer();
        createBasketItem();
        updateBasketSup();
    }

    function updateBasketSup() {
        const totalCount = basket.reduce((sum, product) => sum + product.count, 0);
        basketSup.textContent = totalCount;
    }

    document.querySelector(".clear-basket-btn").addEventListener("click", clearBasket);


});
