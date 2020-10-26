import React, {useState} from 'react';
import TopIndustryComparisonBarChart from
  '../../../../../components/dataViz/comparisonBarChart/TopIndustryComparisonBarChart';
import {defaultYear} from '../../../../../Utils';
import {
  defaultCompositionType,
  CompositionType,
  defaultDigitLevel,
  ClassificationNaicsIndustry,
} from '../../../../../types/graphQL/graphQLTypes';
import {
  ContentGrid,
} from '../../../../../styling/styleUtils';
import useQueryParams from '../../../../../hooks/useQueryParams';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import useSectorMap from '../../../../../hooks/useSectorMap';
import noop from 'lodash/noop';
import UtiltyBar from '../../../../../components/navigation/secondaryHeader/UtilityBar';

interface Props {
  primaryCity: string;
  secondaryCity: string;
}

const CompositionComparison = (props: Props) => {
  const {
    primaryCity, secondaryCity,
  } = props;

  const {digit_level, composition_type} = useQueryParams();
  const sectorMap = useSectorMap();
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const toggleSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.includes(sectorId)
      ? setHiddenSectors(hiddenSectors.filter(sId => sId !== sectorId))
      : setHiddenSectors([...hiddenSectors, sectorId]);
  const isolateSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.length === sectorMap.length - 1 && !hiddenSectors.find(sId => sId === sectorId)
      ? setHiddenSectors([])
      : setHiddenSectors([...sectorMap.map(s => s.id).filter(sId => sId !== sectorId)]);

  return (
    <>
      <ContentGrid>
        <TopIndustryComparisonBarChart
          primaryCity={parseInt(primaryCity, 10)}
          secondaryCity={parseInt(secondaryCity, 10)}
          year={defaultYear}
          highlighted={undefined}
          digitLevel={digit_level ? parseInt(digit_level, 10) : defaultDigitLevel}
          compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
          hiddenSectors={hiddenSectors}
          setHighlighted={noop}
        />
        <CategoryLabels
          categories={sectorMap}
          toggleCategory={toggleSector}
          isolateCategory={isolateSector}
          hiddenCategories={hiddenSectors}
          fullWidth={true}
        />
        <UtiltyBar
          onDownloadImageButtonClick={noop}
          onDownloadDataButtonClick={noop}
        />
      </ContentGrid>
    </>
  );
};

export default CompositionComparison;
