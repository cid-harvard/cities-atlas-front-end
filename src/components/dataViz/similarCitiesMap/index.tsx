import React, {useRef, useEffect, useState} from 'react';
import CitySpaceMap from 'react-city-space-mapbox';
import useLayoutData from './useLayoutData';
import styled from 'styled-components/macro';
import {breakPoints} from '../../../styling/GlobalGrid';
import MapOptionsAndSettings from './MapOptionsAndSettings';
import {getStandardTooltip} from '../../../utilities/rapidTooltip';
import {rgba} from 'polished';
import useProximityData, {SuccessResponse} from './useProximityData';
import SimilarCitiesRings from '../simpleRings/SimilarCitiesRings';
import CityProximityLegend from '../legend/CityProximityLegend';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const Map = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

const RingsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 5;
`;

let staticProximityData: SuccessResponse | undefined;

const SimilarCitiesMap = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const {data} = useLayoutData();
  const {data: proximityData} = useProximityData();
  const [showRings, setShowRings] = useState<boolean>(false);

  useEffect(() => {
    staticProximityData = proximityData;
  }, [proximityData]);

  const renderTooltipContent = (node: {id: string, country: string, city: string, fill: string}) => {
    if (data && staticProximityData) {
      const proximityNode = staticProximityData.cities.find(c => c.partnerId.toString() === node.id.toString());
      return getStandardTooltip({
        title: node.city + ', ' + node.country,
        color: rgba(node.fill, 0.35),
        rows: node.fill !== 'gray'
          ? [['Similarity:', proximityNode && proximityNode.proximity ? proximityNode.proximity.toFixed(2) : '0.00']]
          : [],
        boldColumns: [1],
        hideArrow: true,
      });
    }
    return '';
  };

  const rings = showRings ? (
    <RingsContainer>
      <SimilarCitiesRings />
    </RingsContainer>
  ) : null;

  return (
    <>
      <CitySpaceMap
        accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN as  string}
        mapStyle={'mapbox://styles/harvardgrowthlab/ckelvcgh70cg019qgiu39035a'}
        rootRef={rootRef}
        cityGeoJson={data ? data.cityGeoJson : undefined}
        cityUMapJson={data ? data.cityUMapJson : undefined}
        getPopupHTMLContent={renderTooltipContent}
      >
        <MapOptionsAndSettings
          showRings={showRings}
          setShowRings={setShowRings}
        />
      </CitySpaceMap>
      <Root>
        <Map ref={rootRef} />
        {rings}
      </Root>
      <CityProximityLegend isRings={showRings} />
    </>
  );
};

export default SimilarCitiesMap;