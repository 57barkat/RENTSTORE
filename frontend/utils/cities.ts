export const pakistaniCities = [
  "Ahmed Nager Chatha",
  "Ahmadpur East",
  "Ali Khan Abad",
  "Attock",
  "Bahawalnagar",
  "Bahawalpur",
  "Bhakkar",
  "Burewala",
  "Chakwal",
  "Chichawatni",
  "Dera Ghazi Khan",
  "Faisalabad",
  "Gujranwala",
  "Gujrat",
  "Hafizabad",
  "Hyderabad",
  "Islamabad",
  "Jacobabad",
  "Jhang",
  "Jhelum",
  "Kasur",
  "Khanewal",
  "Karachi",
  "Khushab",
  "Lahore",
  "Larkana",
  "Mandi Bahauddin",
  "Mianwali",
  "Multan",
  "Muzaffargarh",
  "Nankana Sahib",
  "Narowal",
  "Okara",
  "Peshawar",
  "Rahim Yar Khan",
  "Rawalpindi",
  "Sahiwal",
  "Sargodha",
  "Sheikhupura",
  "Sialkot",
  "Sukkur",
  "Vehari",
  "Wah Cantonment",
  "Wazirabad",
];
export const normalizeText = (value?: string) =>
  value?.trim().replace(/\s+/g, " ").toLowerCase();

export const getCitySuggestions = (
  input: string,
  cities: string[],
  limit = 5,
) => {
  const q = normalizeText(input);
  if (!q) return [];

  return cities
    .filter((city) => city.toLowerCase().startsWith(q))
    .slice(0, limit);
};
