import { getCountryData as getCountryInfo, getCountryDataList as getCountryInfoList } from 'countries-list';
import states from 'states-us';

export const getCountryData = (iso) => {
  const item = getCountryInfo(iso)  
  return item
}

export const getCountryDataList = () => {
  const itemList = getCountryInfoList()  
  // [
  //   {
  //     name: 'Ukraine',
  //     native: 'Україна',
  //     iso2: "UK",
  //     phone: [380],
  //     continent: 'EU',
  //     capital: 'Kyiv',
  //     currency: ['UAH'],
  //     languages: ['uk'],
  //   }
  // ]
  return itemList
}

export const getUsaStateList = () => {
  return states
}

export const getStateData = (abbreviation) => {
  const item = states.find((e)=>e['abbreviation'] === abbreviation)    
  return item
}