/* =====================================================
   PÉGASE AUTOMOBILE — APP V2
   Connexion Supabase + recherche + filtres + favoris
===================================================== */

const SUPABASE_URL =
  "https://lkuptpgposnungotdsbk.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_AWd0zD__eW-fZ4R-gzyhTw_82mwVbSk";

const API =
  `${SUPABASE_URL}/rest/v1/cars`;

const SELLER_PHONE =
  "+33643486124";

const SELLER_WHATSAPP =
  "33643486124";


let allCars = [];

let favorites =
  JSON.parse(
    localStorage.getItem(
      "pegaseFavorites"
    ) || "[]"
  );


/* =====================================================
   OUTILS
===================================================== */

function esc(value) {

  return String(
    value ?? ""
  ).replace(
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


/* =====================================================
   PRIX POUR LE TRI
===================================================== */

function priceNumber(value) {

  if (
    typeof value === "number"
  ) {
    return value;
  }

  const number =
    String(value ?? "")
      .replace(/[^\d]/g, "");

  return Number(number) || 0;

}


/* =====================================================
   PHOTOS
===================================================== */

function getPhotos(value) {

  if (!value) {
    return [];
  }


  if (Array.isArray(value)) {

    return value
      .map(photo =>
        String(photo).trim()
      )
      .filter(photo =>
        photo.startsWith("http")
      );

  }


  if (
    typeof value === "string"
  ) {

    const text =
      value.trim();


    if (!text) {
      return [];
    }


    try {

      const parsed =
        JSON.parse(text);


      if (
        Array.isArray(parsed)
      ) {

        return parsed
          .map(photo =>
            String(photo).trim()
          )
          .filter(photo =>
            photo.startsWith("http")
          );

      }


      if (
        typeof parsed === "string" &&
        parsed.startsWith("http")
      ) {

        return [parsed];

      }

    } catch {

      /* On continue */

    }


    if (
      text.startsWith("http")
    ) {

      return [text];

    }


    const matches =
      text.match(
        /https?:\/\/[^\s"'\\\]}]+/g
      );


    return matches || [];

  }


  return [];

}


/* =====================================================
   FAVORIS
===================================================== */

function isFavorite(id) {

  return favorites.includes(
    String(id)
  );

}


function saveFavorites() {

  localStorage.setItem(
    "pegaseFavorites",
    JSON.stringify(
      favorites
    )
  );

}


function toggleFavorite(id) {

  id = String(id);


  if (
    favorites.includes(id)
  ) {

    favorites =
      favorites.filter(
        item => item !== id
      );

  } else {

    favorites.push(id);

  }


  saveFavorites();

  renderCars();

}


/* =====================================================
   RÉCUPÉRER LES VOITURES
===================================================== */

async function getCars() {

  try {

    const response =
      await fetch(
        `${API}?select=*`,
        {

          method: "GET",

          headers: {

            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${SUPABASE_KEY}`,

            "Content-Type":
              "application/json"

          }

        }
      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );

    }


    return await response.json();

  } catch (error) {

    console.error(
      "Erreur Supabase :",
      error
    );

    return [];

  }

}


/* =====================================================
   FILTRER / TRIER
===================================================== */

function getFilteredCars() {

  const search =
    document
      .querySelector("#search")
      ?.value
      .toLowerCase()
      .trim() || "";


  const fuel =
    document
      .querySelector("#fuel")
      ?.value || "";


  const gear =
    document
      .querySelector("#gear")
      ?.value || "";


  const sort =
    document
      .querySelector("#sort")
      ?.value || "";


  let cars =
    [...allCars];


  /* RECHERCHE */

  if (search) {

    cars =
      cars.filter(car => {

        const text =
          `${car.brand || ""} ${car.model || ""} ${car.location || ""}`
            .toLowerCase();

        return text.includes(
          search
        );

      });

  }


  /* CARBURANT */

  if (fuel) {

    cars =
      cars.filter(
        car =>
          String(
            car.fuel || ""
          ).toLowerCase() ===
          fuel.toLowerCase()
      );

  }


  /* BOÎTE */

  if (gear) {

    cars =
      cars.filter(
        car =>
          String(
            car.gear || ""
          ).toLowerCase() ===
          gear.toLowerCase()
      );

  }


  /* TRI */

  if (sort === "priceAsc") {

    cars.sort(
      (a,b) =>
        priceNumber(a.price) -
        priceNumber(b.price)
    );

  }


  if (sort === "priceDesc") {

    cars.sort(
      (a,b) =>
        priceNumber(b.price) -
        priceNumber(a.price)
    );

  }


  if (sort === "yearDesc") {

    cars.sort(
      (a,b) =>
        Number(b.year || 0) -
        Number(a.year || 0)
    );

  }


  if (sort === "kmAsc") {

    cars.sort(
      (a,b) =>
        Number(
          String(a.km || "")
            .replace(/\D/g,"")
        ) -
        Number(
          String(b.km || "")
            .replace(/\D/g,"")
        )
    );

  }


  return cars;

}


/* =====================================================
   STATUT
===================================================== */

function getStatus(car) {

  const status =
    String(
      car.status || ""
    ).toLowerCase();


  if (
    status.includes("vend")
  ) {

    return {
      text: "VENDU",
      className: "status-sold"
    };

  }


  if (
    status.includes("réserv") ||
    status.includes("reserv")
  ) {

    return {
      text: "RÉSERVÉ",
      className: "status-reserved"
    };

  }


  return {
    text: "DISPONIBLE",
    className: "status-available"
  };

}


/* =====================================================
   AFFICHER LES VOITURES
===================================================== */

function renderCars() {

  const box =
    document.querySelector(
      "#cars"
    );


  const loading =
    document.querySelector(
      "#loading"
    );


  const empty =
    document.querySelector(
      "#empty"
    );


  if (!box) {
    return;
  }


  const cars =
    getFilteredCars();


  box.innerHTML = "";


  if (loading) {
    loading.style.display =
      "none";
  }


  if (empty) {

    empty.hidden =
      cars.length !== 0;

  }


  const count =
    document.querySelector(
      "#vehicleCount"
    );


  if (count) {

    count.textContent =
      cars.length;

  }


  cars.forEach(
    (car,index) => {

      const photos =
        getPhotos(
          car.photos
        );


      const firstPhoto =
        photos[0] || "";


      const favorite =
        isFavorite(
          car.id
        );


      const status =
        getStatus(car);


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "car-card";


      card.style.animationDelay =
        `${index * 0.05}s`;


      card.innerHTML = `

        <div class="car-image">

          ${
            firstPhoto

              ? `

                <img
                  src="${esc(firstPhoto)}"
                  alt="${esc(car.brand)} ${esc(car.model)}"
                  loading="lazy"
                  onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                  "
                >

                <div
                  class="car-placeholder-image"
                  style="display:none;"
                >
                  <strong>♞</strong>
                  Photo indisponible
                </div>

              `

              : `

                <div class="car-placeholder-image">
                  <strong>♞</strong>
                  Pégase Automobile
                </div>

              `
          }


          <div
            class="status-badge ${status.className}"
          >
            ${status.text}
          </div>


          ${
            car.featured === true
              ? `
                <div class="featured-badge">
                  ⭐ À LA UNE
                </div>
              `
              : ""
          }


          <button
            class="favorite-button ${
              favorite ? "active" : ""
            }"
            type="button"
            aria-label="Ajouter aux favoris"
            data-favorite="${esc(car.id)}"
          >
            ${favorite ? "♥" : "♡"}
          </button>

        </div>


        <div class="car-body">

          <h3>
            ${esc(car.brand)}
            ${esc(car.model)}
          </h3>


          <div class="car-price">
            ${esc(car.price)}
          </div>


          <div class="car-meta">

            ${
              car.year
                ? `<span>📅 ${esc(car.year)}</span>`
                : ""
            }

            ${
              car.km
                ? `<span>🛣️ ${esc(car.km)}</span>`
                : ""
            }

            ${
              car.fuel
                ? `<span>⛽ ${esc(car.fuel)}</span>`
                : ""
            }

            ${
              car.gear
                ? `<span>⚙️ ${esc(car.gear)}</span>`
                : ""
            }

          </div>


          ${
            car.location
              ? `
                <div class="car-location">
                  📍 ${esc(car.location)}
                </div>
              `
              : ""
          }


          <div class="car-buttons">

            <a
              href="voiture.html?id=${encodeURIComponent(car.id)}"
              class="car-button car-button-details"
            >
              Voir le véhicule →
            </a>


            <a
              href="tel:${SELLER_PHONE}"
              class="car-button car-button-contact"
            >
              📞 Contacter le vendeur
            </a>

          </div>

        </div>

      `;


      /* FAVORI */

      const favoriteButton =
        card.querySelector(
          "[data-favorite]"
        );


      favoriteButton?.addEventListener(
        "click",
        event => {

          event.preventDefault();

          event.stopPropagation();

          toggleFavorite(
            car.id
          );

        }
      );


      box.appendChild(
        card
      );

    }
  );

}


/* =====================================================
   CHARGEMENT INITIAL
===================================================== */

async function init() {

  const loading =
    document.querySelector(
      "#loading"
    );


  if (loading) {

    loading.style.display =
      "flex";

  }


  allCars =
    await getCars();


  renderCars();

}


/* =====================================================
   FILTRES
===================================================== */

document
  .querySelector("#search")
  ?.addEventListener(
    "input",
    renderCars
  );


document
  .querySelector("#fuel")
  ?.addEventListener(
    "change",
    renderCars
  );


document
  .querySelector("#gear")
  ?.addEventListener(
    "change",
    renderCars
  );


document
  .querySelector("#sort")
  ?.addEventListener(
    "change",
    renderCars
  );


/* =====================================================
   ANNÉE FOOTER
===================================================== */

const year =
  document.querySelector(
    "#year"
  );


if (year) {

  year.textContent =
    new Date()
      .getFullYear();

}


/* =====================================================
   DÉMARRAGE
===================================================== */

init();
