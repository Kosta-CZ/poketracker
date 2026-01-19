const API_KEY = "c3ea226b-e109-40a2-a15b-dc168911b428";
const API = "https://api.pokemontcg.io/v2";

const headers = { "X-Api-Key": API_KEY };

const collectionView = document.getElementById("collectionView");
const setsView = document.getElementById("setsView");
const setDetailView = document.getElementById("setDetailView");

const collectionList = document.getElementById("collectionList");
const setsGrid = document.getElementById("setsGrid");
const cardsGrid = document.getElementById("cardsGrid");
const setTitle = document.getElementById("setTitle");

const tabCollection = document.getElementById("tabCollection");
const tabSets = document.getElementById("tabSets");
const backToSets = document.getElementById("backToSets");

let collection = JSON.parse(localStorage.getItem("collection")) || [];

// ------------------ NAV ------------------
tabCollection.onclick = () => showView("collection");
tabSets.onclick = () => loadSets();

backToSets.onclick = () => {
  setDetailView.classList.add("hidden");
  setsView.classList.remove("hidden");
};

// ------------------ VIEW SWITCH ------------------
function showView(view) {
  collectionView.classList.add("hidden");
  setsView.classList.add("hidden");
  setDetailView.classList.add("hidden");

  if (view === "collection") collectionView.classList.remove("hidden");
  if (view === "sets") setsView.classList.remove("hidden");
}

// ------------------ COLLECTION ------------------
function renderCollection() {
  collectionList.innerHTML = "";
  collection.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.name} (${c.set}) ×${c.count}`;
    collectionList.appendChild(li);
  });
  localStorage.setItem("collection", JSON.stringify(collection));
}

// ------------------ LOAD SETS ------------------
async function loadSets() {
  showView("sets");
  setsGrid.innerHTML = "Načítám edice…";

  const res = await fetch(`${API}/sets`, { headers });
  const data = await res.json();

  setsGrid.innerHTML = "";

  data.data.forEach(set => {
    const owned = collection.filter(c => c.setId === set.id).length;
    const percent = ((owned / set.total) * 100).toFixed(1);

    const div = document.createElement("div");
    div.className = "setCard";
    div.innerHTML = `
      <img src="${set.images.logo}" alt="">
      <strong>${set.name}</strong><br>
      ${owned} / ${set.total} (${percent}%)
    `;

    div.onclick = () => loadSetDetail(set);
    setsGrid.appendChild(div);
  });
}

// ------------------ SET DETAIL ------------------
async function loadSetDetail(set) {
  setsView.classList.add("hidden");
  setDetailView.classList.remove("hidden");
  setTitle.textContent = set.name;
  cardsGrid.innerHTML = "Načítám karty…";

  const res = await fetch(
    `${API}/cards?q=set.id:${set.id}&pageSize=250`,
    { headers }
  );
  const data = await res.json();

  cardsGrid.innerHTML = "";

  data.data.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${card.images.small}">
      <small>${card.number}/${set.total}</small>
      <button>➕ Přidat</button>
    `;

    div.querySelector("button").onclick = () => {
      const existing = collection.find(c => c.cardId === card.id);
      if (existing) {
        existing.count++;
      } else {
        collection.push({
          cardId: card.id,
          name: card.name,
          set: set.name,
          setId: set.id,
          count: 1,
          price: card.cardmarket?.prices?.averageSellPrice || null
        });
      }
      renderCollection();
    };

    cardsGrid.appendChild(div);
  });
}

// INIT
renderCollection();
showView("collection");
