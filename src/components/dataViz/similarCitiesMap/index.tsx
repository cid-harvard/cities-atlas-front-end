import React, {useRef} from 'react';
import CitySpaceMap from 'react-city-space-mapbox'
import useLayoutData from './useLayoutData';
import styled from 'styled-components/macro';
import {breakPoints} from '../../../styling/GlobalGrid';
import MapOptionsAndSettings from './MapOptionsAndSettings';

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
const SimilarCitiesMap = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const {data} = useLayoutData();

  const renderTooltipContent = (node: {id: string, country: string, city: string}) => {
    return `
      <div>
        <strong>${node.city}</strong>
      </div>
      <small>${node.country}</small>
    `;
  }
  console.log(data);
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
        />
      </CitySpaceMap>
      <Root>
        <Map ref={rootRef} />
      </Root>
    </>
  );
}

export default SimilarCitiesMap;