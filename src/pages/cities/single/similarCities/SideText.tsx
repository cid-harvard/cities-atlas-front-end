import React from 'react';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';
import {
  ContentParagraph,
  ContentTitle,
} from '../../../../styling/styleUtils';
import useFluent from '../../../../hooks/useFluent';
import useCurrentCity from '../../../../hooks/useCurrentCity';
import StandardSideTextLoading from '../../../../components/transitionStateComponents/StandardSideTextLoading';
import NodeLegend from '../../../../components/dataViz/legend/NodeLegend';
import useProximityData from '../../../../components/dataViz/similarCitiesMap/useProximityData';
import useGlobalLocationData from '../../../../hooks/useGlobalLocationData';
import orderBy from 'lodash/orderBy';

interface Props {
  nodeSizingMinText: string | undefined;
  nodeSizingMaxText: string | undefined;
  nodeSizingTitle: string | undefined;
}

const SideText = (props: Props) => {
  const {
    nodeSizingTitle, nodeSizingMaxText, nodeSizingMinText,
  } = props;
  const getString = useFluent();
  const {loading, city} = useCurrentCity();
  const proximity = useProximityData();
  const locations = useGlobalLocationData();

  if (loading || proximity.loading || locations.loading) {
    return <StandardSideTextLoading />;
  } else if (city && proximity.data && locations.data) {
    const cityName = city.name ? city.name : '';

    const locationsData = locations.data;
    const topCity = orderBy(proximity.data.cities, ['proximity'], ['desc']).slice(0, 3).map(d => {
      const partnerCity = locationsData.cities.find(c => c.cityId === d.partnerId);
      return partnerCity ? partnerCity.name : '';
    });

    const title = getString('city-similarity-title', {
      'name': cityName,
    });
    const para1 = getString('city-similarity-para-1', {
      'name': cityName,
      'top-city-1': topCity[0],
      'top-city-2': topCity[1],
      'top-city-3': topCity[2],
    });

    return (
      <StandardSideTextBlock>
        <ContentTitle>{title}</ContentTitle>
        <ContentParagraph>{para1}</ContentParagraph>
        <NodeLegend
          sizeBy={nodeSizingMinText && nodeSizingMaxText && nodeSizingTitle ? {
              title: nodeSizingTitle,
              minLabel: nodeSizingMinText,
              maxLabel: nodeSizingMaxText,
            } : null
          }
          colorBy={null}
        />
      </StandardSideTextBlock>
    );
  } else {
    return null;
  }

};

export default SideText;
