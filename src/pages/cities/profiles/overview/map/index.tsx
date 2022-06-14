import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { useGlobalLocationGeometry } from '../../../../landing';
import useCurrentCityId from '../../../../../hooks/useCurrentCityId';
import CityMap, { BoundsConfig } from './CityMap';
import { Coordinate, getBounds } from '../../../../../components/map/Utils';
import { ExtendedSearchDatum } from '../../../../landing/Utils';
import { backgroundDark, backgroundMedium, baseColor, lightBorderColor, secondaryFont } from '../../../../../styling/styleUtils';
import { breakPoints } from '../../../../../styling/GlobalGrid';
import useFluent from '../../../../../hooks/useFluent';
import BasicModal from '../../../../../components/standardModal/BasicModal';
import { ModalContent } from '../../../../landing/Heading';

const footnoteHeight = '3.5rem';
const footnoteHeightSmall = '1.75rem';

const Root = styled.div`
  width: 100%;
  height: 100%;
  padding-bottom: ${footnoteHeight};
  box-sizing: border-box;
  position: relative;
  background-color: ${backgroundMedium};

  @media (max-width: 920px), (max-height: 800px) {
    padding-bottom: ${footnoteHeightSmall};
  }

  @media ${breakPoints.small} {
    min-height: 70vh;
  }

  .mapboxgl-control-container {
    .mapboxgl-ctrl-group:not(:empty) {
      background: none;
      box-shadow: none;
    }
    .mapboxgl-ctrl-zoom-in,
    .mapboxgl-ctrl-zoom-out,
    .mapboxgl-ctrl-compass {
      width: 75px;
      height: 18px;
      color: #fff;
      text-transform: uppercase;
      font-family: ${secondaryFont};
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      border: solid 1px ${lightBorderColor};
      border-radius: none;
      background-color: transparent;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.1rem 0.4rem;
      margin-bottom: 0.45rem;

      &:hover {
        background-color: #fff;
        color: ${backgroundDark};
      }

      span {
        display: none;
      }
    }
    .mapboxgl-ctrl-zoom-in {
      &::after {
        text-align: center;
        content: '+ Zoom In';
      }
    }
    .mapboxgl-ctrl-zoom-out {
      &:after {
        text-align: center;
        content: '- Zoom Out';
      }
    }
    .mapboxgl-ctrl-compass {
      display: none;
    }
  }
`;

const Footnote = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${footnoteHeight};
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.1rem 0.5rem;
  box-sizing: border-box;

  @media (max-width: 920px), (max-height: 800px) {
    height: ${footnoteHeightSmall};
    padding: 0.1rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SourceAttr = styled.small`
  font-style: italic;
  font-size: 0.7rem;
  opacity: 0.9;
  margin-bottom: 0.4rem;

  a {
    color: ${baseColor};
  }

  @media (max-width: 920px), (max-height: 800px) {
    font-size: 0.6rem;
    margin-bottom: 0;
    margin-right: 0.15rem;
  }
`;

const MoreInfoBtn = styled.button`
  background-color: transparent;
  text-decoration: underline;
  padding: 0;
  border: none;
  opacity: 0.9;

  @media (max-width: 920px), (max-height: 800px) {
    font-size: 0.6rem;
  }
`;

const MapRoot = () => {
  const { loading, error, data } = useGlobalLocationGeometry();
  const currentCityId = useCurrentCityId();
  const getString = useFluent();
  const [cityModalOpen, setCityModalOpen] = useState<boolean>(false);

  let fitBounds: BoundsConfig = { bounds: getBounds([]), padding: { top: 0, bottom: 0, left: 0, right: 0 } };

  if (data !== undefined) {
    const { cities, countries } = data;
    let highlighted: ExtendedSearchDatum | undefined;
    cities.forEach(city => {
      const {
        cityId, name, centroidLon, countryId, geometry,
        populationLatest, gdppc, nameList,
      } = city;
      const coordinates: Coordinate[][][] = geometry ? JSON.parse(geometry).coordinates : [];
      const northernTerminus = Math.max(...coordinates[0][0].map(coord => coord[1]));
      const center: Coordinate = [centroidLon ? centroidLon : 0, northernTerminus];
      const parent = countries.find(c => parseInt(c.countryId, 10) === countryId);
      const countryName = parent && parent.nameShortEn ? parent.nameShortEn : '';
      const population = populationLatest ? populationLatest : 0;
      const gdp = gdppc && !isNaN(gdppc) ? parseFloat(gdppc.toFixed(2)) : 0;
      const id = cityId;
      const searchDatum: ExtendedSearchDatum = {
        id,
        title: name + ', ' + countryName,
        parent_id: countryId,
        level: '1',
        center,
        coordinates: coordinates[0][0],
        population: Math.round(population),
        gdp,
        keywords: nameList ? nameList : undefined,
      };
      if (cityId === currentCityId) {
        highlighted = searchDatum;
        fitBounds = {
          bounds: getBounds(highlighted.coordinates),
          padding: { top: window.innerHeight * 0.05, bottom: window.innerHeight * 0.05, left: window.innerWidth * 0.05, right: window.innerWidth * 0.05 },
        };
      }
    });
  }

  const openModal = () => setCityModalOpen(true);
  const closeModal = () => setCityModalOpen(false);
  const modal = cityModalOpen ? (
    <BasicModal
      width={'400px'}
      height={'auto'}
      onClose={closeModal}
    >
      <ModalContent>
        <p
          dangerouslySetInnerHTML={{ __html: getString('landing-page-text-what-is-city-para-1') }}
        />
        <p
          dangerouslySetInnerHTML={{ __html: getString('landing-page-text-what-is-city-para-2') }}
        />
      </ModalContent>
    </BasicModal>
  ) : null;

  return (
    <Root>
      <CityMap
        loading={loading}
        error={error}
        data={data}
        currentCityId={currentCityId}
        fitBounds={fitBounds}
      />
      <Footnote>
        <SourceAttr dangerouslySetInnerHTML={{ __html: getString('city-overview-map-source')}} />
        <MoreInfoBtn onClick={openModal}>{getString('city-overview-more-info')}</MoreInfoBtn>
      </Footnote>
      {modal}
    </Root>
  );

};

export default MapRoot;
