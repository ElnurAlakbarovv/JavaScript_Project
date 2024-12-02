import productURL from "./baseURL.js";
import { deleteById, getDatas, postData, patchById } from "./request.js";
import { v4 as uuidv4 } from "https://cdn.jsdelivr.net/npm/uuid@9.0.0/dist/esm-browser/index.js";

let products = await getDatas(productURL);

const createTable = async () => {
  let tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  products.forEach((product) => {
    let tableRow = document.createElement("tr");

    let tdId = document.createElement("td");
    tdId.classList.add("product-id");
    tdId.textContent = product.id;

    let tdImage = document.createElement("td");
    let img = document.createElement("img");
    img.classList.add("product-image");
    img.src = product.image;
    tdImage.appendChild(img);

    let tdTitle = document.createElement("td");
    tdTitle.classList.add("product-title");
    tdTitle.textContent = product.title;

    let tdCategory = document.createElement("td");
    tdCategory.classList.add("product-category");
    tdCategory.textContent = product.category;

    let tdPrice = document.createElement("td");
    tdPrice.classList.add("product-price");
    tdPrice.textContent = `$${product.price}`;

    let actions = document.createElement("td");

    let editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.textContent = "Edit";

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async () => {
      await deleteProduct(product.id);
      products = await getDatas(productURL);
      createTable();
    });

    editButton.addEventListener("click", () => {
      openModal("edit", product);
    });

    actions.append(editButton, deleteButton);
    tableRow.append(tdId, tdImage, tdTitle, tdCategory, tdPrice, actions);
    tbody.appendChild(tableRow);
  });
};

const addProduct = async (e) => {
  e.preventDefault();

  let image = document.querySelector("#image").value;
  let title = document.querySelector("#title").value;
  let category = document.querySelector("#category").value;
  let price = parseFloat(document.querySelector("#price").value);

  let newProduct = {
    id: uuidv4(),
    image,
    title,
    category,
    price,
  };

  await postData(productURL, newProduct);
  products = await getDatas(productURL);
  createTable();
  closeModal();
};

const handleEditSubmit = async (e, product) => {
  e.preventDefault();

  let updatedProduct = {
    image: document.querySelector("#image").value,
    title: document.querySelector("#title").value,
    category: document.querySelector("#category").value,
    price: parseFloat(document.querySelector("#price").value),
  };

  try {
    await patchById(productURL, product.id, updatedProduct);
    products = await getDatas(productURL);
    createTable();
    closeModal();
  } catch (error) {
    console.error("Failed to update product:", error);
    alert("Failed to update product.");
  }
};

const openModal = (type, product = null) => {
  let modal = document.querySelector(".row");
  modal.style.display = "flex";

  const form = document.querySelector(".form");
  const submitButton = document.querySelector(".form button[type='submit']");

  if (type === "add") {
    resetForm();
    submitButton.textContent = "Add Product";
    form.onsubmit = addProduct;
  } else if (type === "edit") {
    document.querySelector("#image").value = product.image;
    document.querySelector("#title").value = product.title;
    document.querySelector("#category").value = product.category;
    document.querySelector("#price").value = product.price;

    submitButton.textContent = "Update Product";
    form.onsubmit = (e) => handleEditSubmit(e, product);
  }
};

const resetForm = () => {
  document.querySelector("#image").value = "";
  document.querySelector("#title").value = "";
  document.querySelector("#category").value = "";
  document.querySelector("#price").value = "";
};

const closeModal = () => {
  let modal = document.querySelector(".row");
  modal.style.display = "none";
};

const deleteProduct = async (productId) => {
  await deleteById(productURL, productId);
};

let addButton = document.querySelector(".add-btn");
addButton.addEventListener("click", () => openModal("add"));

let closeBtn = document.querySelector(".close");
closeBtn.addEventListener("click", closeModal);

createTable();
