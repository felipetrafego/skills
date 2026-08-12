// Gera SVGs ilustrativos (silhueta de cupê) para os veículos de demonstração.
// São placeholders originais e coloridos por carro — NÃO são fotos das montadoras.
// O lojista substitui pela foto própria/licenciada via upload de mídia.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "apps", "web", "public", "demo-cars");

/** @param {{file:string,label:string,color:string,accent:string,glass:string,floor:[string,string]}} c */
function svg(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${c.label} (ilustração)">
  <defs>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.floor[0]}"/>
      <stop offset="1" stop-color="${c.floor[1]}"/>
    </linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.accent}"/>
      <stop offset="0.35" stop-color="${c.color}"/>
      <stop offset="1" stop-color="${c.color}"/>
    </linearGradient>
    <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#000" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="400" height="300" fill="url(#floor)"/>
  <ellipse cx="200" cy="232" rx="150" ry="20" fill="url(#shadow)"/>

  <!-- corpo do cupê (silhueta lateral) -->
  <path d="M40 214
           C36 192 44 184 64 182
           L108 176
           C128 160 138 150 158 144
           C186 136 224 134 262 140
           C298 146 318 162 342 182
           L360 188
           C372 192 372 206 366 214
           Z" fill="url(#body)"/>
  <!-- vidros -->
  <path d="M150 146 C172 138 210 137 244 143 C266 147 280 158 296 172 L176 172 C168 160 158 152 150 146 Z"
        fill="${c.glass}" opacity="0.9"/>
  <!-- vinco lateral -->
  <path d="M70 190 L340 186" stroke="#fff" stroke-opacity="0.16" stroke-width="3" fill="none"/>
  <!-- para-choques / entradas de ar -->
  <rect x="44" y="198" width="20" height="9" rx="3" fill="#000" opacity="0.18"/>

  <!-- rodas -->
  <g>
    <circle cx="116" cy="214" r="30" fill="#0d0f13"/>
    <circle cx="116" cy="214" r="16" fill="#c7ccd4"/>
    <circle cx="116" cy="214" r="5" fill="#6b7280"/>
    <circle cx="292" cy="214" r="30" fill="#0d0f13"/>
    <circle cx="292" cy="214" r="16" fill="#c7ccd4"/>
    <circle cx="292" cy="214" r="5" fill="#6b7280"/>
  </g>

  <!-- selo discreto: deixa claro que é ilustração, sem competir com o título/badge do card -->
  <g transform="translate(28,272)">
    <rect x="0" y="-15" width="196" height="22" rx="11" fill="#0d1017" opacity="0.06"/>
    <text x="12" y="0" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="11.5" fill="#5b6472">Foto ilustrativa · ${c.colorName}</text>
  </g>
</svg>`;
}

const cars = [
  { file: "bmw-m4-competition-branco.svg", label: "BMW M4 Competition", colorName: "Alpine White", color: "#e9edf2", accent: "#ffffff", glass: "#2b3444", floor: ["#f5f7fa", "#e7ebf0"] },
  { file: "bmw-440i-msport-azul.svg", label: "BMW 440i M Sport", colorName: "Tanzanite Blue", color: "#1c2b4a", accent: "#33456e", glass: "#0f1830", floor: ["#eef1f6", "#dfe4ec"] },
  { file: "bmw-m4-austin-yellow.svg", label: "BMW M4 Coupé", colorName: "Austin Yellow", color: "#d7a419", accent: "#f0c542", glass: "#2b2410", floor: ["#f6f4ee", "#ece7db"] },
  { file: "bmw-m4-cs-san-marino.svg", label: "BMW M4 CS", colorName: "San Marino Blue", color: "#2b56a6", accent: "#4d7ad0", glass: "#12203f", floor: ["#eef2f8", "#dde4ef"] },
];

for (const c of cars) {
  writeFileSync(join(OUT, c.file), svg(c));
  console.log("gerado:", c.file);
}
