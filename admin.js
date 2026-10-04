const SUPABASE_URL =
  "https://lkuptpgposnungotdsbk.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_AWd0zD__Ew-fZ4R-gzyhTw_82mwVbSk";

const API =
  `${SUPABASE_URL}/rest/v1/cars`;

const STORAGE =
  `${SUPABASE_URL}/storage/v1/object/car-photos`;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

let cars = [];


/* =========================
   MESSAGE
========================= */

function showMessage(message, success = true) {
  const box = document.querySelector("#adminMessage");

  if (!box) return;

  box.textContent = message;
  box.style.display = "block";

  box.style.border =
    success
      ? "1px solid rgba(0,200,100,.4)"
      : "1px solid rgba(255,80,80,.4)";

  setTimeout(() => {
    box.style.display = "none";
  }, 4000);
}


/* =========================
   CHARGER LES VOITURES
========================= */

async function loadCars() {

  try {

    const response = await fetch(
      `${API}?select=*&order=id.desc`,
      {
        headers
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    cars = await response.json();

    updateStats();
    renderCars();

  } catch (error) {

    console.error(error);

    showMessage(
      "Impossible de charger les véhicules.",
      false
    );
  }
}


/* =========================
   STATISTIQUES
========================= */

function updateStats() {

  const total =
    document.querySelector("#statTotal");

  const available =
    document.querySelector("#statAvailable");

  const reserved =
    document.querySelector("#statReserved");

  const sold =
    document.querySelector("#statSold");


  if (total)
    total.textContent = cars.length;


  if (available)
    available.textContent =
      cars.filter(car =>
        String(car.status || "")
          .toLowerCase()
          .includes("dispon")
      ).length;


  if (reserved)
    reserved.textContent =
      cars.filter(car =>
        String(car.status || "")
          .toLowerCase()
          .includes("réserv") ||
        String(car.status || "")
          .toLowerCase()
          .includes("reserv")
      ).length;


  if (sold)
    sold.textContent =
      cars.filter(car =>
        String(car.status || "")
          .toLowerCase()
          .includes("vend")
      ).length;
}


/* =========================
   AFFICHER LES VOITURES
========================= */

function renderCars() {

  const list =
    document.querySelector("#vehicleList");

  if (!list) return;


  if (!cars.length) {

    list.innerHTML =
      "<p>Aucun véhicule enregistré.</p>";

    return;
  }


  list.innerHTML = "";


  cars.forEach(car => {

    const item =
      document.createElement("div");

    item.className =
      "vehicle-item";


    const status =
      car.status || "Disponible";


    item.innerHTML = `

      <div class="vehicle-info">

        <h3>
          ${escapeHTML(car.brand || "")}
          ${escapeHTML(car.model || "")}
        </h3>

        <p>
          ${escapeHTML(car.price || "")}
          ${car.year ? ` • ${escapeHTML(car.year)}` : ""}
          ${car.km ? ` • ${escapeHTML(car.km)}` : ""}
        </p>

        <p>
          Statut :
          <strong>
            ${escapeHTML(status)}
          </strong>

          ${
            car.featured
              ? " • ⭐ À LA UNE"
              : ""
          }
        </p>

      </div>


      <div class="vehicle-buttons">

        <button
          class="button button-outline"
          type="button"
          data-status="${escapeHTML(car.id)}"
        >
          Statut
        </button>


        <button
          class="button button-outline"
          type="button"
          data-featured="${escapeHTML(car.id)}"
        >
          ⭐
        </button>


        <button
          class="button button-outline"
          type="button"
          data-delete="${escapeHTML(car.id)}"
        >
          Supprimer
        </button>

      </div>
    `;


    list.appendChild(item);
  });


  document
    .querySelectorAll("[data-status]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => changeStatus(button.dataset.status)
      );

    });


  document
    .querySelectorAll("[data-featured]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => toggleFeatured(button.dataset.featured)
      );

    });


  document
    .querySelectorAll("[data-delete]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => deleteCar(button.dataset.delete)
      );

    });
}


/* =========================
   AJOUTER UNE VOITURE
========================= */

async function addCar(event) {

  event.preventDefault();


  const form =
    document.querySelector("#carForm");


  const button =
    form.querySelector(
      'button[type="submit"]'
    );


  button.disabled = true;
  button.textContent =
    "Publication en cours...";


  try {

    const formData =
      new FormData(form);


    const brand =
      formData.get("brand")?.trim();

    const model =
      formData.get("model")?.trim();

    const price =
      formData.get("price")?.trim();

    const year =
      formData.get("year")?.trim();

    const km =
      formData.get("km")?.trim();

    const fuel =
      formData.get("fuel")?.trim();

    const gear =
      formData.get("gear")?.trim();

    const location =
      formData.get("location")?.trim();

    const status =
      formData.get("status") || "Disponible";

    const description =
      formData.get("description")?.trim();

    const featured =
      formData.get("featured") === "on";


    if (!brand || !model || !price) {

      throw new Error(
        "Marque, modèle et prix sont obligatoires."
      );
    }


    const photoInput =
      document.querySelector("#photos");


    const files =
      Array.from(
        photoInput?.files || []
      );


    /* =========================
       CRÉER LA VOITURE
    ========================= */

    const response =
      await fetch(API, {

        method: "POST",

        headers: {
          ...headers,
          Prefer: "return=representation"
        },

        body: JSON.stringify({

          brand,
          model,
          price,
          year: year || null,
          km: km || null,
          fuel: fuel || null,
          gear: gear || null,
          location: location || null,
          description: description || null,
          status,
          featured,
          photos: []

        })

      });


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    const created =
      await response.json();


    const car =
      created[0];


    if (!car?.id) {

      throw new Error(
        "La voiture n'a pas pu être créée."
      );
    }


    /* =========================
       UPLOAD DES PHOTOS
    ========================= */

    const photoUrls = [];


    for (
      let index = 0;
      index < files.length;
      index++
    ) {

      const file =
        files[index];


      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      const filename =
        `cars/${Date.now()}-${car.id}-${index}.${extension}`;


      const upload =
        await fetch(
          `${STORAGE}/${filename}`,
          {

            method: "POST",

            headers: {
              apikey: SUPABASE_KEY,
              Authorization:
                `Bearer ${SUPABASE_KEY}`,
              "Content-Type":
                file.type ||
                "application/octet-stream"
            },

            body: file
          }
        );


      if (!upload.ok) {

        console.error(
          "Erreur photo :",
          await upload.text()
        );

        continue;
      }


      const publicUrl =
        `${SUPABASE_URL}/storage/v1/object/public/car-photos/${filename}`;

      photoUrls.push(publicUrl);
    }


    /* =========================
       ENREGISTRER LES PHOTOS
    ========================= */

    if (photoUrls.length) {

      const update =
        await fetch(
          `${API}?id=eq.${encodeURIComponent(car.id)}`,
          {

            method: "PATCH",

            headers: {
              ...headers,
              Prefer: "return=minimal"
            },

            body: JSON.stringify({
              photos: photoUrls
            })
          }
        );


      if (!update.ok) {

        throw new Error(
          await update.text()
        );
      }
    }


    form.reset();


    showMessage(
      "✅ Véhicule publié avec succès !"
    );


    await loadCars();


  } catch (error) {

    console.error(error);

    showMessage(
      "❌ " + error.message,
      false
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "Publier le véhicule";
  }
}


/* =========================
   CHANGER LE STATUT
========================= */

async function changeStatus(id) {

  const car =
    cars.find(
      item => String(item.id) === String(id)
    );

  if (!car) return;


  const current =
    car.status || "Disponible";


  let next;


  if (current === "Disponible") {

    next = "Réservé";

  } else if (current === "Réservé") {

    next = "Vendu";

  } else {

    next = "Disponible";
  }


  try {

    const response =
      await fetch(
        `${API}?id=eq.${encodeURIComponent(id)}`,
        {

          method: "PATCH",

          headers: {
            ...headers,
            Prefer: "return=minimal"
          },

          body: JSON.stringify({
            status: next
          })

        }
      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    showMessage(
      `Statut changé en « ${next} ».`
    );


    await loadCars();


  } catch (error) {

    console.error(error);

    showMessage(
      "Impossible de modifier le statut.",
      false
    );
  }
}


/* =========================
   À LA UNE
========================= */

async function toggleFeatured(id) {

  const car =
    cars.find(
      item => String(item.id) === String(id)
    );

  if (!car) return;


  try {

    const response =
      await fetch(
        `${API}?id=eq.${encodeURIComponent(id)}`,
        {

          method: "PATCH",

          headers: {
            ...headers,
            Prefer: "return=minimal"
          },

          body: JSON.stringify({
            featured: !car.featured
          })

        }
      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    showMessage(
      car.featured
        ? "Véhicule retiré de la une."
        : "Véhicule mis à la une."
    );


    await loadCars();


  } catch (error) {

    console.error(error);

    showMessage(
      "Impossible de modifier le véhicule.",
      false
    );
  }
}


/* =========================
   SUPPRIMER
========================= */

async function deleteCar(id) {

  const car =
    cars.find(
      item => String(item.id) === String(id)
    );

  if (!car) return;


  const confirmed =
    confirm(
      `Supprimer ${car.brand || ""} ${car.model || ""} ?`
    );


  if (!confirmed) return;


  try {

    const response =
      await fetch(
        `${API}?id=eq.${encodeURIComponent(id)}`,
        {

          method: "DELETE",

          headers
        }
      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    showMessage(
      "Véhicule supprimé."
    );


    await loadCars();


  } catch (error) {

    console.error(error);

    showMessage(
      "Impossible de supprimer le véhicule.",
      false
    );
  }
}


/* =========================
   PROTECTION HTML
========================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char])
    );
}


/* =========================
   INITIALISATION
========================= */

document
  .querySelector("#carForm")
  ?.addEventListener(
    "submit",
    addCar
  );


loadCars();
