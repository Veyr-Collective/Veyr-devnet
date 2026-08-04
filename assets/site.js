const clock = document.querySelector("#clock");
const weatherTime = document.querySelector("#weather-time");
const links = [...document.querySelectorAll("[data-section-link]")];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const form = document.querySelector("#command-form");
const input = document.querySelector("#command-input");
const output = document.querySelector("#command-output");
const bootLog = document.querySelector("#boot-log");
const weatherTemp = document.querySelector("#weather-temp");
const weatherCondition = document.querySelector("#weather-condition");
const weatherDistrict = document.querySelector("#weather-district");
const weatherWind = document.querySelector("#weather-wind");
const weatherAir = document.querySelector("#weather-air");
const weatherAdvisory = document.querySelector("#weather-advisory");

const DISTRICT_STORAGE_KEY = "veyrindex-weather-district";
const WEATHER_DISTRICTS = [
  {
    name: "Watson relay",
    seed: 7,
    reports: [
      ["29", "acid haze", "W 18 km/h", "hostile", "optics wipe recommended"],
      ["24", "neon drizzle", "NW 11 km/h", "poor", "seal open ports"],
      ["31", "solvent heat", "SW 22 km/h", "hazardous", "mask filter advised"],
      ["26", "particulate fog", "N 8 km/h", "hostile", "low-light optics favored"],
    ],
  },
  {
    name: "Westbrook signal",
    seed: 13,
    reports: [
      ["27", "glass rain", "E 9 km/h", "polished", "chrome slick warning"],
      ["25", "luxury smog", "SE 12 km/h", "managed", "surface glare elevated"],
      ["30", "synth pollen", "S 16 km/h", "irritant", "visor cleaning advised"],
      ["23", "cool neon mist", "NE 7 km/h", "acceptable", "quiet lanes active"],
    ],
  },
  {
    name: "City Center core",
    seed: 19,
    reports: [
      ["28", "corpo overcast", "W 14 km/h", "filtered", "drone traffic dense"],
      ["32", "heat shimmer", "SW 19 km/h", "poor", "mirage artifacts likely"],
      ["26", "polished smog", "N 10 km/h", "managed", "reflective glare high"],
      ["24", "dry thunderheads", "NW 21 km/h", "unstable", "static discharge risk"],
    ],
  },
  {
    name: "Santo Domingo grid",
    seed: 23,
    reports: [
      ["34", "industrial dust", "E 24 km/h", "hazardous", "intakes clogging fast"],
      ["36", "battery heat", "SE 18 km/h", "hostile", "thermal bloom likely"],
      ["30", "ash gusts", "S 28 km/h", "poor", "long lenses degraded"],
      ["27", "ozone glare", "NE 12 km/h", "irritant", "sensor noise elevated"],
    ],
  },
  {
    name: "Pacifica drift",
    seed: 29,
    reports: [
      ["26", "salt haze", "W 17 km/h", "corrosive", "wipe exposed contacts"],
      ["25", "storm runoff", "SW 31 km/h", "poor", "standing water mapped"],
      ["28", "ocean static", "S 20 km/h", "unstable", "radio chatter degraded"],
      ["29", "hot rain", "SE 15 km/h", "hostile", "sealed gear recommended"],
    ],
  },
  {
    name: "Badlands perimeter",
    seed: 31,
    reports: [
      ["38", "dust wall", "W 37 km/h", "lethal-ish", "do not trust horizons"],
      ["35", "dead-air heat", "N 5 km/h", "brittle", "hydration mandatory"],
      ["22", "static squall", "NW 42 km/h", "unstable", "antenna noise severe"],
      ["18", "cold desert wind", "E 29 km/h", "clear", "thermal layers sharp"],
    ],
  },
  {
    name: "Heywood channel",
    seed: 37,
    reports: [
      ["30", "humid neon haze", "S 13 km/h", "poor", "street steam rising"],
      ["27", "warm drizzle", "SE 10 km/h", "irritant", "slick pavement warning"],
      ["25", "metro smog", "W 16 km/h", "hostile", "underpass visibility low"],
      ["28", "soft thunder", "SW 18 km/h", "unstable", "roofline arcs possible"],
    ],
  },
];

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  clock.textContent = time;

  if (weatherTime) {
    weatherTime.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function updateActiveLink() {
  const current = sections
    .map((section) => ({
      id: section.id,
      top: Math.abs(section.getBoundingClientRect().top - 120),
    }))
    .sort((a, b) => a.top - b.top)[0];

  if (!current) return;

  links.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`);
  });
}

function getLocalDayNumber(date = new Date()) {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(localMidnight.getTime() / 86400000);
}

function getNextDistrictIndex() {
  try {
    const storedIndex = Number.parseInt(localStorage.getItem(DISTRICT_STORAGE_KEY), 10);
    const nextIndex = Number.isFinite(storedIndex)
      ? (storedIndex + 1) % WEATHER_DISTRICTS.length
      : Math.floor(Math.random() * WEATHER_DISTRICTS.length);

    localStorage.setItem(DISTRICT_STORAGE_KEY, String(nextIndex));
    return nextIndex;
  } catch {
    return Math.floor(Math.random() * WEATHER_DISTRICTS.length);
  }
}

function renderWeather() {
  if (
    !weatherTemp ||
    !weatherCondition ||
    !weatherDistrict ||
    !weatherWind ||
    !weatherAir ||
    !weatherAdvisory
  ) {
    return;
  }

  const district = WEATHER_DISTRICTS[getNextDistrictIndex()];
  const reportIndex = (getLocalDayNumber() + district.seed) % district.reports.length;
  const [temp, condition, wind, air, advisory] = district.reports[reportIndex];

  weatherTemp.textContent = `${temp}\u00b0C`;
  weatherCondition.textContent = condition;
  weatherDistrict.textContent = district.name;
  weatherWind.textContent = wind;
  weatherAir.textContent = air;
  weatherAdvisory.textContent = advisory;
}

function runCommand(command) {
  const normalized = command.trim().toLowerCase();

  if (!normalized) {
    return "No command entered. Awaiting operator input.";
  }

  if (normalized.includes("release")) {
    return "No public VEYR packages staged. Systems builds remain quarantined.";
  }

  if (
    normalized.includes("veyrframe") ||
    normalized.includes("weapon")
  ) {
    return "VEYRFRAME index online: XCR-L, M4, Colt 1911 records available.";
  }

  if (normalized.includes("simd")) {
    return "SIMD note: targeted import preserves one updated clip and keeps original entries intact.";
  }

  if (normalized.includes("tac")) {
    return "VEYRSYSTEMS tactical stance research online. Calibration pipeline marked prototype stable.";
  }

  return `Unknown command: ${command}. Guest access cannot execute that request.`;
}

function appendBootSuccess() {
  if (!bootLog || bootLog.querySelector(".boot-success")) return;

  const successLine = document.createElement("li");
  const prefix = document.createElement("span");
  const clearance = document.createElement("span");
  const message = "security clearance granted";

  successLine.className = "boot-success";
  prefix.className = "boot-success-prefix";
  prefix.textContent = "> VEYRINDEX: ";
  clearance.className = "boot-success-type is-typing";
  clearance.setAttribute("aria-label", message);

  successLine.append(prefix, clearance);
  bootLog.append(successLine);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    clearance.textContent = message;
    clearance.classList.remove("is-typing");
    return;
  }

  let cursor = 0;
  const typeTimer = window.setInterval(() => {
    cursor += 1;
    clearance.textContent = message.slice(0, cursor);

    if (cursor >= message.length) {
      window.clearInterval(typeTimer);
      clearance.classList.remove("is-typing");
    }
  }, 38);
}

updateClock();
updateActiveLink();
renderWeather();
setInterval(updateClock, 1000);
window.addEventListener("scroll", updateActiveLink, { passive: true });
window.addEventListener("load", () => {
  window.setTimeout(appendBootSuccess, 650);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  output.textContent = runCommand(input.value);
});
