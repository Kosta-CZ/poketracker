document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // DATA
  // =======================
  const pokemonNames = [
    "Bulbasaur","Ivysaur","Venusaur",
    "Charmander","Charmeleon","Charizard",
    "Squirtle","Wartortle","Blastoise",
    "Pikachu","Raichu",
    "Eevee","Vaporeon","Jolteon","Flareon",
    "Mew","Mewtwo"
  ];

  const baseSetCards = {
    "Bulbasaur": { set: "Base Set", number: "44/102", rarity: "Common" },
    "Charmander": { set: "Base Set", number: "46/102", rarity: "Common" },
    "Squirtle": { set: "Base Set", number: "63/102", rarity: "Common" },
    "Pikachu": { set: "Base Set", number: "58/102", rarity: "Common" },
    "Charizard": { set: "Base Set", number: "4/102", rarity: "Rare Holo" }
  };

  // =======================
  // ELEMENTY
  // =======================
  const addBtn = document.getElementById("addBtn");
  const saveBtn = document.getElementById("saveBtn");
  const form = document.getElementById("form");
  const list = document.getElementById("cardList");

  const nameInput = document.getElementById("name");
  const cardNameInput = document.getElementById("cardName");
  const setInput = document.getElementById("set");
  const numberInput = document.getElementById("number");
  const rarityInput = document.getElementById("rarity");
  const suggestions = document.getElementById("suggestions");
  const searchInput = document.getElementById("search");

  // =======================
  // DATA
  // =======================
  let cards = JSON.parse(localStorage.getItem("cards")) || [];
  let editId = null;

  // =======================
  // NAŠEPTÁVAČ
  // =======================
  nameInput.addEventListener("input", () => {
    const value = nameInput.value.toLowerCase();
    suggestions.innerHTML = "";

    if (value.length < 2) {
      suggestions.classList.add("hidden");
      return;
    }

    pokemonNames
      .filter(p => p.toLowerCase().includes(value))
      .forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;

        li.onclick = () => {
          nameInput.value = p;
          cardNameInput.value = `${p} Base Set`;

          if (baseSetCards[p]) {
            setInput.value = baseSetCards[p].set;
            numberInput.value = baseSetCards[p].number;
            rarityInput.value = baseSetCards[p].rarity;
          }

          suggestions.classList.add("hidden");
        };

        suggestions.appendChild(li);
      });

    suggestions.classList.remove("hidden");
  });

  document.addEventListener("click", e => {
    if (!nameInput.contains(e.target)) {
      suggestions.classList.add("hidden");
    }
  });

  // =======================
  // RENDER
  // =======================
function render(filter = "") {
  list.innerHTML = "";

  cards
    .filter(c => {
      const cardName = (c.cardName || "").toLowerCase();
      const pokemon = (c.pokemon || "").toLowerCase();
      const f = filter.toLowerCase();

      return cardName.includes(f) || pokemon.includes(f);
    })
    .forEach(card => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${card.cardName || "(bez názvu)"}</strong><br>
        ${card.pokemon || ""} (${card.set || ""})<br>
        <div class="actions">
  <button class="icon" data-id="${card.id}" data-action="minus">−</button>
  <span class="count">${card.count || 1}</span>
  <button class="icon" data-id="${card.id}" data-action="plus">+</button>

  <button class="icon edit" data-id="${card.id}" data-action="edit">✏️</button>
  <button class="icon delete" data-id="${card.id}" data-action="delete">✕</button>
</div>

      `;
      list.appendChild(li);
    });
}


  // =======================
  // AKCE V SEZNAMU
  // =======================
  list.addEventListener("click", e => {
    const id = e.target.dataset.id;
    const action = e.target.dataset.action;
    if (!id) return;

    const card = cards.find(c => c.id === id);
    if (!card) return;

    if (action === "plus") card.count++;
    if (action === "minus" && card.count > 1) card.count--;
    if (action === "delete") cards = cards.filter(c => c.id !== id);

    if (action === "edit") {
      editId = id;
      nameInput.value = card.pokemon;
      cardNameInput.value = card.cardName;
      setInput.value = card.set;
      numberInput.value = card.number;
      rarityInput.value = card.rarity;
      form.classList.remove("hidden");
      return;
    }

    localStorage.setItem("cards", JSON.stringify(cards));
    render(searchInput.value);
  });

  // =======================
  // FORM
  // =======================
  addBtn.onclick = () => {
    editId = null;
    form.classList.remove("hidden");
  };

  saveBtn.onclick = () => {
    if (!nameInput.value) return alert("Vyber Pokémona");

    if (editId) {
      const card = cards.find(c => c.id === editId);
      Object.assign(card, {
        pokemon: nameInput.value,
        cardName: cardNameInput.value,
        set: setInput.value,
        number: numberInput.value,
        rarity: rarityInput.value
      });
    } else {
      cards.push({
        id: Date.now().toString(),   // ✅ OPRAVA
        pokemon: nameInput.value,
        cardName: cardNameInput.value,
        set: setInput.value,
        number: numberInput.value,
        rarity: rarityInput.value,
        count: 1
      });
    }

    localStorage.setItem("cards", JSON.stringify(cards));
    form.classList.add("hidden");
    nameInput.value = cardNameInput.value = setInput.value = numberInput.value = "";
    render(searchInput.value);
  };

  searchInput.addEventListener("input", e => render(e.target.value));

  // =======================
  // INIT
  // =======================
  render();
});
