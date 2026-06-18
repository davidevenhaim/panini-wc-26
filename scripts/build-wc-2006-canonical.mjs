#!/usr/bin/env node
// Build canonical items.generated.json for Panini FIFA World Cup Germany 2006.
//
// Sticker numbering matches the published Panini checklist (see
// sportscardsrock.com / cartophilic-info-exchange / multiple PSA-graded
// references). The community dump in public/wc-2006.json is missing
// several intro/stadium-pair stickers and over-sizes the smaller team
// sections, which shifts mid-album numbering by ~10 (Messi appears at
// #175 instead of canonical #185).
//
// Usage:
//   node scripts/build-wc-2006-canonical.mjs

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ALBUM_ID = "panini-world-cup-2006";

const INTRO_OPENING = [
  { name: "Panini Calciatori Stamp", foil: true },
  { name: "FIFA World Cup Trophy", foil: true },
  { name: "Official Mascot (Goleo VI)", foil: true },
  { name: "Official Emblem", foil: true },
  { name: "Official Poster", foil: true },
];

const STADIUMS = [
  "Hamburg – FIFA WM-Stadion",
  "Hannover – FIFA WM-Stadion",
  "Berlin – Olympiastadion",
  "Gelsenkirchen – FIFA WM-Stadion",
  "Dortmund – FIFA WM-Stadion",
  "Leipzig – Zentralstadion",
  "Köln – FIFA WM-Stadion",
  "Frankfurt – FIFA WM-Stadion",
  "Kaiserslautern – Fritz-Walter-Stadion",
  "Nürnberg – Franken-Stadion",
  "Stuttgart – Gottlieb-Daimler-Stadion",
  "München – FIFA WM-Stadion",
];

// Teams in album order. `badgeFirst` flips badge/team-photo order for the
// three sections that Panini ran badge-first (Angola, Ghana, Saudi Arabia).
const TEAMS = [
  {
    name: "Germany",
    code: "GER",
    players: [
      "Oliver Kahn", "Arne Friedrich", "Robert Huth", "Philipp Lahm",
      "Per Mertesacker", "Patrick Owomoyela", "Michael Ballack", "Tim Borowski",
      "Sebastian Deisler", "Fabian Ernst", "Torsten Frings", "Bernd Schneider",
      "Bastian Schweinsteiger", "Gerald Asamoah", "Miroslav Klose",
      "Kevin Kuranyi", "Lukas Podolski",
    ],
  },
  {
    name: "Costa Rica", code: "CRC",
    players: [
      "José Francisco Porras", "Jervis Drummond", "Leonardo González",
      "Luis Marín", "Gilberto Martínez", "Douglas Sequeira", "Harold Wallace",
      "Cristian Bolaños", "Steven Bryce", "Walter Centeno", "Carlos Hernández",
      "Alonso Solís", "Jafet Soto", "Ronald Gómez", "Álvaro Saborío",
      "Paulo Wanchope", "Álvaro Mesén",
    ],
  },
  {
    name: "Poland", code: "POL",
    players: [
      "Artur Boruc", "Jacek Bąk", "Marcin Baszczyński", "Tomasz Kłos",
      "Tomasz Rząsa", "Michał Żewłakow", "Kamil Kosowski", "Jacek Krzynówek",
      "Sebastian Mila", "Arkadiusz Radomski", "Euzebiusz Smolarek",
      "Radosław Sobolewski", "Mirosław Szymkowiak", "Tomasz Frankowski",
      "Grzegorz Rasiak", "Maciej Żurawski", "Jerzy Dudek",
    ],
  },
  {
    name: "Ecuador", code: "ECU",
    players: [
      "Cristian Mora", "Paul Ambrosi", "Marlon Ayoví", "Ulises de la Cruz",
      "Giovanny Espinoza", "Iván Hurtado", "Walter Ayoví", "Cristian Lara",
      "Edison Méndez", "Mario David Quiroz", "Néicer Reasco", "Edwin Tenorio",
      "Luis Antonio Valencia", "Agustín Delgado", "Franklin Salas",
      "Carlos Tenorio", "Edwin Villafuerte",
    ],
  },
  {
    name: "England", code: "ENG",
    players: [
      "Paul Robinson", "Sol Campbell", "Jamie Carragher", "Ashley Cole",
      "Rio Ferdinand", "Ledley King", "Gary Neville", "John Terry",
      "David Beckham", "Joe Cole", "Steven Gerrard", "Frank Lampard",
      "Shaun Wright-Phillips", "Peter Crouch", "Jermain Defoe",
      "Michael Owen", "Wayne Rooney",
    ],
  },
  {
    name: "Paraguay", code: "PAR",
    players: [
      "Justo Villar", "Julio César Cáceres", "Denis Caniza", "Paulo da Silva",
      "Carlos Gamarra", "Jorge Núñez", "Roberto Acuña", "Edgar Barreto",
      "Julio dos Santos", "Julio César Enciso", "Diego Gavilán",
      "Carlos Humberto Paredes", "José Cardozo", "Salvador Cabañas",
      "Nelson Cuevas", "Roque Santa Cruz", "Nelson Valdez",
    ],
  },
  {
    name: "Trinidad and Tobago", code: "TRI",
    players: [
      "Kelvin Jack", "Marvin Andrews", "Avery John", "Ian Cox",
      "Dennis Lawrence", "Brent Sancho", "Christopher Birchall",
      "Carlos Edwards", "Kenwyne Jones", "Russell Latapy", "Silvio Spann",
      "Densill Theobald", "Cornell Glen", "Jason Scotland", "Stern John",
      "Dwight Yorke", "Shaka Hislop",
    ],
  },
  {
    name: "Sweden", code: "SWE",
    players: [
      "Andreas Isaksson", "Christoffer Andersson", "Erik Edman", "Teddy Lučić",
      "Olof Mellberg", "Alexander Östlund", "Niclas Alexandersson",
      "Kim Källström", "Tobias Linderoth", "Fredrik Ljungberg",
      "Anders Svensson", "Christian Wilhelmsson", "Johan Elmander",
      "Marcus Allbäck", "Zlatan Ibrahimović", "Mattias Jonson", "Henrik Larsson",
    ],
  },
  {
    name: "Argentina", code: "ARG",
    players: [
      "Roberto Abbondanzieri", "Roberto Ayala", "Fabricio Coloccini",
      "Gabriel Heinze", "Walter Samuel", "Javier Zanetti", "Pablo Aimar",
      "Esteban Cambiasso", "Andrés D'Alessandro", "Javier Mascherano",
      "Juan Román Riquelme", "Juan Pablo Sorín", "Juan Sebastián Verón",
      "Hernán Crespo", "Lionel Messi", "Javier Saviola", "Carlos Tevez",
    ],
  },
  {
    name: "Ivory Coast", code: "CIV",
    players: [
      "Jean-Jacques Tizié", "Arthur Boka", "Cyril Domoraud", "Emmanuel Eboué",
      "Blaise Kouassi", "Kolo Touré", "Marco Zoro", "Abdoulaye Djiré",
      "Bonaventure Kalou", "Abdoulaye Méïté", "Siaka Tiéné", "Gilles Yapi Yapo",
      "Didier Zokora", "Kanga Akalé", "Aruna Dindane", "Didier Drogba",
      "Arouna Koné",
    ],
  },
  {
    name: "Serbia and Montenegro", code: "SCG",
    players: [
      "Dragoslav Jevrić", "Ivica Dragutinović", "Goran Gavrančić",
      "Mladen Krstajić", "Nemanja Vidić", "Ognjen Koroman", "Predrag Đorđević",
      "Igor Duljaj", "Saša Ilić", "Dragan Mladenović", "Albert Nađ",
      "Dejan Stanković", "Zvonimir Vukić", "Mateja Kežman", "Danijel Ljuboja",
      "Savo Milošević", "Nikola Žigić",
    ],
  },
  {
    name: "Netherlands", code: "NED",
    // 18-sticker section (Team + Badge + 16 players)
    players: [
      "Edwin van der Sar", "Khalid Boulahrouz", "Jan Kromkamp",
      "Joris Mathijsen", "André Ooijer", "Barry Opdam",
      "Giovanni van Bronckhorst", "Phillip Cocu", "Denny Landzaat",
      "Mark van Bommel", "Rafael van der Vaart", "Dirk Kuyt", "Arjen Robben",
      "Ruud van Nistelrooy", "Robin van Persie", "Jan Vennegoor of Hesselink",
    ],
  },
  {
    name: "Mexico", code: "MEX",
    players: [
      "Oswaldo Sánchez", "Rafael Márquez", "Mario Méndez", "Pavel Pardo",
      "Francisco Rodríguez", "Carlos Salcido", "Guillermo Franco",
      "Jaime Lozano", "Ramón Morales", "Ricardo Osorio", "Luis Ernesto Pérez",
      "Gerardo Torrado", "Sinha", "Cuauhtémoc Blanco", "Jared Borgetti",
      "Omar Bravo", "Francisco Fonseca",
    ],
  },
  {
    name: "Iran", code: "IRN",
    players: [
      "Ebrahim Mirzapour", "Sayed Daei Alavi", "Yahya Golmohammadi",
      "Hossein Kaebi", "Javad Nekounam", "Rahman Rezaei", "Ali Karimi",
      "Javad Kazemian", "Mehdi Mahdavikia", "Iman Mobali",
      "Moharram Navidkia", "Mohammad Nosrati", "Ferydoon Zandi", "Ali Daei",
      "Vahid Hashemian", "Alireza Vahedi Nikbakht", "Mehdi Rahmati",
    ],
  },
  {
    name: "Portugal", code: "POR",
    players: [
      "Ricardo", "Jorge Andrade", "Marco Caneira", "Miguel", "Nuno Valente",
      "Paulo Ferreira", "Ricardo Carvalho", "Costinha", "Deco", "Luís Figo",
      "Maniche", "Petit", "Simão Sabrosa", "Tiago", "Cristiano Ronaldo",
      "Nuno Gomes", "Pauleta",
    ],
  },
  {
    name: "Angola", code: "ANG", badgeFirst: true,
    // 10-sticker section (Badge + Team + 8 players)
    players: [
      "João Ricardo", "Jamba", "Loco", "André Macanga", "Figueiredo",
      "Zé Kalanga", "Flávio", "Mantorras",
    ],
  },
  {
    name: "Ghana", code: "GHA", badgeFirst: true,
    // 10-sticker section (Badge + Team + 8 players)
    players: [
      "Sammy Adjei", "John Mensah", "John Pantsil", "Stephen Appiah",
      "Michael Essien", "Sulley Muntari", "Asamoah Gyan", "Matthew Amoah",
    ],
  },
  {
    name: "Italy", code: "ITA",
    players: [
      "Gianluigi Buffon", "Fabio Cannavaro", "Marco Materazzi",
      "Alessandro Nesta", "Gianluca Zambrotta", "Fabio Grosso",
      "Cristian Zaccardo", "Mauro Camoranesi", "Daniele De Rossi",
      "Gennaro Gattuso", "Andrea Pirlo", "Simone Perrotta",
      "Alessandro Del Piero", "Alberto Gilardino", "Luca Toni",
      "Francesco Totti", "Christian Vieri",
    ],
  },
  {
    name: "USA", code: "USA",
    players: [
      "Kasey Keller", "Gregg Berhalter", "Carlos Bocanegra",
      "Steve Cherundolo", "Frankie Hejduk", "Oguchi Onyewu", "Eddie Pope",
      "DaMarcus Beasley", "Clint Dempsey", "Eddie Lewis", "Pablo Mastroeni",
      "Steve Ralston", "Claudio Reyna", "Landon Donovan", "Eddie Johnson",
      "Brian McBride", "Taylor Twellman",
    ],
  },
  {
    name: "Czech Republic", code: "CZE",
    players: [
      "Petr Čech", "Zdeněk Grygera", "Marek Jankulovski", "Martin Jiránek",
      "David Rozehnal", "Tomáš Ujfaluši", "Tomáš Galásek", "Pavel Nedvěd",
      "Jaroslav Plašil", "Karel Poborský", "Jan Polák", "Tomáš Rosický",
      "Vladimír Šmicer", "Milan Baroš", "Marek Heinz", "Jan Koller",
      "Vratislav Lokvenc",
    ],
  },
  {
    name: "Brazil", code: "BRA",
    players: [
      "Dida", "Cafu", "Cicinho", "Juan", "Lúcio", "Roberto Carlos",
      "Roque Júnior", "Emerson", "Júlio Baptista", "Juninho Pernambucano",
      "Renato", "Zé Roberto", "Kaká", "Ronaldinho", "Adriano", "Robinho",
      "Ronaldo",
    ],
  },
  {
    name: "Croatia", code: "CRO",
    players: [
      "Tomislav Butina", "Robert Kovač", "Dario Šimić", "Josip Šimunić",
      "Stjepan Tomas", "Igor Tudor", "Marko Babić", "Niko Kovač",
      "Niko Kranjčar", "Jerko Leko", "Darijo Srna", "Jurica Vranješ",
      "Boško Balaban", "Ivan Klasnić", "Ivica Olić", "Dado Pršo",
      "Stipe Pletikosa",
    ],
  },
  {
    name: "Australia", code: "AUS",
    players: [
      "Mark Schwarzer", "Scott Chipperfield", "Craig Moore", "Lucas Neill",
      "Tony Popovic", "Tony Vidmar", "Mark Bresciano", "Brett Emerton",
      "Vincenzo Grella", "Josip Skoko", "Tim Cahill", "Archie Thompson",
      "John Aloisi", "Jason Culina", "Harry Kewell", "Mark Viduka",
      "Željko Kalac",
    ],
  },
  {
    name: "Japan", code: "JPN",
    players: [
      "Yoshikatsu Kawaguchi", "Akira Kaji", "Tsuneyasu Miyamoto",
      "Yuji Nakazawa", "Alex Santos", "Makoto Tanaka", "Yasuhito Endo",
      "Takashi Fukunishi", "Junichi Inamoto", "Shunsuke Nakamura",
      "Hidetoshi Nakata", "Mitsuo Ogasawara", "Masashi Oguro",
      "Takayuki Suzuki", "Naohiro Takahara", "Keiji Tamada",
      "Atsushi Yanagisawa",
    ],
  },
  {
    name: "France", code: "FRA",
    players: [
      "Fabien Barthez", "Jean-Alain Boumsong", "William Gallas", "Gaël Givet",
      "Willy Sagnol", "Lilian Thuram", "Vikash Dhorasoo", "Alou Diarra",
      "Claude Makélélé", "Florent Malouda", "Patrick Vieira",
      "Zinédine Zidane", "Djibril Cissé", "Thierry Henry", "David Trezeguet",
      "Sylvain Wiltord", "Grégory Coupet",
    ],
  },
  {
    name: "Switzerland", code: "SUI",
    players: [
      "Pascal Zuberbühler", "Philipp Degen", "Ludovic Magnin",
      "Patrick Müller", "Philippe Senderos", "Christoph Spycher",
      "Tranquillo Barnetta", "Ricardo Cabanas", "Daniel Gygax",
      "Johann Lonfat", "Johann Vogel", "Raphaël Wicky", "Hakan Yakin",
      "Valon Behrami", "Alexander Frei", "Marco Streller", "Johan Vonlanthen",
    ],
  },
  {
    name: "South Korea", code: "KOR",
    players: [
      "Lee Woon-jae", "Park Dong-hyuk", "Park Jae-hong", "Choi Jin-cheul",
      "Kim Jin-kyu", "Yoo Kyoung-yeoul", "Lee Chun-soo", "Kim Do-heon",
      "Kim Dong-jin", "Park Ji-sung", "Kim Jung-woo", "Kim Nam-il",
      "Lee Young-pyo", "Lee Dong-gook", "Cha Du-ri", "Ahn Jung-hwan",
      "Chung Kyung-ho",
    ],
  },
  {
    name: "Togo", code: "TOG",
    players: [
      "Kossi Agassa", "Jean-Paul Abalo", "Éric Akoto", "Mohamed Atte-Oudeyi",
      "Emmanuel Mathias", "Daré Nibombé", "Junior Senaya",
      "Massamasso Tchangai", "Yao Aziawonou", "Mamam Cherif-Touré",
      "Abdel Coubadja", "Jacques Romao", "Moustapha Salifou",
      "Robert Souliemane", "Emmanuel Adebayor", "Mickaël Dogbé",
      "Adekanmi Olufadé",
    ],
  },
  {
    name: "Spain", code: "ESP",
    players: [
      "Iker Casillas", "Asier del Horno", "Carlos Marchena", "Pablo Ibáñez",
      "Carles Puyol", "Míchel Salgado", "Sergio Ramos", "David Albelda",
      "Rubén Baraja", "Vicente Rodríguez", "Xavi Hernández",
      "Joaquín Sánchez", "Luis García", "Raúl González", "José Antonio Reyes",
      "Fernando Morientes", "Fernando Torres",
    ],
  },
  {
    name: "Ukraine", code: "UKR",
    players: [
      "Oleksandr Shovkovskyi", "Serhiy Fedorov", "Andriy Nesmachnyi",
      "Oleksandr Radchenko", "Andriy Rusol", "Vyacheslav Sviderskyi",
      "Volodymyr Yezerskyi", "Andriy Husin", "Oleh Husyev", "Ruslan Rotan",
      "Oleh Shelayev", "Anatoliy Tymoshchuk", "Serhiy Rebrov",
      "Oleksiy Byelik", "Andriy Shevchenko", "Andriy Vorobey",
      "Andriy Voronin",
    ],
  },
  {
    name: "Tunisia", code: "TUN",
    players: [
      "Ali Boumnijel", "Clayton", "Karim Haggui", "Radhi Jaïdi", "Karim Saidi",
      "Hatem Trabelsi", "Alaeddine Yahia", "Slim Ben Achour",
      "Chaouki Ben Saada", "Adel Chedli", "Kaies Ghodhbane", "Jawhar Mnari",
      "Mehdi Nafti", "Haykel Guemamdia", "Ziad Jaziri", "Imed Mhadhebi",
      "Francileudo Santos",
    ],
  },
  {
    name: "Saudi Arabia", code: "KSA", badgeFirst: true,
    // 10-sticker section (Badge + Team + 8 players)
    players: [
      "Mabrouk Zaid", "Hamad Al-Montashari", "Ahmed Dokhi", "Saud Kariri",
      "Mohammad Al-Shalhoub", "Sami Al-Jaber", "Yasser Al-Qahtani",
      "Talal Al-Meshal",
    ],
  },
];

/* ── Build sections ──────────────────────────────────────────────────── */

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeItem(code, name, sectionId, section, category, extra = {}) {
  return {
    id: `${ALBUM_ID}:${code}`,
    albumId: ALBUM_ID,
    sectionId,
    code: String(code),
    displayNumber: String(code),
    order: section.items.length + 1,
    isRequiredForCompletion: true,
    availability: "PACK",
    name: { en: name },
    category,
    ...extra,
  };
}

const sections = [];
let sectionOrder = 0;
let nextCode = 0;

// Intro (0-4): Panini stamp, Trophy, Mascot, Emblem, Poster
sectionOrder += 1;
const intro = {
  id: "intro",
  title: { en: "Intro" },
  order: sectionOrder,
  entityType: "INTRO",
  items: [],
};
for (const s of INTRO_OPENING) {
  intro.items.push(makeItem(nextCode, s.name, "intro", intro, "INTRO"));
  nextCode += 1;
}
sections.push(intro);

// Stadiums (5-16)
sectionOrder += 1;
const stadiums = {
  id: "stadiums",
  title: { en: "Stadiums" },
  order: sectionOrder,
  entityType: "TOURNAMENT",
  items: [],
};
for (const name of STADIUMS) {
  stadiums.items.push(makeItem(nextCode, name, "stadiums", stadiums, "STADIUM"));
  nextCode += 1;
}
sections.push(stadiums);

// Teams
for (const team of TEAMS) {
  sectionOrder += 1;
  const sid = slugify(team.name);
  const sec = {
    id: sid,
    title: { en: team.name },
    order: sectionOrder,
    entityType: "NATIONAL_TEAM",
    badge: team.code,
    items: [],
  };
  const headerOrder = team.badgeFirst
    ? [
        { name: `${team.name} Badge`, category: "TEAM_LOGO" },
        { name: `${team.name} Team Photo`, category: "TEAM_PHOTO" },
      ]
    : [
        { name: `${team.name} Team Photo`, category: "TEAM_PHOTO" },
        { name: `${team.name} Badge`, category: "TEAM_LOGO" },
      ];
  for (const h of headerOrder) {
    sec.items.push(
      makeItem(nextCode, h.name, sid, sec, h.category, { teamName: { en: team.name } })
    );
    nextCode += 1;
  }
  for (const player of team.players) {
    sec.items.push(
      makeItem(nextCode, player, sid, sec, "PLAYER", {
        teamName: { en: team.name },
        playerName: { en: player },
      })
    );
    nextCode += 1;
  }
  sections.push(sec);
}

const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

const payload = {
  albumId: ALBUM_ID,
  edition: { market: "INTERNATIONAL", editionType: "STANDARD" },
  sections,
  sources: [],
  excludedItems: [],
};

const outPath = resolve("src/data/world-cup/2006/items.generated.json");
writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf-8");

// Sanity output
console.log(`[build-wc-2006-canonical] ${totalItems} items / ${sections.length} sections / last code ${nextCode - 1}`);
const messi = sections
  .find((s) => s.id === "argentina")
  ?.items.find((i) => i.name.en === "Lionel Messi");
const cr7 = sections
  .find((s) => s.id === "portugal")
  ?.items.find((i) => i.name.en === "Cristiano Ronaldo");
console.log(`[build-wc-2006-canonical] Messi=#${messi?.code}, Cristiano Ronaldo=#${cr7?.code}`);
