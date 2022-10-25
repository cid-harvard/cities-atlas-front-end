import React from 'react';
import { usePeerGroupCityCount } from '../../../../../../components/navigation/secondaryHeader/comparisons/AddComparisonModal';
import useCurrentCity from '../../../../../../hooks/useCurrentCity';
import { TitleBase, YearText, Icon, ValueBase, ListItem } from '../styleUtils';
import PopulationSVG from '../../../../../../assets/icons/population.svg';
import RankingSVG from '../../../../../../assets/icons/ranking.svg';
import GdpPerCapitaSVG from '../../../../../../assets/icons/gdppercapita.svg';
import DataReliabilitySVG from '../../../../../../assets/icons/datareliability.svg';
import { populationDisplayYear, gdpPerCapitaDisplayYear, rankingDisplayYear, defaultYear, formatNumberLong, numberWithCommas } from '../../../../../../Utils';
import useFluent, { ordinalNumber } from '../../../../../../hooks/useFluent';
import { DataFlagType } from '../../../../../../types/graphQL/graphQLTypes';
import styled from 'styled-components';
import Tooltip from '../../../../../../components/general/Tooltip';
import SimpleTextLoading from '../../../../../../components/transitionStateComponents/SimpleTextLoading';
import { getNewDataQualityLevel, NewDataQualityLevel, dataQualityColors } from '../../../../../../components/general/Utils';

const DataLegend = styled.div`
  margin-right: 0.2rem;
  display: inline-flex;
  flex-direction: row;
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

const LegendContainer = styled.div`
  margin-top: 0.5rem;

  & h1 {
    font-size: inherit;
  }
  `;

const LegendRow = styled.div`
  margin-top: 0.25rem;
  font-size: 0.85em;
  display: flex;
  flex-direction: row;
  align-items: center;
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
  let dataQualityTooltip: React.ReactElement<any> | null = null;
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
    const dataQualityLevel = getNewDataQualityLevel(dataFlag);

    if (dataQualityLevel === NewDataQualityLevel.HIGH) {

      alertTitle = getString('data-disclaimer-high-quality-title');
      description = getString('data-disclaimer-high-quality-desc');
      
    } else if(dataQualityLevel === NewDataQualityLevel.MEDIUM) {
      alertTitle = getString('data-disclaimer-medium-quality-title');
      description = getString('data-disclaimer-medium-quality-desc');

      
    } else if(dataQualityLevel === NewDataQualityLevel.LOW) {

      alertTitle = getString('data-disclaimer-low-quality-title');
      description = getString('data-disclaimer-low-quality-desc');
      
    }

    flagColor = (
      <DataLegend>
        <LargeDot style={{ backgroundColor: dataQualityColors.get(dataQualityLevel) }} />
      </DataLegend>
    );

    dataQualityTooltip = (
      <>
        <div dangerouslySetInnerHTML={{__html: description }}></div>
        <LegendContainer>
          <h1>Metroverse Data Quality Scale</h1>
          <LegendRow>
            <SmallDot style={{ backgroundColor: dataQualityColors.get(NewDataQualityLevel.HIGH) }} />
            High Quality
          </LegendRow>
          <LegendRow>
            <SmallDot style={{ backgroundColor: dataQualityColors.get(NewDataQualityLevel.MEDIUM) }} />
            Medium Quality
          </LegendRow>
          <LegendRow>
            <SmallDot style={{ backgroundColor: dataQualityColors.get(NewDataQualityLevel.LOW) }} />
            Low Quality
          </LegendRow>
        </LegendContainer>
      </>
    );

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
            {populationDisplayYear}
            <Tooltip
              explanation={getString('global-text-population-about')}
            />
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
            {gdpPerCapitaDisplayYear}
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
            {rankingDisplayYear}
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
              explanation={dataQualityTooltip}
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
