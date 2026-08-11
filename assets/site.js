const clock = document.querySelector("#clock");
const weatherTime = document.querySelector("#weather-time");
const bootLog = document.querySelector("#boot-log");
const wx = {
  temp: document.querySelector("#weather-temp"),
  condition: document.querySelector("#weather-condition"),
  district: document.querySelector("#weather-district"),
  wind: document.querySelector("#weather-wind"),
  air: document.querySelector("#weather-air"),
  advisory: document.querySelector("#weather-advisory"),
};
const WEATHER = [
  ["Watson relay", "29", "acid haze", "W 18 km/h", "hostile", "optics wipe recommended"],
  ["Westbrook signal", "25", "luxury smog", "SE 12 km/h", "managed", "surface glare elevated"],
  ["City Center core", "28", "corporate overcast", "W 14 km/h", "filtered", "drone traffic dense"],
  ["Santo Domingo grid", "34", "industrial dust", "E 24 km/h", "hazardous", "intakes clogging fast"],
  ["Pacifica drift", "26", "salt haze", "W 17 km/h", "corrosive", "wipe exposed contacts"],
  ["Badlands perimeter", "38", "dust wall", "W 37 km/h", "severe", "do not trust horizons"],
];

function updateClock() {
  const now = new Date();
  if (clock) clock.textContent = now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
  if (weatherTime) weatherTime.textContent = now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
}
function renderWeather() {
  if (!wx.temp) return;
  const day = Math.floor(new Date(new Date().setHours(0,0,0,0)).getTime() / 86400000);
  const [district,temp,condition,wind,air,advisory] = WEATHER[day % WEATHER.length];
  wx.temp.textContent = `${temp}°C`; wx.condition.textContent = condition; wx.district.textContent = district;
  wx.wind.textContent = wind; wx.air.textContent = air; wx.advisory.textContent = advisory;
}
function runCommand(command) {
  const q = command.trim().toLowerCase();
  if (!q) return "No command entered. Awaiting operator input.";
  if (q === "help" || q.includes("commands")) return "AVAILABLE: status | armory | attachments | projects | downloads | intel | operators | integrity | clearance";
  if (q.includes("status")) return "NODE ONLINE\nWEAPONS 03\nATTACHMENTS 12\nPROJECTS 05\nOPERATORS 00\nSYSTEM INTEGRITY 100%";
  if (q.includes("armory") || q.includes("weapon")) return "VEYR ARMORY ONLINE: XCR-L, M4, and 1911 records available.";
  if (q.includes("attachment") || q.includes("suppressor") || q.includes("optic")) return "VEYR ATTACHMENT INDEX ONLINE: 12 public records. Compatibility filters available.";
  if (q.includes("project")) return "PROJECT BOARD ONLINE: 3 active, 1 experimental, 1 planned.";
  if (q.includes("download") || q.includes("release")) return "No public packages staged. Release channels remain locked pending validation.";
  if (q.includes("intel") || q.includes("log")) return "INTEL ARCHIVE ONLINE: public development logs restored.";
  if (q.includes("operator")) return "OPERATOR ARCHIVE ONLINE: dossier records remain classified and work-in-progress.";
  if (q.includes("integrity")) return "SYSTEM INTEGRITY: 100%. STATIC MIRROR NOMINAL.";
  if (q.includes("clearance") || q.includes("auth")) return "AUTHORIZATION ACCEPTED: FIELD_OPERATOR // PUBLIC MIRROR.";
  return `Unknown command: ${command}. Type HELP for available commands.`;
}
function appendBootSuccess() {
  if (!bootLog || bootLog.querySelector(".boot-success")) return;
  const line = document.createElement("li"); const prefix = document.createElement("span"); const typed = document.createElement("span");
  const message = "security clearance granted";
  line.className = "boot-success"; prefix.className = "boot-success-prefix"; prefix.textContent = "> VEYRINDEX: ";
  typed.className = "boot-success-type is-typing"; typed.setAttribute("aria-label", message); line.append(prefix, typed); bootLog.append(line);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { typed.textContent = message; typed.classList.remove("is-typing"); return; }
  let i = 0; const timer = setInterval(() => { typed.textContent = message.slice(0, ++i); if (i >= message.length) { clearInterval(timer); typed.classList.remove("is-typing"); } }, 38);
}
function initializeConsoles() {
  document.querySelectorAll("[data-command-form]").forEach((form) => {
    const input = form.querySelector("input"); const output = form.querySelector("output");
    form.addEventListener("submit", (event) => { event.preventDefault(); if (input && output) output.textContent = runCommand(input.value); });
  });
}
updateClock(); renderWeather(); initializeConsoles(); setInterval(updateClock, 1000);
addEventListener("load", () => setTimeout(appendBootSuccess, 650));
