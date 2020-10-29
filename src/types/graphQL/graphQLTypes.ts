export enum DigitLevel {
  Sector = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
}

export const defaultDigitLevel: DigitLevel = DigitLevel.Three;

export enum CompositionType {
  Companies = 'companies',
  Employees = 'employees',
}

export const defaultCompositionType: CompositionType = CompositionType.Companies;


export interface ClassificationNaicsIndustry {
  naicsId: string;
  code: string | null;
  name: string | null;
  level: DigitLevel | null;
  parentId: number | null;
  parentCode: string | null;
  codeHierarchy: string | null;
  naicsIdHierarchy: string | null;
  id: string;
}

export enum IncomeClassType {
  HIC = 'HIC',
  UMIC = 'UMIC',
  LMIC = 'LMIC',
  LIC = 'LIC',
  OTHER = 'OTHER',
}

export enum DevGroupType {
  MDR = 'MDR',
  LDC = 'LDC',
  LDCL = 'LDCL',
}

export type GeoJSONString = string;

export interface ClassificationCity {
  cityId: string;
  name: string | null;
  included: boolean | null;
  regionId: number | null;
  countryId: number | null;
  nameList: string[] | null;
  centroidLat: number | null;
  centroidLon: number | null;
  area: number | null;
  crossBorder: boolean | null;
  numCountries: number | null;
  countryList: string | null;
  avgElevation: number | null;
  climateClass: string | null;
  avgPrecip14: number | null;
  avgTemp14: number | null;
  builtArea15: number | null;
  population15: number | null;
  builtAreaPc15: number | null;
  gdpPpp15: number | null;
  incomeClass: IncomeClassType | null;
  devGroup: DevGroupType | null;
  travelTimeToCapital: number | null;
  avgGreenness14: number | null;
  concentrationPm2514: number | null;
  potentialFloodArea: number | null;
  potentialFloodBuiltArea15: number | null;
  potentialFloodPop15: number | null;
  potentialStormSurgeArea: number | null;
  potentialStormSurgeBuiltArea15: number | null;
  potentialStormSurgePop15: number | null;
  earthquakeMmiClass: number | null;
  heatwaveMaxIndex: number | null;
  landUseEfficiency15: number | null;
  popGreenArea15: number | null;
  openSpace15: number | null;
  geometry: GeoJSONString | null;
  id: string;
}

export interface ClassificationCountry {
  countryId: string;
  code: string | null;
  nameEn: string | null;
  nameShortEn: string | null;
  regionId: number;
  id: string;
}

export interface ClassificationRegion {
  regionId: string;
  regionMajor: string | null;
  regionMinor: string | null;
  id: string;
}

export interface CityIndustryYear {
  cityId: string;
  naicsId: string;
  year: string;
  numEmploy: number | null;
  numCompany: number | null;
  level: DigitLevel | null;
  id: string;
}

export interface RootQuery {
  classificationNaicsIndustryList: ClassificationNaicsIndustry[];
  classificationNaicsIndustry: ClassificationNaicsIndustry;
  classificationCityList: ClassificationCity[];
  classificationCity: ClassificationCity;
  classificationCountryList: ClassificationCountry[];
  classificationCountry: ClassificationCountry;
  classificationRegionList: ClassificationRegion[];
  classificationRegion: ClassificationRegion;
  cityIndustryYearList: CityIndustryYear[];
}