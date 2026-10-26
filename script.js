
/* ========================================
   AR FURNITURE DESIGNER
   Møbelkatalog + egne 3D-modeller
======================================== */

// FERDIG MØBELKATALOG
const furniture = [
    {
        id: 1,
        name: "Moderne sofa",
        category: "sofa",
        description: "En moderne og komfortabel sofa til stuen.",
        model: "Models/SofaAR_korrigert.glb",
        iosModel: "Models/SofaAR_korrigert.usdz"
    }
];

// HTML-ELEMENTER
const grid = document.getElementById("furniture-grid");
const modal = document.getElementById("viewer-modal");
const selectedModel = document.getElementById("selected-model");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");

const modelUpload = document.getElementById("model-upload");
const uploadStatus = document.getElementById("upload-status");
const uploadedModels = document.getElementById("uploaded-models");

// Brukerens egne modeller
const userFurniture = [];

// Holder oversikt over lokale modellfiler
const modelURLs = [];


/* ========================================
   VIS FERDIG MØBELKATALOG
======================================== */

function renderFurniture(category = "alle") {
    grid.innerHTML = "";

    const filtered = furniture.filter(item =>
        category === "alle" || item.category === category
    );

    if (filtered.length === 0) {
        grid.innerHTML =
            "<p>Ingen møbler i denne kategorien ennå.</p>";
        return;
    }

    filtered.forEach(item => {
        const card = createFurnitureCard(item);
        grid.appendChild(card);
    });
}


/* ========================================
   LAG MØBELKORT
======================================== */

function createFurnitureCard(item) {
    const card = document.createElement("article");
    card.className = "furniture-card";

    const preview = document.createElement("model-viewer");

    preview.setAttribute("src", item.model);
    preview.setAttribute("alt", item.name);
    preview.setAttribute("camera-controls", "");
    preview.setAttribute("auto-rotate", "");

    preview.style.width = "100%";
    preview.style.height = "300px";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const description = document.createElement("p");
    description.textContent = item.description;

    const button = document.createElement("button");
    button.className = "view-btn";
    button.textContent = "Se i 3D og AR";

    button.addEventListener("click", () => {
        openFurniture(item);
    });

    card.append(preview, title, description, button);

    return card;
}


/* ========================================
   ÅPNE MØBEL I 3D OG AR
======================================== */

function openFurniture(item) {
    modalTitle.textContent = item.name;
    modalDescription.textContent = item.description;

    selectedModel.setAttribute("src", item.model);

    if (item.iosModel) {
        selectedModel.setAttribute("ios-src", item.iosModel);
    } else {
        selectedModel.removeAttribute("ios-src");
    }

    modal.classList.remove("hidden");
}


/* ========================================
   LUKK 3D-VISNING
======================================== */

function closeFurniture() {
    modal.classList.add("hidden");
}

document.getElementById("close-modal")
    .addEventListener("click", closeFurniture);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeFurniture();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeFurniture();
    }
});


/* ========================================
   KATEGORIFILTRERING
======================================== */

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderFurniture(button.dataset.category);
    });
});


/* ========================================
   LAST OPP EGNE 3D-MODELLER
======================================== */

modelUpload.addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    // Kontroller filformat
    if (!file.name.toLowerCase().endsWith(".glb")) {
        uploadStatus.textContent =
            "Ugyldig filformat. Velg en .glb-fil.";
        modelUpload.value = "";
        return;
    }

    // Maksimal filstørrelse: 50 MB
    const maxSize = 50 * 1024 * 1024;

    if (file.size > maxSize) {
        uploadStatus.textContent =
            "Filen er for stor. Maksimal størrelse er 50 MB.";
        modelUpload.value = "";
        return;
    }

    // Opprett midlertidig URL for modellen
    const modelURL = URL.createObjectURL(file);

    modelURLs.push(modelURL);

    const furnitureName =
        file.name.replace(/\.glb$/i, "");

    const newFurniture = {
        id: Date.now(),
        name: furnitureName,
        category: "egen",
        description: "Din egen opplastede 3D-modell.",
        model: modelURL,
        iosModel: null
    };

    userFurniture.push(newFurniture);

    renderUploadedFurniture();

    uploadStatus.textContent =
        `"${furnitureName}" er lagt til i dine 3D-modeller.`;

    modelUpload.value = "";
});


/* ========================================
   VIS BRUKERENS EGNE MØBLER
======================================== */

function renderUploadedFurniture() {
    uploadedModels.innerHTML = "";

    userFurniture.forEach(item => {
        const card = createFurnitureCard(item);

        // Slett-knapp
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Fjern modell";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteUploadedFurniture(item.id);
        });

        card.appendChild(deleteButton);
        uploadedModels.appendChild(card);
    });
}


/* ========================================
   SLETT OPPLASTET MODELL
======================================== */

function deleteUploadedFurniture(id) {
    const index = userFurniture.findIndex(
        item => item.id === id
    );

    if (index === -1) return;

    const item = userFurniture[index];

    // Lukk visningen hvis modellen er åpen
    if (selectedModel.getAttribute("src") === item.model) {
        closeFurniture();
        selectedModel.removeAttribute("src");
    }

    // Frigjør minne
    URL.revokeObjectURL(item.model);

    const urlIndex = modelURLs.indexOf(item.model);

    if (urlIndex !== -1) {
        modelURLs.splice(urlIndex, 1);
    }

    userFurniture.splice(index, 1);

    renderUploadedFurniture();

    uploadStatus.textContent =
        `"${item.name}" er fjernet.`;
}


/* ========================================
   OPPSTART
======================================== */

renderFurniture();
renderUploadedFurniture();
