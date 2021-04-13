import React, {useState} from 'react';
import {
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import ScrollContainer from 'react-indiana-drag-scroll';
import styled from 'styled-components/macro';
import TableRow, {Props as RowDatum} from './TableRow';
import {
  lightBorderColor,
  backgroundMedium,
} from '../../../styling/styleUtils';
import raw from 'raw.macro';
import orderBy from 'lodash/orderBy';
import ColumnFilterBox from './ColumnFilterBox';
import TextFilter from './TextFilter';

const sortArrows = raw('../../../assets/icons/sort-arrows.svg');

const Root = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

const ScrollRoot = styled(ScrollContainer)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  cursor: move;
  border: solid 1px ${lightBorderColor};
`;

const Table = styled.table`
  border-collapse: collapse;
  min-width: 100%;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: ${backgroundMedium};
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  height: 70px;
`;

const NameTh = styled(Th)`
  left: 0;
  z-index: 30;

  &:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    border-right: solid 1px ${lightBorderColor};
    width: 0;
    display: block;
  }
`;

const CellContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SortContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  flex-grow: 1;
`;

const FilterContent = styled.div`
  margin-top: 0.25rem;
`;

const activeClassBase = 'active-sort-column-';

enum SortDirection {
  ascending = 'asc',
  descending = 'desc',
}

const SortArrowsBase = styled.div`
  width: 0.5rem;
  height: 0.8rem;
  flex-shrink: 0;
  margin-left: 0.5rem;

  svg {
    width: 100%;

    polygon {
      fill: #b9b9b9;
    }
  }

  &.${activeClassBase + SortDirection.ascending} {
    svg {
      polygon.sort-arrow-up {
        fill: #333;
      }
    }
  }

  &.${activeClassBase + SortDirection.descending} {
    svg {
      polygon.sort-arrow-down {
        fill: #333;
      }
    }
  }
`;

enum Quadrant {
  Potential = 'Possible Entrants',
  Strength = 'Strength',
  Weakness = 'Weakness',
  Opportunity = 'Opportunity',
  Threat = 'Threat',
}

const quadrantOptionsArray = [
  {value: Quadrant.Potential, label: Quadrant.Potential},
  {value: Quadrant.Strength, label: Quadrant.Strength},
  {value: Quadrant.Weakness, label: Quadrant.Weakness},
  {value: Quadrant.Opportunity, label: Quadrant.Opportunity},
  {value: Quadrant.Threat, label: Quadrant.Threat},
];

enum SortField {
  name = 'name',
  rca = 'rca',
  density = 'density',
  quadrant = 'quadrant',
}

export const getQuadrant = (rca: number, density: number): Quadrant => {
  if (rca === 0) {
    return Quadrant.Potential;
  } if (rca > 1) {
    if (density > 0) {
      return Quadrant.Strength;
    } else {
      return Quadrant.Threat;
    }
  } else {
    if (density > 0) {
      return Quadrant.Opportunity;
    } else {
      return Quadrant.Weakness;
    }
  }
};

interface Props {
  loading: boolean;
  error: any | undefined;
  data: RowDatum[] | undefined;
  compositionType: CompositionType;
}

const PSWOTTable = (props: Props) => {
  const {
    loading, error, data,
  } = props;

  const [sortField, setSortField] = useState<SortField>(SortField.name);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ascending);
  const [filterText, setFilterText] = useState<string>('');
  const [filterdQuadrants, setFilteredQuadrants] = useState<Quadrant[]>([]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(c => c === SortDirection.ascending ? SortDirection.descending : SortDirection.ascending);
    } else {
      setSortField(field);
    }
  };

  let output: React.ReactElement<any> | null;
  if (loading) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (data !== undefined) {
    const rows =
      orderBy(data, [sortField], [sortDirection])
        .filter(d => {
          if (filterdQuadrants.length && !filterdQuadrants.includes(d.quadrant as Quadrant)) {
            return false;
          }
          if (filterText.length && !d.name.toLowerCase().includes(filterText.toLowerCase())) {
            return false;
          }
          return true;
        })
        .map(d => {
          return (
            <TableRow
              key={'table-row-' + d.id}
              id={d.id}
              name={d.name}
              density={d.density}
              rca={d.rca}
              quadrant={d.quadrant}
              color={d.color}
            />
          );
        });

    const activeClass = activeClassBase + sortDirection;

    output = (
      <Table>
        <thead>
          <tr>
            <NameTh>
              <CellContent>
                <SortContent
                  onClick={() => toggleSort(SortField.name)}
                >
                  <div>Name</div>
                  <SortArrowsBase
                    className={sortField === SortField.name ? activeClass : undefined}
                    dangerouslySetInnerHTML={{__html: sortArrows}}
                  />
                </SortContent>
                <FilterContent>
                  <TextFilter
                    initialQuery={filterText}
                    setSearchQuery={setFilterText}
                    placeholder={'Filter name'}
                  />
                </FilterContent>
              </CellContent>
            </NameTh>
            <Th>
              <CellContent>
                <SortContent
                  onClick={() => toggleSort(SortField.rca)}
                >
                  <div>Relative Advantage</div>
                  <SortArrowsBase
                    className={sortField === SortField.rca ? activeClass : undefined}
                    dangerouslySetInnerHTML={{__html: sortArrows}}
                  />
                </SortContent>
                <FilterContent>
                  <ColumnFilterBox
                    allOptions={[
                      {label: 'High', value: 'High'},
                      {label: 'Neutral', value: 'Neutral'},
                      {label: 'Low', value: 'Low'},
                    ]}
                    selectedOptions={[]}
                    setSelectedOptions={() => null}
                    title={'RCA Values'}
                  />
                </FilterContent>
              </CellContent>
            </Th>
            <Th>
              <CellContent>
                <SortContent
                  onClick={() => toggleSort(SortField.density)}
                >
                  <div>Predicted Growth</div>
                  <SortArrowsBase
                    className={sortField === SortField.density ? activeClass : undefined}
                    dangerouslySetInnerHTML={{__html: sortArrows}}
                  />
                </SortContent>
                <FilterContent>
                  <ColumnFilterBox
                    allOptions={[
                      {label: 'High', value: 'High'},
                      {label: 'Neutral', value: 'Neutral'},
                      {label: 'Low', value: 'Low'},
                    ]}
                    selectedOptions={[]}
                    setSelectedOptions={() => null}
                    title={'Growth Values'}
                  />
                </FilterContent>
              </CellContent>
            </Th>
            <Th>
              <CellContent>
                <SortContent
                  onClick={() => toggleSort(SortField.quadrant)}
                >
                  <div>Assigned category</div>
                  <SortArrowsBase
                    className={sortField === SortField.quadrant ? activeClass : undefined}
                    dangerouslySetInnerHTML={{__html: sortArrows}}
                  />
                </SortContent>
                <FilterContent>
                  <ColumnFilterBox
                    allOptions={quadrantOptionsArray}
                    selectedOptions={filterdQuadrants}
                    setSelectedOptions={setFilteredQuadrants as any}
                    title={'Categories'}
                  />
                </FilterContent>
              </CellContent>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  } else {
    output = null;
  }


  return (
    <Root>
      <ScrollRoot
        hideScrollbars={false}
        ignoreElements={'input'}
      >
        {output}
      </ScrollRoot>
    </Root>
  );
};

export default PSWOTTable;
