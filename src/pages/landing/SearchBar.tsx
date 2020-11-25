import React from 'react';
import {
  ExtendedSearchDatum,
} from './Utils';
import PanelSearch from 'react-panel-search';
import useFluent from '../../hooks/useFluent';
import matchingKeywordFormatter from '../../styling/utils/panelSearchKeywordFormatter';
import {TooltipTheme} from '../../components/general/Tooltip';

interface Props {
  data: ExtendedSearchDatum[];
  setHighlighted: (val: ExtendedSearchDatum) => void;
  onPanelHover: (val: ExtendedSearchDatum | null) => void;
  onTraverseLevel: (val: ExtendedSearchDatum, direction: 'asc' | 'desc') => void;
  highlighted: ExtendedSearchDatum | null;
}

const SearchBar = (props: Props) => {
  const {
    data, setHighlighted, onPanelHover, onTraverseLevel,
    highlighted,
  } = props;
  const getString = useFluent();
  return (
    <PanelSearch
      data={data}
      topLevelTitle={getString('global-text-countries')}
      onSelect={(val) => setHighlighted(val as ExtendedSearchDatum)}
      onHover={onPanelHover}
      onTraverseLevel={onTraverseLevel}
      selectedValue={highlighted}
      disallowSelectionLevels={['0']}
      defaultPlaceholderText={getString('global-ui-type-a-city-name')}
      showCount={true}
      resultsIdentation={1.75}
      focusOnRender={true}
      matchingKeywordFormatter={matchingKeywordFormatter(TooltipTheme.Dark)}
    />
  );
};

export default React.memo(SearchBar);
