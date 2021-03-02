import {DefaultContentWrapper} from '../../../../styling/GlobalGrid';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import SimpleError from '../../../../components/transitionStateComponents/SimpleError';
import {LoadingOverlay} from '../../../../components/transitionStateComponents/VizLoadingBlock';
import React from 'react';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';
import {
  ContentGrid,
  ContentParagraph,
  ContentTitle,
} from '../../../../styling/styleUtils';
import UtiltyBar from '../../../../components/navigation/secondaryHeader/UtilityBar';
import SimilarCitiesMap from '../../../../components/dataViz/similarCitiesMap';
import NodeLegend from '../../../../components/dataViz/legend/NodeLegend';
import useQueryParams from '../../../../hooks/useQueryParams';
import {CityNodeSizing, defaultCityNodeSizing} from '../../../../routing/routes';
import {formatNumberLong} from '../../../../Utils';
import useLayoutData from '../../../../components/dataViz/similarCitiesMap/useLayoutData';
import {extent} from 'd3-array';

const SimilarCities = () => {
  const cityId = useCurrentCityId();
  const {city_node_sizing} = useQueryParams();
  const {data} = useLayoutData();

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
        <StandardSideTextBlock>
          <ContentTitle>What Cities Are Similar to my City?</ContentTitle>
          {/* eslint-disable-next-line */}
          <ContentParagraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</ContentParagraph>

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
        <SimilarCitiesMap />
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default SimilarCities;
