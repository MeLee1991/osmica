const TIMES = [
  "06:00","06:30","07:00","07:30",
  "08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00"
];

const SLOTS = ["T1","T2","T3"];

let selectedDate = new Date().toISOString().slice(0,10);
let bookings = {};

function loadBookings() {
  fetch("/bookings")
    .then(r => r.json())
    .then(data => {
      bookings = data;
      render();
    });
}

function toggle(date, time, slot) {
  const user = document.getElementById("name").value || "Anon";

  fetch("/toggle", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({date, time, slot, user})
  }).then(loadBookings);
}

function renderDates() {
  const el = document.getElementById("dates");
  el.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    let d = new Date();
    d.setDate(d.getDate() + i);
    let str = d.toISOString().slice(0,10);

    let btn = document.createElement("div");
    btn.className = "date" + (str === selectedDate ? " active" : "");
    btn.innerText = str.slice(5);

    btn.onclick = () => {
      selectedDate = str;
      render();
    };

    el.appendChild(btn);
  }
}

function renderGrid() {
  const el = document.getElementById("grid");
  el.innerHTML = "";

  // header
  el.innerHTML += `<div></div><div>T1</div><div>T2</div><div>T3</div>`;

  TIMES.forEach(t => {
    el.innerHTML += `<div class="cell time">${t}</div>`;

    SLOTS.forEach(s => {
      let key = `${selectedDate}_${t}_${s}`;
      let taken = bookings[key];

      let div = document.createElement("div");
      div.className = "cell " + (taken ? "taken" : "free");
      div.innerText = taken ? "✖ " + taken : "+";

      div.onclick = () => toggle(selectedDate, t, s);

      el.appendChild(div);
    });
  });
}

function render() {
  renderDates();
  renderGrid();
}

loadBookings();