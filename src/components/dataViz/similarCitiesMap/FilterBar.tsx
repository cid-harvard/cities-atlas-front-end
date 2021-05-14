import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import {
  primaryColor,
  backgroundDark,
  backgroundMedium,
  baseColor,
  primaryFont,
  lightBaseColor,
} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';
import ReactSlider from 'react-slider';
import MultiSelect from '@khanacademy/react-multi-select';
import {formatNumber} from '../../../Utils';
import {useMapContext} from 'react-city-space-mapbox';
import raw from 'raw.macro';
import {scaleSymlog} from 'd3-scale';
import {joyrideClassNames} from '../../navigation/secondaryHeader/guide/CitiesGuide';
import Tooltip from '../../general/Tooltip';

const ChevronSVG = raw('../../../assets/icons/chevron.svg');

export const filterBarId = 'similar-cities-filter-bar-id';

const Root = styled.div`
  background-color: rgba(255, 255, 255, 0.85);
`;

const Title = styled.h3`
  color: ${primaryColor};
  text-transform: uppercase;
  margin: 0;
  padding: 0.2rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const TitleText = styled.span`
  margin-right: 0.5rem;
`;

const Arrow = styled.span`
  width: 0.7rem;
  height: 1rem;
  display: inline-block;

  svg {
    width: 100%;
    height: 100%;

    polyline {
      stroke: ${primaryColor};
    }
  }
`;

const Settings = styled.div`
  padding: 0.35rem 0.75rem 1rem;
  display: flex;
`;

const ExpandBox = styled.div`
  flex-grow: 1;
  padding-right: 1rem;
`;

const slideRootClassName = 'react-slider-root-class';
const slideThumbClassName = 'react-slider-thumb-class';
const slideTrackClassName = 'react-slider-track-class';

const SliderContainer = styled.div`
  margin-top: 1.5rem;
  position: relative;

  .${slideThumbClassName} {
    background-color: ${primaryColor};
    height: 1rem;
    width: 1rem;
    border-radius: 1000px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;

    span {
      color: ${primaryColor};
      transform: translateY(-100%);
    }
  }
  .${slideThumbClassName}-0 {
    transform: translateX(-0.1rem);
  }
  .${slideTrackClassName} {
    margin-top: 0.25rem;
  }
  .${slideTrackClassName}-0 {
    background-color: ${backgroundMedium};
    height: 0.5rem;
  }
  .${slideTrackClassName}-1 {
    background-color: ${backgroundDark};
    height: 0.5rem;
  }
  .${slideTrackClassName}-2 {
    background-color: ${backgroundMedium};
    height: 0.5rem;
  }
`;

const SelectBoxContainer = styled.div`
  margin-top: 0.3rem;
  position: relative;
  z-index: 10;

  .multi-select {
    .dropdown {
      .dropdown-heading {
        border-radius: 0 !important;
        border-color: ${backgroundDark} !important;
        color: ${baseColor} !important;
        ::placeholder, span {
          color: ${baseColor} !important;
          opacity: 1;
        }
        .dropdown-heading-dropdown-arrow span {
          border-color: ${baseColor} transparent transparent !important;
        }
      }
      .dropdown-content {
        font-family: ${primaryFont} !important;
        border-color: ${lightBaseColor} !important;
        input {
          border-radius: 0 !important;
          border-color: ${lightBaseColor} !important;
          font-family: ${primaryFont} !important;
        }
        .select-item {
          color: ${baseColor} !important;

          &:hover {
            background-color: ${backgroundMedium} !important;
          }
        }
      }
    }
    .dropdown[aria-expanded="true"] {
      .dropdown-heading {
        .dropdown-heading-dropdown-arrow span {
          border-color: transparent transparent ${baseColor} !important;
        }
      }
    }
  }
  .item-renderer {
    display: flex;
    align-items: center;
  }
`;

const CityMark = styled.div`
  position: absolute;
  top: 0;
  font-size: 0.775rem;
  text-transform: uppercase;
  font-weight: 600;
  color: ${lightBaseColor};
  text-align: center;
  display: flex;
  justify-content: center;
  white-space: nowrap;

  &:before {
    content: '';
    position: absolute;
    width: 0;
    border-left: solid 3px ${lightBaseColor};
    height: 0.75rem;
    top: 0.25rem;
  }
`;

const CityName = styled.div`
  transform: translate(0, 100%);
  position: absolute;
`;

const selectBoxValueRenderer = (type: 'Countries' | 'Regions') => (selected: any, allOptions: any) => {
  if (selected.length === 0 || selected.length === allOptions.length) {
    return 'All ' + type;
  }

  return selected.length === 1 ? selected.label : `${selected.length} ${type} Selected`;
};

interface FilterValues {
  selectedRegionIds:  string[];
  selectedCountryIds:  string[];
  minMaxPopulation: [number, number];
  minMaxGdppc: [number, number];
}

interface Props {
  node: HTMLDivElement | null;
  populationMin: number;
  populationMax: number;
  gdppcMin: number;
  gdppcMax: number;
  regions: {label: string, value: string}[];
  countries: {label: string, value: string, regionId: string}[];
  setFilterValues: (value: FilterValues) => void;
  currentCity: {city: string, population: number, gdppc: number} | undefined;
}

interface ThumbState {
  index: number;
  value: number | number[];
  valueNow: number;
}

const FilterBar = (props: Props) => {
  const {
    populationMin, populationMax, gdppcMin, gdppcMax,
    regions, setFilterValues, currentCity, countries,
  } = props;
  const mapContext = useMapContext();
  const getString = useFluent();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [minMaxPopulation, setMinMaxPopulation] = useState<[number, number]>([0, 100]);
  const [minMaxGdppc, setMinMaxGdppc] = useState<[number, number]>([0 , 100]);

  const gdpLogScale = useCallback(
    scaleSymlog().domain([gdppcMin, gdppcMax]).range([0, 100]),
    [gdppcMin, gdppcMax],
  );
  const popLogScale = useCallback(
    scaleSymlog().domain([populationMin, populationMax]).range([0, 100]),
    [populationMin, populationMax],
  );

  const currentGdpPercent = currentCity ? gdpLogScale(currentCity.gdppc) : 0;
  const currentPopPercent = useMemo(
    () => currentCity ? popLogScale(currentCity.population) : 0,
    [currentCity, popLogScale],
  );
  const currentCityName = currentCity ? currentCity.city : '';

  useEffect(() => {
    const rawPopulation = popLogScale.invert(currentPopPercent as number);
    let defaultMinPop = popLogScale(rawPopulation / 2) as number;
    if (defaultMinPop < 0) {
      defaultMinPop = 0;
    }
    let defaultMaxPop = popLogScale(rawPopulation * 2) as number;
    if (defaultMaxPop > 100) {
      defaultMaxPop = 100;
    }
    setMinMaxPopulation([defaultMinPop, defaultMaxPop]);
  }, [currentPopPercent, popLogScale]);

  useEffect(() => {
    if (mapContext.intialized) {
      const convertedGdpPpc = minMaxGdppc.map(n => gdpLogScale.invert(n)) as [number, number];
      const convertedPop = minMaxPopulation.map(n => popLogScale.invert(n)) as [number, number];
      mapContext.setFilterParamaters(convertedPop, convertedGdpPpc, selectedRegionIds, selectedCountryIds);
      setFilterValues({
        minMaxPopulation: convertedPop,
        minMaxGdppc: convertedGdpPpc,
        selectedRegionIds, selectedCountryIds});
    }
  }, [
    mapContext, popLogScale, gdpLogScale,
    gdppcMin, gdppcMax, populationMin, populationMax,
    minMaxPopulation, minMaxGdppc,
    selectedRegionIds, setFilterValues, selectedCountryIds,
  ]);

  const thumbRender = (type: 'gdp' | 'pop') => (p: React.HTMLProps<HTMLDivElement>, state: ThumbState) => {
    const scale = type === 'pop' ? popLogScale.invert : gdpLogScale.invert;
    const $ = type === 'pop' ? '' : '$';
    const value = scale(state.valueNow);
    const decimalPlaces = value > 999999 && value < 9999999 ? 1 : 0;
    const formatted = formatNumber(value, decimalPlaces);
    return <small {...p}><span>{$}{formatted}</span></small>;
  };

  const node = props.node ? props.node : document.getElementById(filterBarId) as HTMLDivElement | null;
  if (node) {
    const countryOptions = countries.filter(d => !selectedRegionIds.length || selectedRegionIds.includes(d.regionId));
    return createPortal((
      <Root className={joyrideClassNames.filterOptions}>
        <Title
          onClick={() => setSettingsOpen(curr => !curr)}
        >
          <TitleText>{getString(settingsOpen ? 'city-filter-title-close' : 'city-filter-title-open')}</TitleText>
          <Arrow
            style={{transform: settingsOpen ? 'rotate(180deg)' : undefined}}
            dangerouslySetInnerHTML={{__html: ChevronSVG}}
          />
        </Title>
        <Settings style={{display: settingsOpen ? undefined : 'none'}}>
          <ExpandBox>
            <div>
              <Tooltip
                explanation={getString('global-text-population-about')}
              />
              {getString('global-text-population')}
            </div>
            <SliderContainer>
              <CityMark style={{left: currentPopPercent + '%'}}>
                <CityName>
                  {currentCityName}
                </CityName>
              </CityMark>
              <ReactSlider
                className={slideRootClassName}
                thumbClassName={slideThumbClassName}
                trackClassName={slideTrackClassName}
                value={minMaxPopulation}
                renderThumb={thumbRender('pop')}
                max={100}
                min={0}
                onAfterChange={v => setMinMaxPopulation(v as [number, number])}
              />
            </SliderContainer>
          </ExpandBox>
          <ExpandBox>
            <div>
              <Tooltip
                explanation={getString('global-text-gdp-per-capita-about')}
              />
              {getString('global-text-gdp-per-capita')}
            </div>
            <SliderContainer>
              <CityMark style={{left: currentGdpPercent + '%'}}>
                <CityName>
                  {currentCityName}
                </CityName>
              </CityMark>
              <ReactSlider
                className={slideRootClassName}
                thumbClassName={slideThumbClassName}
                trackClassName={slideTrackClassName}
                defaultValue={[0, 100]}
                renderThumb={thumbRender('gdp')}
                max={100}
                min={0}
                onAfterChange={v => setMinMaxGdppc(v as [number, number])}
              />
            </SliderContainer>
          </ExpandBox>
          <ExpandBox>
            {getString('city-filter-regions')}
            <SelectBoxContainer>
              <MultiSelect
                options={regions}
                selected={selectedRegionIds}
                onSelectedChanged={(s: string[]) => setSelectedRegionIds(s)}
                valueRenderer={selectBoxValueRenderer('Regions')}
                disableSearch={true}
              />
            </SelectBoxContainer>
          </ExpandBox>
          <ExpandBox>
            {getString('city-filter-countries')}
            <SelectBoxContainer>
              <MultiSelect
                options={countryOptions}
                selected={selectedCountryIds}
                onSelectedChanged={(s: string[]) => setSelectedCountryIds(s)}
                valueRenderer={selectBoxValueRenderer('Countries')}
              />
            </SelectBoxContainer>
          </ExpandBox>
        </Settings>
      </Root>
    ), node);
  }

  return null;
};

export default FilterBar;
