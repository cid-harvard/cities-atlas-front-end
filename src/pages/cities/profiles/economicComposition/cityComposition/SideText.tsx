import React from 'react';
import StandardSideTextBlock from '../../../../../components/general/StandardSideTextBlock';
import {
  ContentParagraph,
  ContentTitle,
} from '../../../../../styling/styleUtils';
import useFluent, {possessive, ordinalNumber} from '../../../../../hooks/useFluent';
import useCurrentCity from '../../../../../hooks/useCurrentCity';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';
import StandardSideTextLoading from '../../../../../components/transitionStateComponents/StandardSideTextLoading';
import {formatNumberLong} from '../../../../../Utils';
import {useEconomicCompositionQuery} from '../../../../../components/dataViz/treeMap/CompositionTreeMap';
import {
  useGlobalIndustryMap,
} from '../../../../../hooks/useGlobalIndustriesData';
import {DigitLevel, CompositionType, CityPeerGroupCounts} from '../../../../../types/graphQL/graphQLTypes';
import orderBy from 'lodash/orderBy';
import { useQuery, gql } from '@apollo/client';
import Helmet from 'react-helmet';

const ADDITIONAL_ECON_COMP_DATA = gql`
  query GetPeerGroupCityCounts($cityId: Int!) {
    cityPeerGroupCounts(cityId: $cityId) {
      region
    }
  }
`;

interface SuccessResponse {
  cityPeerGroupCounts: {region: CityPeerGroupCounts['region']};
}


interface Props {
  year: number;
  cityId: number;
  compositionType: CompositionType;
}

interface IndustryDatum {
  name: string;
  sector: string;
  count: number;
}

const SideText = ({year, cityId, compositionType}: Props) => {
  const getString = useFluent();
  const {loading, city} = useCurrentCity();
  const locations = useGlobalLocationData();
  const composition = useEconomicCompositionQuery({year, cityId});
  const industryMap = useGlobalIndustryMap();
  const additional = useQuery<SuccessResponse, {cityId: number}>(ADDITIONAL_ECON_COMP_DATA, {
    variables: {cityId} });
  if (loading || locations.loading || composition.loading || additional.loading) {
    return <StandardSideTextLoading />;
  } else if (city && locations.data && composition.data && composition.data.industries.length &&
    additional.data
  ) {
    const cityName = city.name ? city.name : '';
    const cityNamePlural = possessive([cityName]);
    const {countries, regions} = locations.data;
    const {industries} = composition.data;
    const country = countries.find(d => city.countryId !== null && d.countryId === city.countryId.toString());
    const region = regions.find(d => city.region !== null && d.regionId === city.region.toString());

    let total = 0;
    let totalEmploy = 0;
    const allSectors: IndustryDatum[] = [];
    const allDigitThreeIndustries: IndustryDatum[] = [];
    industries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      const companies = numCompany ? numCompany : 0;
      const employees = numEmploy ? numEmploy : 0;
      const count = compositionType === CompositionType.Companies ? companies : employees;
      if (industry && industry.level === DigitLevel.Three) {
        const {name, naicsIdTopParent} = industry;
        allDigitThreeIndustries.push({
          count,
          name: name ? name : '',
          sector: naicsIdTopParent.toString(),
        });
      }
      if (industry && industry.level === DigitLevel.Sector) {
        total = compositionType === CompositionType.Companies ? total + companies : total + employees;
        totalEmploy = totalEmploy + employees;
        const {name, naicsIdTopParent} = industry;
        allSectors.push({
          count,
          name: name ? name : '',
          sector: naicsIdTopParent.toString(),
        });
      }
    });

    const largestSector: IndustryDatum | undefined = orderBy(allSectors, ['count'], ['desc'])[0];
    if (!largestSector) {
      return <StandardSideTextLoading />;
    }
    const largest3DigitIndustryInSector = orderBy(
      allDigitThreeIndustries.filter(d => d.sector === largestSector.sector), ['count'], ['desc'],
    )[0];

    const secondLargestSector: IndustryDatum | undefined = orderBy(allSectors, ['count'], ['desc'])[1];
    if (!secondLargestSector) {
      return <StandardSideTextLoading />;
    }
    const secondLargest3DigitIndustryInSector = orderBy(
      allDigitThreeIndustries.filter(d => d.sector === secondLargestSector.sector), ['count'], ['desc'],
    )[0];

    const title = getString('economic-composition-title', {
      'name-plural': cityNamePlural,
    });
    const para1 = getString('economic-composition-para-1', {
      'name': cityName,
      'name-plural': cityNamePlural,
      'income-level': getString('global-formatted-income-class', {type: city.incomeClass}),
      'country': country ? country.nameShortEn : '',
      'pop-year': '2015',
      'population': formatNumberLong(city.population ? city.population : 0),
      'gdppc': formatNumberLong(city.gdppc ? city.gdppc : 0),
      'region-size-rank': ordinalNumber([city.regionPopRank ? city.regionPopRank : 0]),
      'region-wealth-rank': ordinalNumber([city.regionGdppcRank ? city.regionGdppcRank : 0]),
      'region-name': region ? region.regionName : '',
      'region-city-count': additional.data.cityPeerGroupCounts.region,
      'num-employ': formatNumberLong(totalEmploy),
    });

    const para2 = getString('economic-composition-para-2', {
      'name': cityName,
      'largest-sector': largestSector.name,
      'largest-sector-share-percent': parseFloat((largestSector.count / total * 100).toFixed(2)),
      'composition-type': compositionType,
      'largest-3-digit-industry-in-sector': largest3DigitIndustryInSector.name,
      'largest-3-digit-industry-in-sector-share-percent':
        parseFloat((largest3DigitIndustryInSector.count / total * 100).toFixed(2)),
      'second-largest-sector': secondLargestSector.name,
      'second-largest-sector-share-percent': parseFloat((secondLargestSector.count / total * 100).toFixed(2)),
      'second-largest-3-digit-industry-in-sector': secondLargest3DigitIndustryInSector.name,
      'second-largest-3-digit-industry-in-sector-share-percent':
        parseFloat((secondLargest3DigitIndustryInSector.count / total * 100).toFixed(2)),
    });

    return (
      <StandardSideTextBlock>
        <Helmet>
          <title>{title + ' | ' + getString('meta-data-title-default-suffix')}</title>
          <meta property='og:title' content={title + ' | ' + getString('meta-data-title-default-suffix')} />
        </Helmet>
        <ContentTitle>{title}</ContentTitle>
        <ContentParagraph>{para1}</ContentParagraph>
        <ContentParagraph>{para2}</ContentParagraph>
      </StandardSideTextBlock>
    );
  } else {
    return null;
  }

};

export default SideText;
