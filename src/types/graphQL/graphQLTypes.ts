export interface ClassificationNaicsIndustry {
  naicsId: string;
  code: string | null;
  name: string | null;
  level: number | null;
  parentId: number | null;
  parentCode: string | null;
  codeHierarchy: string | null;
  naicsIdHierarchy: string | null;
  id: string;
}

export interface ClassificationCity {
  cityId: string;
  name: string | null;
  nameList: string | null;
  centroidLat: number | null;
  centroidLon: number | null;
  area: number | null;
  crossBorder: boolean | null;
  numCountries: number | null;
  countryList: string | null;
  included: boolean | null;
  regionId: number | null;
  countryId: number | null;
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

export interface RootQuery {
  classificationNaicsIndustryList: ClassificationNaicsIndustry[];
  classificationNaicsIndustry: ClassificationNaicsIndustry;
  classificationCityList: ClassificationCity[];
  classificationCity: ClassificationCity;
  classificationCountryList: ClassificationCountry[];
  classificationCountry: ClassificationCountry;
  classificationRegionList: ClassificationRegion[];
  classificationRegion: ClassificationRegion;
}