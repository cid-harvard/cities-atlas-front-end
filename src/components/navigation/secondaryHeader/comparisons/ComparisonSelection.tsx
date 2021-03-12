import React, {useState} from 'react';
import AddComparisonModal from './AddComparisonModal';
import {RegionGroup} from '../../../dataViz/comparisonBarChart/cityIndustryComparisonQuery';
import queryString from 'query-string';
import {
  lightBaseColor,
  errorColor,
  baseColor,
} from '../../../../styling/styleUtils';
import styled from 'styled-components/macro';
import matchingKeywordFormatter from '../../../../styling/utils/panelSearchKeywordFormatter';
import PanelSearch, {Datum} from 'react-panel-search';
import useFluent from '../../../../hooks/useFluent';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import {
  useHistory,
  matchPath,
} from 'react-router-dom';
import {
  CityRoutes,
  cityIdParam,
} from '../../../../routing/routes';
import {createRoute} from '../../../../routing/Utils';
import useQueryParams from '../../../../hooks/useQueryParams';
import {TooltipTheme} from '../../../general/Tooltip';

const CompareDropdownRoot = styled.div`
  padding-left: 1rem;
  border-left: solid 1px #333;
`;

const ButtonBase = styled.button`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  text-transform: uppercase;
  position: relative;
`;

const AddComparisonButton = styled(ButtonBase)`
  font-size: 0.85rem;
  border: dashed 1px ${lightBaseColor};
  padding: 0.4rem 0.5rem 0.4rem 1.65rem;
  color: ${baseColor};
  outline: none;

  &:before {
    font-size: 1.85rem;
    content: '+';
    left: 0.15rem;
    position: absolute;
  }

  &:hover, &:focus {
    background-color: #fff;
  }

  &:active {
    color: ${baseColor};
  }
`;

const RemoveComparisonButton = styled(ButtonBase)`
  color: ${errorColor};
  outline: 0 solid rgba(255, 255, 255, 0);
  font-size: clamp(0.65rem, 1vw, 1rem);
  padding: 0 0.25rem;
  transition: outline 0.1s ease;

  &:before {
    font-size: 1.25rem;
    margin-right: 0.35rem;
    content: '✕';
    transform: translate(1%, 0);
  }

  &:hover, &:focus {
    background-color: #fff;
    outline: 0.25rem solid #fff;
  }

  &:active {
    color: ${errorColor};
  }

  @media (max-width: 1280px) {
    max-width: 90px;
  }
`;

interface Props {
  data: Datum[];
}

const ComparisonSelection = (props: Props) => {
  const {data} = props;
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const history = useHistory();
  const { compare_city, ...otherParams } = useQueryParams();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  let compareDropdown: React.ReactElement<any>;
  if (compare_city === undefined) {
    compareDropdown = (
      <div>
        <AddComparisonButton onClick={() => setModalOpen(true)}>
          {getString('global-ui-add-comparison')}
        </AddComparisonButton>
      </div>
    );
  } else {
    const onSelectComparison = (d: Datum | null) => {
      if (d) {
        const query = queryString.stringify({...otherParams, compare_city: d.id});
        const newUrl = query ? history.location.pathname + '?' + query : history.location.pathname;
        history.push(newUrl);
      }
    };
    const removeComparison = () => {
      let path: string = history.location.pathname;
      const isIndustryComparison = matchPath<{[cityIdParam]: string}>(
        path, CityRoutes.CityEconomicCompositionIndustryCompare,
      );
      if (isIndustryComparison && isIndustryComparison.isExact && cityId !== null) {
        path = createRoute.city(CityRoutes.CityEconomicComposition, cityId);
      }
      const query = queryString.stringify({...otherParams});
      const newUrl = query ? path + '?' + query : path;
      history.push(newUrl);
    };
    const comparisonData: Datum[] = [
      {id: RegionGroup.World, title: getString('global-text-world'), level: null, parent_id: null},
      ...data.filter(({id}) => id !== cityId),
    ];
    compareDropdown = (
      <>
        <CompareDropdownRoot>
          <PanelSearch
            data={comparisonData}
            topLevelTitle={getString('global-text-countries')}
            disallowSelectionLevels={['0']}
            defaultPlaceholderText={getString('global-ui-type-a-city-name')}
            showCount={true}
            resultsIdentation={1.75}
            neverEmpty={true}
            selectedValue={comparisonData.find(({id}) => id === compare_city)}
            onSelect={onSelectComparison}
            maxResults={500}
            matchingKeywordFormatter={matchingKeywordFormatter(TooltipTheme.Light)}
          />
        </CompareDropdownRoot>
        <div>
          <RemoveComparisonButton onClick={removeComparison}>
            {getString('global-ui-remove-comparison')}
          </RemoveComparisonButton>
        </div>
      </>
    );
  }

  const closeModal = () => {
    setModalOpen(false);
  };
  const compareModal = modalOpen ? (
    <AddComparisonModal
      closeModal={closeModal}
      data={data}
      field={'compare_city'}
    />
  ) : null;

  return (
    <>
      {compareDropdown}
      {compareModal}
    </>
  );

};

export default ComparisonSelection;