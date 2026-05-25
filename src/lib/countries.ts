export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  languages: { code: string; name: string; flag: string }[];
  cities: { name: string; neighborhoods: string[] }[];
  phonePrefix: string;
  measurementSystem: "metric";
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "burundi",
    name: "Burundi",
    flag: "\u{1F1E7}\u{1F1EE}",
    currency: "Burundian Franc",
    currencyCode: "BIF",
    currencySymbol: "FBu",
    languages: [
      { code: "kirundi", name: "Kirundi", flag: "\u{1F1E7}\u{1F1EE}" },
      { code: "french", name: "French", flag: "\u{1F1EB}\u{1F1F7}" },
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
    ],
    cities: [
      {
        name: "Bujumbura",
        neighborhoods: ["Rohero", "Kiriri", "Kanyosha", "Muha", "Buyenzi", "Kinama", "Ntahangwa"],
      },
    ],
    phonePrefix: "+257",
    measurementSystem: "metric",
  },
  {
    code: "drc",
    name: "DR Congo",
    flag: "\u{1F1E8}\u{1F1E9}",
    currency: "Congolese Franc",
    currencyCode: "CDF",
    currencySymbol: "FC",
    languages: [
      { code: "french", name: "French", flag: "\u{1F1EB}\u{1F1F7}" },
      { code: "lingala", name: "Lingala", flag: "\u{1F1E8}\u{1F1E9}" },
      { code: "swahili", name: "Swahili", flag: "\u{1F1E8}\u{1F1E9}" },
    ],
    cities: [
      {
        name: "Kinshasa",
        neighborhoods: ["Gombe", "La Gombe", "Kinshasa Centre", "Matonge", "Limbete", "Ngaliema", "Mont Ngafula", "Lukunga", "Barumbu", "Kalamu"],
      },
      {
        name: "Goma",
        neighborhoods: ["Karisimbi", "Goma Centre", "Majengo", "Katoyi"],
      },
      {
        name: "Lubumbashi",
        neighborhoods: ["Kenya", "Lubumbashi Centre", "Kamalondo"],
      },
    ],
    phonePrefix: "+243",
    measurementSystem: "metric",
  },
  {
    code: "ethiopia",
    name: "Ethiopia",
    flag: "\u{1F1EA}\u{1F1F9}",
    currency: "Ethiopian Birr",
    currencyCode: "ETB",
    currencySymbol: "Br",
    languages: [
      { code: "amharic", name: "Amharic", flag: "\u{1F1EA}\u{1F1F9}" },
      { code: "oromo", name: "Oromo", flag: "\u{1F1EA}\u{1F1F9}" },
      { code: "tigrinya", name: "Tigrinya", flag: "\u{1F1EA}\u{1F1F9}" },
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
    ],
    cities: [
      {
        name: "Addis Ababa",
        neighborhoods: ["Bole", "Kazanchis", "CMC", "Sarbet", "Piassa", "Merkato", "Kirkos", "Arada", "Lideta", "Kolfe", "Nifas Silk", "Ayat", "CMC-Meshualekia", "Mexico", "Bole Bulbula", "Woreda 03", "Woreda 04", "Gullele"],
      },
      {
        name: "Dire Dawa",
        neighborhoods: ["Kezira", "Mengecha", "Harrar Road"],
      },
      {
        name: "Bahir Dar",
        neighborhoods: ["Piazza", "Gish Abay", "Meshenti"],
      },
      {
        name: "Hawassa",
        neighborhoods: ["Mekane Selam", "Haile", "Tabor"],
      },
    ],
    phonePrefix: "+251",
    measurementSystem: "metric",
  },
  {
    code: "kenya",
    name: "Kenya",
    flag: "\u{1F1F0}\u{1F1EA}",
    currency: "Kenyan Shilling",
    currencyCode: "KES",
    currencySymbol: "KSh",
    languages: [
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
      { code: "swahili", name: "Swahili", flag: "\u{1F1F0}\u{1F1EA}" },
    ],
    cities: [
      {
        name: "Nairobi",
        neighborhoods: ["Westlands", "Karen", "Kilimani", "Lavington", "Kileleshwa", "Muthaiga", "Runda", "Gigiri", "Spring Valley", "Nyari", "Loresho", "Kitisuru", "Mlolongo", "Syokimau", "Thika Road", "CBD", "South B", "South C", "Eastleigh", "Parklands", "Highridge"],
      },
      {
        name: "Mombasa",
        neighborhoods: ["Nyali", "Diani", "Bamburi", "Shanzu", "Kisauni", "Mtwapa", "Likoni", "Tudor", "Changamwe", "Voi"],
      },
      {
        name: "Kisumu",
        neighborhoods: ["Milimani", "Mamboleo", "Kondele", "Riat", "Nyalenda", "Tom Mboya"],
      },
      {
        name: "Nakuru",
        neighborhoods: ["Milimani", "Freehold", "Section 58", "London", "Kiamunyi"],
      },
    ],
    phonePrefix: "+254",
    measurementSystem: "metric",
  },
  {
    code: "rwanda",
    name: "Rwanda",
    flag: "\u{1F1F7}\u{1F1FC}",
    currency: "Rwandan Franc",
    currencyCode: "RWF",
    currencySymbol: "RF",
    languages: [
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
      { code: "kinyarwanda", name: "Kinyarwanda", flag: "\u{1F1F7}\u{1F1FC}" },
      { code: "french", name: "French", flag: "\u{1F1EB}\u{1F1F7}" },
    ],
    cities: [
      {
        name: "Kigali",
        neighborhoods: ["Kiyovu", "Nyarugenge", "Kimihurura", "Kacyiru", "Remera", "Kicukiro", "Gikondo", "Gisozi", "Kabeza", "Masaka", "Niboye", "Kabuga"],
      },
    ],
    phonePrefix: "+250",
    measurementSystem: "metric",
  },
  {
    code: "somalia",
    name: "Somalia",
    flag: "\u{1F1F8}\u{1F1F4}",
    currency: "Somali Shilling",
    currencyCode: "SOS",
    currencySymbol: "Sh",
    languages: [
      { code: "somali", name: "Somali", flag: "\u{1F1F8}\u{1F1F4}" },
      { code: "arabic", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
    ],
    cities: [
      {
        name: "Mogadishu",
        neighborhoods: ["Hodan", "Wadajir", "Deynile", "Hamar Weyne", "Abdiaziz", "Bondhere", "Warta Nabada", "Yaqshiid"],
      },
      {
        name: "Hargeisa",
        neighborhoods: ["26 June", "Gacan Libaax", "Ahmed Dhagax"],
      },
    ],
    phonePrefix: "+252",
    measurementSystem: "metric",
  },
  {
    code: "southsudan",
    name: "South Sudan",
    flag: "\u{1F1F8}\u{1F1F8}",
    currency: "South Sudanese Pound",
    currencyCode: "SSP",
    currencySymbol: "\u00A3",
    languages: [
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
      { code: "arabic", name: "Juba Arabic", flag: "\u{1F1F8}\u{1F1F8}" },
      { code: "dinka", name: "Dinka", flag: "\u{1F1F8}\u{1F1F8}" },
    ],
    cities: [
      {
        name: "Juba",
        neighborhoods: ["Juba Town", "Customs", "Nimule Road", "Munuki", "Rumbek", "Thongpiny"],
      },
    ],
    phonePrefix: "+211",
    measurementSystem: "metric",
  },
  {
    code: "tanzania",
    name: "Tanzania",
    flag: "\u{1F1F9}\u{1F1FF}",
    currency: "Tanzanian Shilling",
    currencyCode: "TZS",
    currencySymbol: "TSh",
    languages: [
      { code: "swahili", name: "Swahili", flag: "\u{1F1F9}\u{1F1FF}" },
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
    ],
    cities: [
      {
        name: "Dar es Salaam",
        neighborhoods: ["Kijitonyama", "Masaki", "Oysterbay", "Msasani", "Kinondoni", "Mikocheni", "Ubungo", "Mbezi", "Tegeta", "Kigamboni", "City Centre", "Ilala", "Kariakoo", "Upanga", "Peninsula"],
      },
      {
        name: "Arusha",
        neighborhoods: ["Thema", "Sakina", "Kijenge", "Unga Limited", "Njiro", "Sekei"],
      },
      {
        name: "Mwanza",
        neighborhoods: ["Capri Point", "Mabatini", "Nyamagana", "Isamilo"],
      },
      {
        name: "Dodoma",
        neighborhoods: ["Majengo", "Area D", "Chamwino"],
      },
    ],
    phonePrefix: "+255",
    measurementSystem: "metric",
  },
  {
    code: "uganda",
    name: "Uganda",
    flag: "\u{1F1FA}\u{1F1EC}",
    currency: "Ugandan Shilling",
    currencyCode: "UGX",
    currencySymbol: "USh",
    languages: [
      { code: "english", name: "English", flag: "\u{1F1EC}\u{1F1E7}" },
      { code: "swahili", name: "Swahili", flag: "\u{1F1FA}\u{1F1EC}" },
      { code: "luganda", name: "Luganda", flag: "\u{1F1FA}\u{1F1EC}" },
    ],
    cities: [
      {
        name: "Kampala",
        neighborhoods: ["Kololo", "Nakasero", "Bugolobi", "Muyenga", "Kira", "Bukoto", "Kansanga", "Ntinda", "Lugogo", "Industrial Area", "Makindye", "Rubaga", "Kawempe", "Bweyogerere", "Munyonyo", "Entebbe Road"],
      },
      {
        name: "Entebbe",
        neighborhoods: ["Kitoro", "Bugonga", "Kajjansi", "Lugala"],
      },
      {
        name: "Jinja",
        neighborhoods: ["Walukuba", "Njeru", "Budumbuli"],
      },
    ],
    phonePrefix: "+256",
    measurementSystem: "metric",
  },
];

/** Sorted list for display in dropdowns */
export const COUNTRIES_SORTED = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

/** All country codes as a tuple for Zod enum generation */
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [
  string,
  ...string[],
];

export function getCountryConfig(code: string): CountryConfig | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function formatPrice(countryCode: string, price: number): string {
  const country = getCountryConfig(countryCode);
  if (!country) return `${price.toLocaleString()}`;
  return `${country.currencySymbol} ${price.toLocaleString()}`;
}

export function getCountryLanguages(
  countryCode: string
): { code: string; name: string; flag: string }[] {
  const country = getCountryConfig(countryCode);
  return country?.languages || [];
}

export function getCountryCities(countryCode: string): string[] {
  const country = getCountryConfig(countryCode);
  return country?.cities.map((c) => c.name) || [];
}

export function getNeighborhoods(
  countryCode: string,
  cityName: string
): string[] {
  const country = getCountryConfig(countryCode);
  const city = country?.cities.find((c) => c.name === cityName);
  return city?.neighborhoods || [];
}

/** Get hashtags for a country for social media posts */
export function getCountryHashtags(countryCode: string): string[] {
  const country = getCountryConfig(countryCode);
  if (!country) return ["#RealEstate #PropertyForSale #EastAfrica"];
  const mainCity = country.cities[0]?.name || country.name;
  return [
    `#${mainCity.replace(/\s/g, "")}Properties`,
    `#${country.name.replace(/\s/g, "")}RealEstate`,
    `#Property${country.name.replace(/\s/g, "")}`,
    `#${country.flag}RealEstate`,
    `#InvestIn${country.name.replace(/\s/g, "")}`,
    `#Buy${country.name.replace(/\s/g, "")}`,
  ];
}
