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

export const defaultCompositionType: CompositionType = CompositionType.Employees;


export interface ClassificationNaicsIndustry {
  naicsId: string;
  code: string;
  name: string | null;
  level: DigitLevel | null;
  parentId: number | null;
  parentCode: string | null;
  codeHierarchy: string | null;
  naicsIdHierarchy: string | null;
  naicsIdTopParent: number;
  tradable: boolean;
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

export enum DataFlagType {
  GREEN = 'GREEN',
  ORANGE = 'ORANGE',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

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
  gdppc: number | null;
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
  regionGdppcRank: number | null;
  regionPopRank: number | null;
  geometry: GeoJSONString | null;
  dataFlag: DataFlagType;
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
  regionName: string;
  subregionId: string;
  subregionName: string;
  regionCity: {
    edges: {
      node: ClassificationCity[],
    },
  };
  subregionCity: {
    edges: {
      node: ClassificationCity[],
    },
  };
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
  shortName: string | null;
  tradable: boolean;
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
  eucdist: number | null;
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

export enum PeerGroup {
  GlobalPopulation = 'global_pop',
  GlobalIncome = 'global_income',
  GlobalEuclideanDistance = 'global_eucdist',
  RegionalPopulation = 'regional_pop',
  RegionalIncome = 'regional_income',
  RegionalEuclideanDistance = 'regional_eucdist',
  Region = 'region',
}

export const isValidPeerGroup = (value: any) =>
  value === PeerGroup.GlobalPopulation ||
  value === PeerGroup.GlobalIncome ||
  value === PeerGroup.GlobalEuclideanDistance ||
  value === PeerGroup.RegionalPopulation ||
  value === PeerGroup.RegionalIncome ||
  value === PeerGroup.RegionalEuclideanDistance ||
  value === PeerGroup.Region;

export interface NaicsRcaCalculation {
  cityId: number | null;
  naicsId: number | null;
  level: number | null;
  year: number | null;
  rca: number | null;
  rcaLb: number | null;
  rcaUb: number | null;
}

export interface ClusterRcaCalculation {
  cityId: number | null;
  clusterId: number | null;
  level: number | null;
  year: number | null;
  rca: number | null;
  rcaLb: number | null;
  rcaUb: number | null;
}

export interface NaicsPeerEconStruct {
  naicsId: number;
  level: DigitLevel;
  year: number;
  totalEmployCount: number;
  avgEmployCount: number;
  avgEmployShare: number;
  totalCompanyCount: number;
  avgCompanyCount: number;
  avgCompanyShare: number;
}

export interface ClusterPeerEconStruct {
  clusterId: number;
  level: ClusterLevel;
  year: number;
  totalEmployCount: number;
  avgEmployCount: number;
  avgEmployShare: number;
  totalCompanyCount: number;
  avgCompanyCount: number;
  avgCompanyShare: number;
}

export interface NaicsDensityRescale {
  cityId: number;
  naicsId: number;
  level: DigitLevel | null;
  year: number | null;
  densityEmploy: number | null;
  densityCompany: number | null;
}
export interface ClusterDensityRescale {
  cityId: number;
  clusterId: number;
  level: ClusterLevel | null;
  year: number | null;
  densityEmploy: number | null;
  densityCompany: number | null;
}
export interface CityPeerGroupCounts {
  cityId: number;
  globalPop: number;
  regionalPop: number;
  globalIncome: number;
  regionalIncome: number;
  globalProximity: number;
  regionalProximity: number;
  globalEucdist: number;
  regionalEucdist: number;
  region: number;
  subregion: number;
}

export interface CityPartnerEucDistScale {
  minGlobalEucdist: number;
  maxGlobalEucdist: number;
}
