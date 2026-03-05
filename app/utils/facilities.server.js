export const NY_FACILITIES = [
  { name: "Adirondack Correctional Facility", address1: "196 Ray Brook Road", city: "Ray Brook", state: "NY", zip: "12977" },
  { name: "Albion Correctional Facility", address1: "3595 State School Road", city: "Albion", state: "NY", zip: "14411" },
  { name: "Altona Correctional Facility", address1: "555 Devils Den Road", city: "Altona", state: "NY", zip: "12910" },
  { name: "Attica Correctional Facility", address1: "639 Exchange Street", city: "Attica", state: "NY", zip: "14011" },
  { name: "Auburn Correctional Facility", address1: "135 State Street", city: "Auburn", state: "NY", zip: "13021" },
  { name: "Bare Hill Correctional Facility", address1: "181 Brand Road", city: "Malone", state: "NY", zip: "12953" },
  { name: "Bedford Hills Correctional Facility", address1: "247 Harris Road", city: "Bedford Hills", state: "NY", zip: "10507" },
  { name: "Cape Vincent Correctional Facility", address1: "36560 Route 12E", city: "Cape Vincent", state: "NY", zip: "13618" },
  { name: "Cayuga Correctional Facility", address1: "2202 Route 38A", city: "Moravia", state: "NY", zip: "13118" },
  { name: "Clinton Correctional Facility", address1: "1156 Route 374", city: "Dannemora", state: "NY", zip: "12929" },
  { name: "Collins Correctional Facility", address1: "Middle Road, P.O. Box 490", city: "Collins", state: "NY", zip: "14034" },
  { name: "Coxsackie Correctional Facility", address1: "11260 Route 9W", city: "Coxsackie", state: "NY", zip: "12051" },
  { name: "Downstate Correctional Facility", address1: "121 Red Schoolhouse Road", city: "Fishkill", state: "NY", zip: "12524" },
  { name: "Eastern NY Correctional Facility", address1: "30 Institution Road", city: "Napanoch", state: "NY", zip: "12458" },
  { name: "Edgecombe Correctional Facility", address1: "611 Edgecombe Avenue", city: "New York", state: "NY", zip: "10032" },
  { name: "Elmira Correctional Facility", address1: "1879 Davis Street", city: "Elmira", state: "NY", zip: "14901" },
  { name: "Fishkill Correctional Facility", address1: "18 Scheck Road", city: "Beacon", state: "NY", zip: "12508" },
  { name: "Five Points Correctional Facility", address1: "6600 State Route 96", city: "Romulus", state: "NY", zip: "14541" },
  { name: "Franklin Correctional Facility", address1: "62 Bare Hill Road", city: "Malone", state: "NY", zip: "12953" },
  { name: "Gouverneur Correctional Facility", address1: "112 Scotch Settlement Road", city: "Gouverneur", state: "NY", zip: "13642" },
  { name: "Gowanda Correctional Facility", address1: "South Road, P.O. Box 311", city: "Gowanda", state: "NY", zip: "14070" },
  { name: "Great Meadow Correctional Facility", address1: "11739 State Route 22", city: "Comstock", state: "NY", zip: "12821" },
  { name: "Green Haven Correctional Facility", address1: "594 Route 216", city: "Stormville", state: "NY", zip: "12582" },
  { name: "Greene Correctional Facility", address1: "165 Plank Road", city: "Coxsackie", state: "NY", zip: "12051" },
  { name: "Groveland Correctional Facility", address1: "7000 Sonyea Road", city: "Sonyea", state: "NY", zip: "14556" },
  { name: "Hale Creek Correctional Facility", address1: "279 Maloney Road", city: "Johnstown", state: "NY", zip: "12095" },
  { name: "Hudson Correctional Facility", address1: "50 East Court Street", city: "Hudson", state: "NY", zip: "12534" },
  { name: "Lakeview Shock Incarceration Facility", address1: "9300 Lake Avenue", city: "Brocton", state: "NY", zip: "14716" },
  { name: "Lincoln Correctional Facility", address1: "31-33 West 110th Street", city: "New York", state: "NY", zip: "10026" },
  { name: "Marcy Correctional Facility", address1: "9000 Old River Road", city: "Marcy", state: "NY", zip: "13403" },
  { name: "Mid-State Correctional Facility", address1: "9005 Old River Road", city: "Marcy", state: "NY", zip: "13403" },
  { name: "Mohawk Correctional Facility", address1: "6514 Route 26", city: "Rome", state: "NY", zip: "13440" },
  { name: "Ogdensburg Correctional Facility", address1: "1 Correction Way", city: "Ogdensburg", state: "NY", zip: "13669" },
  { name: "Orleans Correctional Facility", address1: "3531 Gaines Basin Road", city: "Albion", state: "NY", zip: "14411" },
  { name: "Otisville Correctional Facility", address1: "57 Sanitorium Road", city: "Otisville", state: "NY", zip: "10963" },
  { name: "Queensboro Correctional Facility", address1: "47-04 Van Dam Street", city: "Long Island City", state: "NY", zip: "11101" },
  { name: "Riverview Correctional Facility", address1: "1557 Route 63", city: "Ogdensburg", state: "NY", zip: "13669" },
  { name: "Sing Sing Correctional Facility", address1: "354 Hunter Street", city: "Ossining", state: "NY", zip: "10562" },
  { name: "Sullivan Correctional Facility", address1: "325 Riverside Drive", city: "Fallsburg", state: "NY", zip: "12733" },
  { name: "Upstate Correctional Facility", address1: "309 Bare Hill Road", city: "Malone", state: "NY", zip: "12953" },
  { name: "Wallkill Correctional Facility", address1: "50 McKendrick Road", city: "Wallkill", state: "NY", zip: "12589" },
  { name: "Woodbourne Correctional Facility", address1: "99 Prison Road", city: "Woodbourne", state: "NY", zip: "12788" },
];

const FACILITIES_MAP = new Map(NY_FACILITIES.map((f) => [f.name, f]));

export function getFacilityByName(name) {
  return FACILITIES_MAP.get(name) || null;
}

export function getFacilityNames() {
  return NY_FACILITIES.map((f) => f.name);
}
