import { DefaultContentWrapper } from "../../../../styling/GlobalGrid";
import useCurrentCityId from "../../../../hooks/useCurrentCityId";
import SimpleError from "../../../../components/transitionStateComponents/SimpleError";
import { LoadingOverlay } from "../../../../components/transitionStateComponents/VizLoadingBlock";
import React from "react";
import { ContentGrid } from "../../../../styling/styleUtils";
import UtilityBar from "../../../../components/navigation/secondaryHeader/UtilityBar";
import SimilarCitiesMap from "../../../../components/dataViz/similarCitiesMap";
import useQueryParams from "../../../../hooks/useQueryParams";
import {
  CityNodeSizing,
  defaultCityNodeSizing,
} from "../../../../routing/routes";
import { formatNumberLong } from "../../../../Utils";
import useLayoutData from "../../../../components/dataViz/similarCitiesMap/useLayoutData";
import { extent } from "d3-array";
import SideText from "./SideText";

const SimilarCities = () => {
  const cityId = useCurrentCityId();
  const { city_node_sizing } = useQueryParams();
  const { data } = useLayoutData();

  if (cityId === null) {
    return (
      <DefaultContentWrapper>
        <LoadingOverlay>
          <SimpleError fluentMessageId={"global-ui-error-invalid-city"} />
        </LoadingOverlay>
      </DefaultContentWrapper>
    );
  }

  const nodeSizing = city_node_sizing
    ? city_node_sizing
    : defaultCityNodeSizing;
  let nodeSizingTitle: string | undefined;
  let nodeSizingMinText: string | undefined;
  let nodeSizingMaxText: string | undefined;
  if (data && data.cityGeoJson) {
    if (nodeSizing === CityNodeSizing.population) {
      const [minPop, maxPop] = extent(
        data.cityGeoJson.features.map((f: any) => f.properties.population),
      ) as unknown as [number, number];
      nodeSizingTitle = "Node Size by Population";
      nodeSizingMinText = formatNumberLong(minPop ? minPop : 0);
      nodeSizingMaxText = formatNumberLong(maxPop ? maxPop : 0);
    } else if (nodeSizing === CityNodeSizing.gdpPpp) {
      const [minGdpPpp, maxGdpPpp] = extent(
        data.cityGeoJson.features.map((f: any) => f.properties.gdppc),
      ) as unknown as [number, number];
      nodeSizingTitle = "Node Size by GDP per capita";
      nodeSizingMinText = "$" + formatNumberLong(minGdpPpp ? minGdpPpp : 0);
      nodeSizingMaxText = "$" + formatNumberLong(maxGdpPpp ? maxGdpPpp : 0);
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
        <SimilarCitiesMap />
      </ContentGrid>
      <UtilityBar />
    </DefaultContentWrapper>
  );
};

export default SimilarCities;
