document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "http://localhost:3000"; 
    let user = null; 

    const getUsers = async () => {
        try {
            let response = await axios.get(`${API_URL}/users`);
            return response.data;
        } catch (error) {
            console.error("İstifadəçiləri yükləmək mümkün olmadı:", error);
        }
    };

    const getProducts = async () => {
        try {
            let response = await axios.get(`${API_URL}/products`);
            return response.data;
        } catch (error) {
            console.error("Məhsulları yükləmək mümkün olmadı:", error);
        }
    };

    const checkLoggedUser = async () => {
        try {
            let users = await getUsers();
            return users.find((user) => user.isLogged === true);
        } catch (error) {
            console.error("Cari istifadəçini yoxlamaq mümkün olmadı:", error);
            return null;
        }
    };

    let users = await getUsers();
    let products = await getProducts();
    let filteredProducts = [...products];
    let isLogged = await checkLoggedUser();

    let azBtn = document.querySelector(".az");
    let zaBtn = document.querySelector(".za");
    let searchinput = document.querySelector(".search-input");
    let searchBtn = document.querySelector(".search-btn");
    let lowToHighBtn = document.querySelector(".low-to-high");
    let highToLowBtn = document.querySelector(".high-to-low");
    let signOut = document.querySelector(".signOut");
    let signUp = document.querySelector(".signUp");
    let basketSup = document.querySelector("sup");
    let adminPanel = document.querySelector(".adminPanel");
    

  lowToHighBtn.addEventListener("click", () => {
    filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
    document.querySelector(".cards").innerHTML = "";
    createUserCard(filteredProducts);
  });

  highToLowBtn.addEventListener("click", () => {
    filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
    document.querySelector(".cards").innerHTML = "";
    createUserCard(filteredProducts);
  });

  azBtn.addEventListener("click", () => {
    filteredProducts = filteredProducts.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    document.querySelector(".cards").innerHTML = "";
    createUserCard(filteredProducts);
  });

  zaBtn.addEventListener("click", () => {
    filteredProducts = filteredProducts.sort((a, b) =>
      b.title.localeCompare(a.title)
    );
    document.querySelector(".cards").innerHTML = "";
    createUserCard(filteredProducts);
  });

  searchBtn.addEventListener("click", () => {
    let searchvalue = searchinput.value.trim();
    filteredProducts = products.filter((product) =>
      product.title.toLowerCase().includes(searchvalue.toLowerCase())
    );
    let limitedProducts = filteredProducts.slice(0, 3);
    document.querySelector(".cards").innerHTML = "";
    createUserCard(limitedProducts);
    filteredProducts = [...limitedProducts];
  });

 
  searchinput.addEventListener("input", () => {
    let searchvalue = searchinput.value.trim();
    filteredProducts = products.filter((product) => product.title.toLowerCase().includes(searchvalue.toLowerCase()))
    document.querySelector(".cards").innerHTML = ""
    createUserCard(filteredProducts);
  })
    if (isLogged) {
        signOut.classList.remove("d-none");
        signUp.classList.add("d-none");
    } else {
        signOut.classList.add("d-none");
        signUp.classList.remove("d-none");
    }
    if (isLogged && isLogged.status === "admin") {
        adminPanel.classList.remove("d-none");
      } else {
        adminPanel.classList.add("d-none");
      }

    function updateBasketCount() {
        if (isLogged && isLogged.basket) {
            const totalCount = isLogged.basket.reduce((sum, product) => sum + product.count, 0);
            basketSup.textContent = totalCount;
        } else {
            basketSup.textContent = "0";
        }
    }

    updateBasketCount();

    signOut.addEventListener("click", async () => {
        if (isLogged) {
            try {
                await axios.patch(`${API_URL}/users/${isLogged.id}`, { isLogged: false });
                console.log("İstifadəçi çıxış etdi");
                window.location.reload(); 
            } catch (error) {
                console.error("Çıxış zamanı səhv baş verdi:", error);
            }
        }
    });

    async function addBasket(productId) {
        if (!isLogged) {
            window.location.pathname = "/login.html";
            return;
        }

        let userIndex = users.findIndex((user) => user.id === isLogged.id);
        if (userIndex === -1) return;

        let basket = isLogged.basket || [];
        let existingProduct = basket.find((product) => product.id === productId);

        if (existingProduct) {
            existingProduct.count++;
        } else {
            let product = products.find((product) => product.id === productId);
            if (!product) return;

            product = { ...product, count: 1 }; 
            basket.push(product);
        }

        isLogged.basket = basket;
        users[userIndex] = isLogged;

        try {
            await axios.patch(`${API_URL}/users/${isLogged.id}`, { basket });
            console.log("Səbət yeniləndi:", basket);
            updateBasketCount(); 
        } catch (error) {
            console.error("Səbəti yeniləmək mümkün olmadı:", error);
        }
    }

    function createUserCard(products) {
        products.forEach((product) => {
            let card = document.createElement("div");
            card.classList.add("bag_card");
            card.addEventListener("click", () => {
                window.location.href = `product-detail.html?id=${product.id}`;
            });

            let col = document.createElement("div");
            col.classList.add("col-md-6", "col-lg-4");

            let head = document.createElement("div");
            head.classList.add("head");

            let perc_img = document.createElement("img");
            let wishlistBtn = document.createElement("img");

            if (isLogged && isLogged.wishList && isLogged.wishList.some((item) => item.id === product.id)) {
                wishlistBtn.src = "./assets/images/Group 25518.png";
            } else {
                wishlistBtn.src = "./assets/icons/Group 153.svg";
            }

            wishlistBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleAddWishList(product.id, wishlistBtn);
            });

            let image = document.createElement("div");
            image.classList.add("image", "text-center");

            let card_img = document.createElement("img");

            let title = document.createElement("div");
            title.classList.add("card_text");

            let p = document.createElement("p");

            let card_price = document.createElement("div");
            card_price.classList.add("card_price");

            let price = document.createElement("p");
            let span = document.createElement("span");

            let button = document.createElement("button");
            button.classList.add("btn", "add_to_card");
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                addBasket(product.id);
            });

            button.textContent = "Add to cart";
            perc_img.src = "./assets/icons/Group 25515.svg";
            card_img.src = product.image;

            p.textContent = product.title.slice(0, 30) + " ...";
            span.textContent = product.category;
            price.textContent = `$ ${product.price}`;

            head.append(perc_img, wishlistBtn);
            image.append(card_img);
            title.append(p);
            card_price.append(price, span);
            card.append(head, image, title, card_price, button);
            col.append(card);

            let cards = document.querySelector(".cards");
            cards.append(col);
        });
    }

    async function toggleAddWishList(productId, heartElement) {
        if (!isLogged) {
            window.location.pathname = "/login.html";
            return;
        }

        let userIndex = users.findIndex((user) => user.id === isLogged.id);
        if (userIndex === -1) return;

        if (!isLogged.wishList) {
            isLogged.wishList = [];
        }

        let productIndex = isLogged.wishList.findIndex((product) => product.id === productId);

        if (productIndex !== -1) {
            isLogged.wishList.splice(productIndex, 1);
            heartElement.src = "./assets/icons/Group 153.svg";
        } else {
            let product = products.find((product) => product.id === productId);
            if (product) {
                isLogged.wishList.push(product);
                heartElement.src = "./assets/images/Group 25518.png";
            }
        }

        users[userIndex] = isLogged;

        try {
            await axios.patch(`${API_URL}/users/${isLogged.id}`, { wishList: isLogged.wishList });
            console.log("Wishlist yeniləndi:", isLogged.wishList);
        } catch (error) {
            console.error("Wishlist yenilənmədi:", error);
        }
    }

    createUserCard(products);
});
