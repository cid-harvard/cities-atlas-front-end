import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React, {useState} from 'react';
import {
  ContentGrid,
} from '../../../../styling/styleUtils';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import SimilarCitiesMap from '../../../../components/dataViz/similarCitiesMap';
import useQueryParams from '../../../../hooks/useQueryParams';
import {CityNodeSizing, defaultCityNodeSizing} from '../../../../routing/routes';
import {formatNumberLong} from '../../../../Utils';
import useLayoutData from '../../../../components/dataViz/similarCitiesMap/useLayoutData';
import {extent} from 'd3-array';
import SideText from './SideText';

const SimilarCities = () => {
  const cityId = useCurrentCityId();
  const {city_node_sizing} = useQueryParams();
  const {data} = useLayoutData();
  const [timeStamp] = useState<number>(new Date().getTime());

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-invalid-city'} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  const nodeSizing = city_node_sizing ? city_node_sizing : defaultCityNodeSizing;
  let nodeSizingTitle: string | undefined;
  let nodeSizingMinText: string | undefined;
  let nodeSizingMaxText: string | undefined;
  if (data && data.cityGeoJson) {
    if (nodeSizing === CityNodeSizing.population) {
      const [minPop, maxPop] = extent(
        data.cityGeoJson.features.map((f: any) => f.properties.population)) as unknown as [number, number];
      nodeSizingTitle = 'Node Size by Population';
      nodeSizingMinText = formatNumberLong(minPop);
      nodeSizingMaxText = formatNumberLong(maxPop);
    } else if (nodeSizing === CityNodeSizing.gdpPpp) {
      const [minGdpPpp, maxGdpPpp] = extent(
        data.cityGeoJson.features.map((f: any) => f.properties.gdpPpp)) as unknown as [number, number];
      nodeSizingTitle = 'Node Size by GDP PPP';
      nodeSizingMinText = formatNumberLong(minGdpPpp);
      nodeSizingMaxText = formatNumberLong(maxGdpPpp);
    }
  }

  return (
    <DefaultContentWrapper>

      <ContentGrid>
        <SideText
          nodeSizingTitle={nodeSizingTitle}
          nodeSizingMinText={nodeSizingMinText}
          nodeSizingMaxText={nodeSizingMaxText}
        />
        <SimilarCitiesMap timeStamp={timeStamp} />
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default SimilarCities;
