// Minimal ISO 3166-2 region dataset for common countries.
// Extend as needed; if a country is missing here, the address component will fall back to a text input.

export interface CountryRegions {
  label: string
  options: { code: string; name: string }[]
}

export const ISO_COUNTRY_REGIONS: Record<string, CountryRegions> = {
  'United States': {
    label: 'State',
    options: [
      { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' }, { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
      { code: 'DC', name: 'District of Columbia' }, { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
    ],
  },
  Canada: {
    label: 'Province',
    options: [
      { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' }, { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'NS', name: 'Nova Scotia' }, { code: 'NT', name: 'Northwest Territories' },
      { code: 'NU', name: 'Nunavut' }, { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' }, { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' }, { code: 'YT', name: 'Yukon' }
    ],
  },
  Australia: {
    label: 'State/Territory',
    options: [
      { code: 'ACT', name: 'Australian Capital Territory' }, { code: 'NSW', name: 'New South Wales' }, { code: 'NT', name: 'Northern Territory' },
      { code: 'QLD', name: 'Queensland' }, { code: 'SA', name: 'South Australia' }, { code: 'TAS', name: 'Tasmania' }, { code: 'VIC', name: 'Victoria' },
      { code: 'WA', name: 'Western Australia' }
    ],
  },
  'United Kingdom': {
    label: 'County/Region',
    options: [
      { code: 'ENG', name: 'England' }, { code: 'NIR', name: 'Northern Ireland' }, { code: 'SCT', name: 'Scotland' }, { code: 'WLS', name: 'Wales' }
    ],
  },
  India: {
    label: 'State/UT',
    options: [
      { code: 'AP', name: 'Andhra Pradesh' }, { code: 'AR', name: 'Arunachal Pradesh' }, { code: 'AS', name: 'Assam' }, { code: 'BR', name: 'Bihar' },
      { code: 'CT', name: 'Chhattisgarh' }, { code: 'GA', name: 'Goa' }, { code: 'GJ', name: 'Gujarat' }, { code: 'HR', name: 'Haryana' },
      { code: 'HP', name: 'Himachal Pradesh' }, { code: 'JH', name: 'Jharkhand' }, { code: 'KA', name: 'Karnataka' }, { code: 'KL', name: 'Kerala' },
      { code: 'MP', name: 'Madhya Pradesh' }, { code: 'MH', name: 'Maharashtra' }, { code: 'MN', name: 'Manipur' }, { code: 'ML', name: 'Meghalaya' },
      { code: 'MZ', name: 'Mizoram' }, { code: 'NL', name: 'Nagaland' }, { code: 'OR', name: 'Odisha' }, { code: 'PB', name: 'Punjab' },
      { code: 'RJ', name: 'Rajasthan' }, { code: 'SK', name: 'Sikkim' }, { code: 'TN', name: 'Tamil Nadu' }, { code: 'TG', name: 'Telangana' },
      { code: 'TR', name: 'Tripura' }, { code: 'UP', name: 'Uttar Pradesh' }, { code: 'UT', name: 'Uttarakhand' }, { code: 'WB', name: 'West Bengal' },
      { code: 'AN', name: 'Andaman and Nicobar Islands' }, { code: 'CH', name: 'Chandigarh' }, { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu' },
      { code: 'DL', name: 'Delhi' }, { code: 'JK', name: 'Jammu and Kashmir' }, { code: 'LA', name: 'Ladakh' }, { code: 'LD', name: 'Lakshadweep' },
      { code: 'PY', name: 'Puducherry' }
    ],
  },
  Nigeria: {
    label: 'State',
    options: [
      { code: 'AB', name: 'Abia' }, { code: 'FC', name: 'Abuja (FCT)' }, { code: 'AD', name: 'Adamawa' }, { code: 'AK', name: 'Akwa Ibom' },
      { code: 'AN', name: 'Anambra' }, { code: 'BA', name: 'Bauchi' }, { code: 'BY', name: 'Bayelsa' }, { code: 'BE', name: 'Benue' },
      { code: 'BO', name: 'Borno' }, { code: 'CR', name: 'Cross River' }, { code: 'DE', name: 'Delta' }, { code: 'EB', name: 'Ebonyi' },
      { code: 'ED', name: 'Edo' }, { code: 'EK', name: 'Ekiti' }, { code: 'EN', name: 'Enugu' }, { code: 'GO', name: 'Gombe' },
      { code: 'IM', name: 'Imo' }, { code: 'JI', name: 'Jigawa' }, { code: 'KD', name: 'Kaduna' }, { code: 'KN', name: 'Kano' },
      { code: 'KT', name: 'Katsina' }, { code: 'KE', name: 'Kebbi' }, { code: 'KO', name: 'Kogi' }, { code: 'KW', name: 'Kwara' },
      { code: 'LA', name: 'Lagos' }, { code: 'NA', name: 'Nasarawa' }, { code: 'NI', name: 'Niger' }, { code: 'OG', name: 'Ogun' },
      { code: 'ON', name: 'Ondo' }, { code: 'OS', name: 'Osun' }, { code: 'OY', name: 'Oyo' }, { code: 'PL', name: 'Plateau' },
      { code: 'RI', name: 'Rivers' }, { code: 'SO', name: 'Sokoto' }, { code: 'TA', name: 'Taraba' }, { code: 'YO', name: 'Yobe' }, { code: 'ZA', name: 'Zamfara' }
    ],
  },
  'South Africa': {
    label: 'Province',
    options: [
      { code: 'EC', name: 'Eastern Cape' }, { code: 'FS', name: 'Free State' }, { code: 'GP', name: 'Gauteng' }, { code: 'KZN', name: 'KwaZulu-Natal' },
      { code: 'LP', name: 'Limpopo' }, { code: 'MP', name: 'Mpumalanga' }, { code: 'NC', name: 'Northern Cape' }, { code: 'NW', name: 'North West' },
      { code: 'WC', name: 'Western Cape' }
    ],
  },
}

export function getCountryRegionMeta(country?: string): CountryRegions | undefined {
  if (!country) return undefined
  return ISO_COUNTRY_REGIONS[country]
}

