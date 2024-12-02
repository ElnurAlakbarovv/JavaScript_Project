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
      return [];
    }
  };

  const updateUser = async (userId, updatedData) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}`, updatedData);
    } catch (error) {
      console.error("İstifadəçi məlumatlarını yeniləmək mümkün olmadı:", error);
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
  const users = await getUsers();
  const products = await getProducts();
  let isLogged = await checkLoggedUser();

  console.log("Products fetched:", products);

  const productContainer = document.querySelector(".product-container");
  const productId = new URLSearchParams(location.search).get("id");
  console.log("Product ID:", productId);

  adminPanel = document.querySelector(".adminPanel");
  let signOut = document.querySelector(".signOut");
  let signUp = document.querySelector(".signUp");
  let basketSup = document.querySelector("sup");
  console.log(basketSup);

  console.log(adminPanel);
  if (isLogged && isLogged.status === "admin") {
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
  const basket = isLogged ? isLogged.basket || [] : [];

  function updateBasketCount() {
    if (isLogged && isLogged.basket) {
      const totalCount = isLogged.basket.reduce(
        (sum, product) => sum + product.count,
        0
      );
      basketSup.textContent = totalCount;
    } else {
      basketSup.textContent = "0";
    }
  }
  updateBasketCount();

  if (!productId) {
    console.error("Product ID URL-dən əldə edilə bilmədi.");
    return;
  }

  const selectedProduct = products.find((product) => product.id === productId);
  console.log("Selected Product:", selectedProduct);

  if (!selectedProduct) {
    console.error("Məhsul tapılmadı!");
    return;
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

    let productIndex = isLogged.wishList.findIndex(
      (product) => product.id === productId
    );

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
      await axios.patch(`${API_URL}/users/${isLogged.id}`, {
        wishList: isLogged.wishList,
      });
      console.log("Wishlist yeniləndi:", isLogged.wishList);
    } catch (error) {
      console.error("Wishlist yenilənmədi:", error);
    }
  }

  let col6Left = document.createElement("div");
  col6Left.classList.add("col-6", "d-flex", "justify-content-between");

  let productSlider = document.createElement("div");
  productSlider.classList.add("product-slider");

  let detailImage = document.createElement("div");
  detailImage.classList.add("detail-image");


  let group25515Img = document.createElement("img");
  group25515Img.src = "./assets/icons/Group 25515.svg";
  group25515Img.alt = "";

  let wishlistBtn = document.createElement("img");
  wishlistBtn.classList.add("wishlistBtn");
  wishlistBtn.src = "./assets/icons/Group 153.svg";
  wishlistBtn.alt = "";


  let imageDiv = document.createElement("div");
  imageDiv.classList.add("image", "text-center");
  let productImage = document.createElement("img");
  productImage.src = selectedProduct.image;
  productImage.alt = "";

  imageDiv.appendChild(productImage);

  detailImage.append( imageDiv);

  col6Left.append(productSlider, detailImage);

  let col6Right = document.createElement("div");
  col6Right.classList.add("col-6");

  let right = document.createElement("div");
  right.classList.add("rigth-text");

  let headText = document.createElement("div");
  headText.classList.add("head-text");

  let productTitle = document.createElement("h1");
  productTitle.textContent = selectedProduct.title;

  headText.appendChild(productTitle);

  let ratingDiv = document.createElement("div");
  ratingDiv.classList.add("raiting");

  let ratingImg = document.createElement("img");
  ratingImg.src = "./assets/icons/Group 25591.svg";
  ratingImg.alt = "";

  ratingDiv.appendChild(ratingImg);

  let categoriesDiv = document.createElement("div");
  categoriesDiv.classList.add("categories");

  let categoryHeading = document.createElement("h3");
  categoryHeading.textContent = selectedProduct.category;

  categoriesDiv.appendChild(categoryHeading);

  let countDiv = document.createElement("div");
  countDiv.classList.add("count", "quantity-selector");

  let btnMinus = document.createElement("button");
  btnMinus.classList.add("btn-minus");
  btnMinus.disabled = true;
  btnMinus.textContent = "-";

  let quantityInput = document.createElement("input");
  quantityInput.type = "text";
  quantityInput.value = "1";

  let btnPlus = document.createElement("button");
  btnPlus.classList.add("btn-plus");
  btnPlus.textContent = "+";

  countDiv.append(btnMinus, quantityInput, btnPlus);

  let detailBtnDiv = document.createElement("div");
  detailBtnDiv.classList.add("detail-btn");

  let addToCartBtn = document.createElement("button");
  addToCartBtn.classList.add("btn", "add-to-cart-btn");
  addToCartBtn.textContent = "Add to card";

  detailBtnDiv.appendChild(addToCartBtn);

  right.append(headText, ratingDiv, categoriesDiv, countDiv, detailBtnDiv);

  col6Right.appendChild(right);

  productContainer.append(col6Left, col6Right);

  console.log(wishlistBtn);

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
  
    let productIndex = isLogged.wishList.findIndex(
      (product) => product.id === productId
    );
  
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
      await axios.patch(`${API_URL}/users/${isLogged.id}`, {
        wishList: isLogged.wishList,
      });
      console.log("Wishlist yeniləndi:", isLogged.wishList);
    } catch (error) {
      console.error("Wishlist yenilənmədi:", error);
    }
  }
  wishlistBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAddWishList(selectedProduct.id, wishlistBtn);
  });
    
  btnMinus = document.querySelector(".btn-minus");
  btnPlus = document.querySelector(".btn-plus");
  quantityInput = document.querySelector(".quantity-selector input");
  addToCartBtn = document.querySelector(".add-to-cart-btn");

  btnPlus.addEventListener("click", () => {
    const currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1;
    btnMinus.removeAttribute("disabled");
  });

  btnMinus.addEventListener("click", () => {
    const currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
      if (currentValue - 1 === 1) btnMinus.setAttribute("disabled", "true");
    }
  });

  addToCartBtn.addEventListener("click", async () => {
    if (!isLogged) {
      toast("Zəhmət olmasa əvvəlcə daxil olun!");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
      return;
    }

    const quantity = parseInt(quantityInput.value);
    const existingProduct = basket.find(
      (product) => product.id === selectedProduct.id
    );

    if (existingProduct) {
      existingProduct.count += quantity;
    } else {
      basket.push({ ...selectedProduct, count: quantity });
    }

    const updatedUser = { ...isLogged, basket };
    await updateUser(isLogged.id, { basket });

    toast(`${quantity} x ${selectedProduct.title} səbətə əlavə edildi!`);
  });

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
});
