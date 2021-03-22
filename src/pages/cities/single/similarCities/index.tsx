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
          <ContentParagraph>{'We can assess the similarity between the economies of different cities in the World by looking at whether they are competitive in the same industries. This similarity is informative because it can reveal industries that are prevalent in economically similar cities, but have yet to be developed in <City>. The cities in the World that are most economically similar to <City> are <Ct>, <Ct> and <Ct>. These cities have been able to develop a number of industries that are still absent in <City>, such as <Ind>, <Ind> and <Ind>.'}</ContentParagraph>

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
        <SimilarCitiesMap timeStamp={new Date().getTime()} />
      </ContentGrid>
      <UtiltyBar />
    </DefaultContentWrapper>
  );
};

export default SimilarCities;
