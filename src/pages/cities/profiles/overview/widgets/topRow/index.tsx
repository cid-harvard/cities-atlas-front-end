import React from 'react';
import { usePeerGroupCityCount } from '../../../../../../components/navigation/secondaryHeader/comparisons/AddComparisonModal';
import useCurrentCity from '../../../../../../hooks/useCurrentCity';
import { TitleBase, YearText, Icon, ValueBase, ListItem } from '../styleUtils';
import PopulationSVG from '../../../../../../assets/icons/population.svg';
import RankingSVG from '../../../../../../assets/icons/ranking.svg';
import GdpPerCapitaSVG from '../../../../../../assets/icons/gdppercapita.svg';
import DataReliabilitySVG from '../../../../../../assets/icons/datareliability.svg';
import { defaultYear, formatNumberLong, numberWithCommas } from '../../../../../../Utils';
import useFluent, { ordinalNumber } from '../../../../../../hooks/useFluent';
import { DataFlagType } from '../../../../../../types/graphQL/graphQLTypes';
import styled from 'styled-components';
import Tooltip from '../../../../../../components/general/Tooltip';
import SimpleTextLoading from '../../../../../../components/transitionStateComponents/SimpleTextLoading';

const DataLegend = styled.div`
  margin-right: 0.2rem;
  display: inline-flex;
  flex-direction: row-reverse;
  align-items: center;
`;

const SmallDot = styled.div`
  width: .45rem;
  height: .45rem;
  border-radius: 1000px;
  margin-right: 0.2rem;
`;

const LargeDot = styled.div`
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 1000px;
  margin-right: 0.075rem;
`;

const TopRow = () => {
  const {loading: cityLoading, city} = useCurrentCity();
  const { loading, error, data } = usePeerGroupCityCount(city && city.cityId ? city.cityId : null);
  const getString = useFluent();

  let population: React.ReactElement<any> | null;
  let gdppc: React.ReactElement<any> | null;
  let flagColor: React.ReactElement<any> | null = null;
  let alertTitle: string = '---';
  let description: string = '---';
  let regionPopRank: string = '---';
  let regionGdppcRank: string = '---';
  if (loading || cityLoading) {
    population = <SimpleTextLoading />;
    gdppc = <SimpleTextLoading />;
  } else if (error) {
    console.error(error);
    population = <>---</>;
    gdppc = <>---</>;
  } else if (data && city) {
    const dataFlag = city.dataFlag;
    if (dataFlag === DataFlagType.GREEN) {
      flagColor = (
        <DataLegend>
          <SmallDot style={{ backgroundColor: '#B70808' }} />
          <SmallDot style={{ backgroundColor: '#9A561A' }} />
          <SmallDot style={{ backgroundColor: '#71670F' }} />
          <LargeDot style={{ backgroundColor: '#137737' }} />
        </DataLegend>
      );
      alertTitle = getString('data-disclaimer-green-title');
      description = getString('data-disclaimer-green-desc');
    } else if (dataFlag === DataFlagType.YELLOW) {
      flagColor = (
        <DataLegend>
          <SmallDot style={{ backgroundColor: '#B70808' }} />
          <SmallDot style={{ backgroundColor: '#9A561A' }} />
          <LargeDot style={{ backgroundColor: '#71670F' }} />
          <SmallDot style={{ backgroundColor: '#137737' }} />
        </DataLegend>
      );
      alertTitle = getString('data-disclaimer-yellow-title');
      description = getString('data-disclaimer-yellow-desc');
    } else if (dataFlag === DataFlagType.ORANGE) {
      flagColor = (
        <DataLegend>
          <SmallDot style={{ backgroundColor: '#B70808' }} />
          <LargeDot style={{ backgroundColor: '#9A561A' }} />
          <SmallDot style={{ backgroundColor: '#71670F' }} />
          <SmallDot style={{ backgroundColor: '#137737' }} />
        </DataLegend>
      );
      alertTitle = getString('data-disclaimer-orange-title');
      description = getString('data-disclaimer-orange-desc');
    } else if (dataFlag === DataFlagType.RED) {
      flagColor = (
        <DataLegend>
          <LargeDot style={{ backgroundColor: '#B70808' }} />
          <SmallDot style={{ backgroundColor: '#9A561A' }} />
          <SmallDot style={{ backgroundColor: '#71670F' }} />
          <SmallDot style={{ backgroundColor: '#137737' }} />
        </DataLegend>
      );
      alertTitle = getString('data-disclaimer-red-title');
      description = getString('data-disclaimer-red-desc');
    }
    population = <>{formatNumberLong(city.population ? city.population : 0)}</>;
    gdppc = <>${numberWithCommas(city.gdppc ? Math.round(city.gdppc) : 0)}</>;
    regionPopRank = ordinalNumber([city.regionPopRank ? city.regionPopRank : 0]).toUpperCase();
    regionGdppcRank = ordinalNumber([city.regionGdppcRank ? city.regionGdppcRank : 0]).toUpperCase();
  } else {
    population = <>---</>;
    gdppc = <>---</>;
  }

  return (
    <>
      <div>
        <TitleBase>
          <Icon src={PopulationSVG} />
          {getString('global-text-population')}
          <YearText>
            2015
          </YearText>
        </TitleBase>
        <ValueBase>
          {population}
        </ValueBase>
      </div>
      <div>
        <TitleBase>
          <Icon src={GdpPerCapitaSVG} />
          {getString('global-text-gdp-per-capita')}
          <YearText>
            2015
            <Tooltip
              explanation={getString('global-text-gdp-per-capita-about')}
            />
          </YearText>
        </TitleBase>
        <ValueBase>
          {gdppc}
        </ValueBase>
      </div>
      <div>
        <TitleBase>
          <Icon src={RankingSVG} />
          {getString('city-overview-ranking-title')}*
          <YearText>
            {defaultYear}
          </YearText>
        </TitleBase>
        <ValueBase>
          <ListItem>
            {getString('city-overview-ranking-pop', { value: regionPopRank })}
          </ListItem>
          <ListItem>
            {getString('city-overview-ranking-gdp', { value: regionGdppcRank })}
          </ListItem>
        </ValueBase>
      </div>
      <div>
        <TitleBase>
          <Icon src={DataReliabilitySVG} />
          {getString('city-overview-data-quality')}
          <YearText>
            {defaultYear}
            <Tooltip
              explanation={<div dangerouslySetInnerHTML={{ __html: description }} />}
            />
          </YearText>
        </TitleBase>
        <ValueBase>
          {flagColor}
          {alertTitle}
        </ValueBase>
      </div>
    </>
  );
};

export default TopRow;
