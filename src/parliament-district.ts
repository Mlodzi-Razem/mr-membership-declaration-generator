// IT CAN BE OUTDATED, always check the official source for the most accurate information, for example:
// https://sejmsenat2023.pkw.gov.pl/sejmsenat2023/pl/okregowe
export interface parliament_district {
  nr: number;
  powiat: string[];
  miastaPrawaPow: string[];
}

export const parliament_district: parliament_district[] = [
  {
    nr: 1,
    powiat: [
      "bolesławiecki",
      "głogowski",
      "jaworski",
      "karkonoski",
      "kamiennogórski",
      "legnicki",
      "lubański",
      "lubiński",
      "lwówecki",
      "polkowicki",
      "zgorzelecki",
      "złotoryjski"
    ],
    miastaPrawaPow: ["Jelenia Góra", "Legnica"]
  },
  {
    nr: 2,
    powiat: ["dzierżoniowski", "kłodzki", "świdnicki", "wałbrzyski", "ząbkowicki"],
    miastaPrawaPow: ["Wałbrzych"]
  },
  {
    nr: 3,
    powiat: ["górowski", "milicki", "oleśnicki", "oławski", "strzeliński", "średzki", "trzebnicki", "wołowski", "wrocławski"],
    miastaPrawaPow: ["Wrocław"]
  },
  {
    nr: 4,
    powiat: ["bydgoski", "inowrocławski", "mogileński", "nakielski", "sępoleński", "świecki", "tucholski", "żniński"],
    miastaPrawaPow: ["Bydgoszcz"]
  },
  {
    nr: 5,
    powiat: ["aleksandrowski", "brodnicki", "chełmiński", "golubsko-dobrzyński", "grudziądzki", "lipnowski", "radziejowski", "rypiński", "toruński", "wąbrzeski", "włocławski"],
    miastaPrawaPow: ["Grudziądz", "Toruń", "Włocławek"]
  },
  {
    nr: 6,
    powiat: ["janowski", "kraśnicki", "lubartowski", "lubelski", "łęczyński", "łukowski", "opolski", "puławski", "rycki", "świdnicki"],
    miastaPrawaPow: ["Lublin"]
  },
  {
    nr: 7,
    powiat: ["bialski", "biłgorajski", "chełmski", "hrubieszowski", "krasnostawski", "parczewski", "radzyński", "tomaszowski", "włodawski", "zamojski"],
    miastaPrawaPow: ["Biała Podlaska", "Chełm", "Zamość"]
  },
  {
    nr: 8,
    powiat: [],  // cały województwo lubuskie
    miastaPrawaPow: []  // brak specyfikacji miast na prawach powiatu poza tym co PKW podało
  },
  {
    nr: 9,
    powiat: ["brzeziński", "łódzki wschodni"],
    miastaPrawaPow: ["Łódź"]
  },
  {
    nr: 10,
    powiat: ["bełchatowski", "opoczyński", "piotrkowski", "radomszczański", "rawski", "skierniewicki", "tomaszowski"],
    miastaPrawaPow: ["Piotrków Trybunalski", "Skierniewice"]
  },
  {
    nr: 11,
    powiat: ["kutnowski", "łaski", "łęczycki", "łowicki", "pabianicki", "pajęczański", "poddębicki", "sieradzki", "wieluński", "wieruszowski", "zduńskowolski", "zgierski"],
    miastaPrawaPow: []
  },
  {
    nr: 12,
    powiat: ["chrzanowski", "myślenicki", "oświęcimski", "suski", "wadowicki"],
    miastaPrawaPow: []
  },
  {
    nr: 13,
    powiat: ["krakowski", "miechowski", "olkuski"],
    miastaPrawaPow: ["Kraków"]
  },
  {
    nr: 14,
    powiat: ["gorlicki", "limanowski", "nowosądecki", "nowotarski", "tatrzański"],
    miastaPrawaPow: ["Nowy Sącz"]
  },
  {
    nr: 15,
    powiat: ["bocheński", "brzeski", "dąbrowski", "proszowicki", "tarnowski", "wielicki"],
    miastaPrawaPow: ["Tarnów"]
  },
  {
    nr: 16,
    powiat: ["ciechanowski", "gostyniński", "mławski", "płocki", "płoński", "przasnyski", "sierpecki", "sochaczewski", "żyrardowski"],
    miastaPrawaPow: ["Płock"]
  },
  {
    nr: 17,
    powiat: ["białobrzeski", "grójecki", "kozienicki", "lipski", "przysuski", "radomski", "szydłowiecki", "zwoleński"],
    miastaPrawaPow: ["Radom"]
  },
  {
    nr: 18,
    powiat: ["garwoliński", "łosicki", "makowski", "miński", "ostrołęcki", "ostrowski", "pułtuski", "siedlecki", "sokołowski", "węgrowski", "wyszkowski"],
    miastaPrawaPow: ["Ostrołęka", "Siedlce"]
  },
  {
    nr: 19,
    powiat: [],
    miastaPrawaPow: ["Warszawa", "zagranica", "statki"]
  },
  {
    nr: 20,
    powiat: ["grodziski", "legionowski", "nowodworski", "otwocki", "piaseczyński", "pruszkowski", "warszawski zachodni", "wołomiński"],
    miastaPrawaPow: []
  },
  {
    nr: 21,
    powiat: [],  // całe województwo opolskie
    miastaPrawaPow: ["Opole"]
  },
  {
    nr: 22,
    powiat: ["bieszczadzki", "brzozowski", "jarosławski", "jasielski", "krośnieński", "leski", "lubaczowski", "przemyślski", "przeworski", "sanocki"],
    miastaPrawaPow: ["Krosno", "Przemyśl"]
  },
  {
    nr: 23,
    powiat: ["dębicki", "kolbuszowski", "leżajski", "łańcucki", "mielecki", "niżański", "ropczycko-sędziszowski", "rzeszowski", "stalowowolski", "strzyżowski", "tarnobrzeski"],
    miastaPrawaPow: ["Rzeszów", "Tarnobrzeg"]
  },
  {
    nr: 24,
    powiat: [],  // całe województwo podlaskie
    miastaPrawaPow: ["Białystok"]
  },
  {
    nr: 25,
    powiat: ["gdański", "kwidzyński", "malborski", "nowodworski", "starogardzki", "sztumski", "tczewski"],
    miastaPrawaPow: ["Gdańsk", "Sopot"]
  },
  {
    nr: 26,
    powiat: ["bytowski", "chojnicki", "człuchowski", "kartuski", "kościerski", "lęborski", "pucki", "słupski", "wejherowski"],
    miastaPrawaPow: ["Gdynia", "Słupsk"]
  },
  {
    nr: 27,
    powiat: ["bielski", "cieszyński", "pszczyński", "żywiecki"],
    miastaPrawaPow: ["Bielsko-Biała"]
  },
  {
    nr: 28,
    powiat: ["częstochowski", "kłobucki", "lubliniecki", "myszkowski"],
    miastaPrawaPow: ["Częstochowa"]
  },
  {
    nr: 29,
    powiat: ["gliwicki", "tarnogórski"],
    miastaPrawaPow: ["Bytom", "Gliwice", "Zabrze"]
  },
  {
    nr: 30,
    powiat: ["mikołowski", "raciborski", "rybnicki", "wodzisławski"],
    miastaPrawaPow: ["Jastrzębie-Zdrój", "Rybnik", "Żory"]
  },
  {
    nr: 31,
    powiat: ["bieruńsko-lędziński"],
    miastaPrawaPow: ["Chorzów", "Katowice", "Mysłowice", "Piekary Śląskie", "Ruda Śląska", "Siemianowice Śląskie", "Świętochłowice", "Tychy"]
  },
  {
    nr: 32,
    powiat: ["będziński", "zawierciański"],
    miastaPrawaPow: ["Dąbrowa Górnicza", "Jaworzno", "Sosnowiec"]
  },
  {
    nr: 33,
    powiat: [],  // całe województwo świętokrzyskie
    miastaPrawaPow: ["Kielce"]
  },
  {
    nr: 34,
    powiat: ["bartoszycki", "braniewski", "działdowski", "elbląski", "iławski", "lidzbarski", "nowomiejski", "ostródzki"],
    miastaPrawaPow: ["Elbląg"]
  },
  {
    nr: 35,
    powiat: ["ełcki", "giżycki", "gołdapski", "kętrzyński", "mrągowski", "nidzicki", "olsztyński", "piski", "szczycieński", "węgorzewski"],
    miastaPrawaPow: ["Olsztyn"]
  },
  {
    nr: 36,
    powiat: ["gostyński", "jarociński", "kaliski", "kępiński", "kościański", "krotoszyński", "leszczyński", "ostrowski", "ostrzeszowski", "pleszewski", "rawicki"],
    miastaPrawaPow: ["Kalisz", "Leszno"]
  },
  {
    nr: 37,
    powiat: ["gnieźnieński", "kolski", "koniński", "słupecki", "średzki", "śremski", "turecki", "wrzesiński"],
    miastaPrawaPow: ["Konin"]
  },
  {
    nr: 38,
    powiat: ["chodzieski", "czarnkowsko-trzcianecki", "grodziski", "międzychodzki", "nowotomyski", "obornicki", "pilski", "szamotulski", "wągrowiecki", "wolsztyński", "złotowski"],
    miastaPrawaPow: []
  },
  {
    nr: 39,
    powiat: ["poznański"],
    miastaPrawaPow: ["Poznań"]
  },
  {
    nr: 40,
    powiat: ["białogardzki", "choszczeński", "drawski", "kołobrzeski", "koszaliński", "sławieński", "szczecinecki", "świdwiński", "wałecki"],
    miastaPrawaPow: ["Koszalin"]
  },
  {
    nr: 41,
    powiat: ["goleniowski", "gryficki", "gryfiński", "kamieński", "łobeski", "myśliborski", "policki", "pyrzycki", "stargardzki"],
    miastaPrawaPow: ["Szczecin", "Świnoujście"]
  }
];
