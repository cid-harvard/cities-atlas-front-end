import React, {useState} from 'react';
import UtiltyBar from '../../../../../components/navigation/secondaryHeader/UtilityBar';
import ClusteredIndustrySpace from '../../../../../components/dataViz/industrySpace/ClusteredIndustrySpace';
import {defaultYear} from '../../../../../Utils';
import {
  ContentGrid,
  ContentParagraph,
  ContentTitle,
} from '../../../../../styling/styleUtils';
import {
  ClassificationNaicsIndustry,
  CompositionType,
  defaultCompositionType,
} from '../../../../../types/graphQL/graphQLTypes';
import CategoryLabels from '../../../../../components/dataViz/legend/CategoryLabels';
import StandardSideTextBlock from '../../../../../components/general/StandardSideTextBlock';
import useSectorMap from '../../../../../hooks/useSectorMap';
import useQueryParams from '../../../../../hooks/useQueryParams';
import useFluent from '../../../../../hooks/useFluent';

interface Props {
  cityId: string;
}

const EconomicComposition = (props: Props) => {
  const { cityId } = props;
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hiddenSectors, setHiddenSectors] = useState<ClassificationNaicsIndustry['id'][]>([]);
  const {composition_type} = useQueryParams();
  const sectorMap = useSectorMap();
  const toggleSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.includes(sectorId)
      ? setHiddenSectors(hiddenSectors.filter(sId => sId !== sectorId))
      : setHiddenSectors([...hiddenSectors, sectorId]);
  const isolateSector = (sectorId: ClassificationNaicsIndustry['id']) =>
    hiddenSectors.length === sectorMap.length - 1 && !hiddenSectors.find(sId => sId === sectorId)
      ? setHiddenSectors([])
      : setHiddenSectors([...sectorMap.map(s => s.id).filter(sId => sId !== sectorId)]);
  const resetSectors = () => setHiddenSectors([]);
  const getString = useFluent();

  return (
    <>
      <ContentGrid>
        <StandardSideTextBlock>
          <ContentTitle>What is my city's position in the Industry Space?</ContentTitle>

          {/* eslint-disable-next-line */}
          <ContentParagraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</ContentParagraph>

        </StandardSideTextBlock>
        <ClusteredIndustrySpace
          cityId={parseInt(cityId, 10)}
          year={defaultYear}
          compositionType={composition_type ? composition_type as CompositionType : defaultCompositionType}
          highlighted={highlighted}
          hiddenSectors={hiddenSectors}
          setHighlighted={setHighlighted}
        />
        <CategoryLabels
          categories={sectorMap}
          toggleCategory={toggleSector}
          isolateCategory={isolateSector}
          hiddenCategories={hiddenSectors}
          resetCategories={resetSectors}
          resetText={getString('global-ui-reset-sectors')}
          fullWidth={true}
        />
      </ContentGrid>
      <UtiltyBar
      />
    </>
  );
};

export default EconomicComposition;
