export enum DigitLevel {
  Sector = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
}
export enum ClusterLevel {
  C1 = 1,
  C2 = 2,
  C3 = 3,
}

export const defaultDigitLevel: DigitLevel = DigitLevel.Three;

export enum CompositionType {
  Companies = 'establishments',
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
  naicsIdTopParent: number;
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
  rcaNumEmploy: number | null;
  rcaNumCompany: number | null;
  densityEmploy: number | null;
  densityCompany: number | null;
  id: string;
}

export interface GlobalIndustryYear {
  naicsId: number;
  naicsIdTopParent: number;
  year: number;
  level: number;
  sumNumCompany: number;
  sumNumEmploy: number;
  avgNumCompany: number;
  avgNumEmploy: number;
}

export interface CityClusterYear {
  cityId: string;
  clusterId: string;
  level: number | null;
  year: string;
  numEmploy: number | null;
  numCompany: number | null;
  rcaNumEmploy: number | null;
  rcaNumCompany: number | null;
  id: string;
}

export interface ClassificationNaicsCluster {
  clusterId: string;
  parentId: number | null;
  clusterIdTopParent: number | null;
  level: number | null;
  name: string | null;
  id: string;
}

export interface GlobalIndustryAgg {
  naicsId: number;
  naicsIdTopParent: number;
  year: number;
  level: number;
  sumNumCompany: number;
  sumNumEmploy: number;
  avgNumCompany: number;
  avgNumEmploy: number;
}

export interface CityPartner {
  cityId: string;
  partnerId: string;
  proximity: number | null;
  id: string;
}

export interface NaicsIndustry {
  naicsId: string;
  yearsEducation: number;
  hourlyWage: number;
  jobs: number;
  valueAdded: number;
  acidRain: number;
  freshwaterEcotoxicity: number;
  eutrophication: number;
  climateChange: number;
  healthCancer: number;
  healthNoncancer: number;
  healthRespiratoryEffects: number;
  healthCancerNoncancer: number;
  ozoneDepletion: number;
  smog: number;
  hazardousAirPollutantRelease: number;
  metalRelease: number;
  pesticideRelease: number;
  energyUse: number;
  landUse: number;
  mineralMetalUse: number;
  nonrenewableEnergyUse: number;
  renewableEnergyUse: number;
  waterUse: number;
  id: string;
  level: DigitLevel | null;
}

export interface ClusterIndustry {
  clusterId: string;
  level: ClusterLevel;
  yearsEducation: number;
  hourlyWage: number;
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
  cityClusterYearList: CityClusterYear[];
  classificationNaicsClusterList: ClassificationNaicsCluster[];
  globalIndustryYear: GlobalIndustryAgg[];
  cityPartnerList: CityPartner[];
  naicsIndustry: NaicsIndustry;
  naicsIndustryList: NaicsIndustry[];
  clusterIndustry: ClusterIndustry;
  clusterIndustryList: ClusterIndustry[];
}
