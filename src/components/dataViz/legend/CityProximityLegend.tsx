import React from 'react';
import styled from 'styled-components/macro';
import {breakPoints} from '../../../styling/GlobalGrid';
import {proximityColors} from '../similarCitiesMap/Utils';
import useFluent from '../../../hooks/useFluent';
import useCurrentCity from '../../../hooks/useCurrentCity';
import ArrowSVG from '../../../assets/icons/arrow.svg';
import TextLoading from '../../transitionStateComponents/SimpleTextLoading';
import {joyrideClassNames} from '../../navigation/secondaryHeader/guide/CitiesGuide';
import UtilityBar from '../../navigation/secondaryHeader/UtilityBar';
import { backgroundMedium } from '../../../styling/styleUtils';

const RootBase = styled.div`
  grid-row: 3;
  display: grid;
  grid-template-columns: auto 1fr auto;
  margin-bottom: 3rem;

  @media ${breakPoints.small} {
    grid-row: 4;
  }
`;

const StandardRoot = styled(RootBase)`
  grid-column: 1;

  @media (max-width: 1200px) {
    grid-column: 1 / -1;
  }
`;

const FullWidthRoot = styled(RootBase)`
  grid-column: 1 / -1;
`;

const Content = styled.div`
  padding: 0.875rem 0;
`;

const Bar = styled.div`
  width: 100%;
  height: 0.6rem;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
`;

const Segment = styled.div`
  border: solid 1px #fff;
`;

const Labels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
`;

const YourLocation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  font-size: 0.75rem;
  font-weight: 600;
  padding-right: 2rem;
`;

const Arrow = styled.img`
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.5rem;
`;

const Circle = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  background-color: gray;
  border-radius: 1000px;
`;

const Utilities = styled.div`
  display: flex;
  align-items: center;
  padding: 0.3rem 0.2rem;
  margin: 0 1rem;
  background-color: ${backgroundMedium};
`;

interface Props {
  fullWidth?: boolean;
  isRings: boolean;
}

const IntensityLegend = (props: Props) => {
  const {fullWidth, isRings} = props;
  const Root = fullWidth ? FullWidthRoot : StandardRoot;
  const getString = useFluent();
  const {loading, city} = useCurrentCity();

  const icon = isRings ? (
    <Circle />
  ) : (
    <Arrow src={ArrowSVG} alt='' title='' />
  );

  let cityName: React.ReactElement<any>;
  if (loading) {
    cityName = <TextLoading />;
  } else if (city && city.name) {
    cityName = <div>{city.name}</div>;
  } else {
    cityName = <div>{getString('global-your-city')}</div>;
  }

  return (
    <Root className={joyrideClassNames.colorLegendNoFilter}>
      <Content>
        <YourLocation>
          {icon}
          {cityName}
        </YourLocation>
      </Content>
      <Content>
        <Labels>
          <div>{getString('global-similarity-low')}</div>
          <div>{getString('global-similarity-high')}</div>
        </Labels>
        <Bar>
          <Segment style={{backgroundColor: proximityColors[4]}} />
          <Segment style={{backgroundColor: proximityColors[3]}} />
          <Segment style={{backgroundColor: proximityColors[2]}} />
          <Segment style={{backgroundColor: proximityColors[1]}} />
          <Segment style={{backgroundColor: proximityColors[0]}} />
        </Bar>
      </Content>
      <Content>
        <Utilities>
          <UtilityBar returnInline={true} hideGuide={true} />
        </Utilities>
      </Content>
    </Root>
  );
};

export default IntensityLegend;
