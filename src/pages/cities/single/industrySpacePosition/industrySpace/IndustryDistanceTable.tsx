import React, {useState, useRef, useEffect} from 'react';
import {LoadingOverlay} from '../../../../../components/transitionStateComponents/VizLoadingBlock';
import SimpleError from '../../../../../components/transitionStateComponents/SimpleError';
import useLayoutData from '../../../../../components/dataViz/industrySpace/chart/useLayoutData';
import {
  useGlobalIndustryMap,
} from '../../../../../hooks/useGlobalIndustriesData';
import useFluent from '../../../../../hooks/useFluent';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
  lightBaseColor,
  sectorColorMap,
} from '../../../../../styling/styleUtils';
import {rgba} from 'polished';
import MiniMap from '../../../../../components/dataViz/industrySpace/MiniMap';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto auto;
  border: solid 1px ${lightBorderColor};
  border-bottom: none;
`;

const Table = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`;

const Subtitle = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  color: ${lightBaseColor};
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  padding: 0.5rem 0.35rem;

  &:hover {
    cursor: pointer;
  }
`;

const NameCell = styled(TableCell)`
  border-left: solid 2px ${lightBorderColor};
  border-right: solid 1px ${lightBorderColor};
  font-weight: 600;
`;

const HeaderCell = styled(Subtitle)`
  border-bottom: solid 1px ${lightBorderColor};
  position: sticky;
  top: 0;
  background-color: #fff;
  padding: 0.35rem;
`;

const MiniMapContainer = styled.div`
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  position: sticky;
  bottom: 0;
  margin-top: auto;
  border-top: solid 1px ${lightBorderColor};
  border-bottom: solid 1px ${lightBorderColor};
`;

interface Props {
  id: string;
  hovered: string | undefined;
  setHovered: (value: string | undefined) => void;
  setHighlighted: (value: string | undefined) => void;
}

const IndustryDistanceTable = (props: Props) => {
  const {
    id, hovered, setHovered, setHighlighted,
  } = props;

  const getString = useFluent();
  const layout = useLayoutData();
  const {data: industryData} = useGlobalIndustryMap();
  const titleRef = useRef<HTMLDivElement | null>(null);
  const [titleHeight, setTitleHeight] = useState<number>(0);

  useEffect(() => {
    const titleNode = titleRef.current;
    if (titleNode) {
      setTitleHeight(titleNode.offsetHeight);
    }
  }, [titleRef, id, layout]);

  const clearHovered = () => setHovered(undefined);

  let output: React.ReactElement<any> | null;
  if (layout.loading) {
    output = null;
  } else if (layout.error) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(layout.error);
  } else if (layout.data !== undefined && industryData !== undefined) {
    const node = layout.data.nodes.find(n => n.id === id);
    if (node) {
      const edges = node.edges.map(({trg}) => {
        const industry = industryData[trg];
        if (industry) {
          const parent = industryData[industry.naicsIdTopParent];
          const parentIndustry = sectorColorMap.find(s => s.id === industry.naicsIdTopParent.toString());
          const onMouseEnter = () => setHovered(industry.naicsId);
          const onMouseClick = () => setHighlighted(industry.naicsId);
          const color = parentIndustry ? parentIndustry.color : lightBorderColor;
          return (
            <React.Fragment key={industry.naicsId}>
              <NameCell
                style={{
                  borderLeftColor: color,
                  backgroundColor: hovered === industry.naicsId ? rgba(color, 0.4) : undefined,
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={clearHovered}
                onClick={onMouseClick}
              >
                {industry.name}
              </NameCell>
              <TableCell
                style={{
                  backgroundColor: hovered === industry.naicsId ? rgba(color, 0.4) : undefined,
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={clearHovered}
                onClick={onMouseClick}
              >
                {parent ? parent.name : ''}
              </TableCell>
            </React.Fragment>
          );
        } else {
          return null;
        }
      });
      output = (
        <>
          <Root>
            <div>
              <Table>
                <HeaderCell style={{top: titleHeight}}>
                  {getString('global-ui-related-industry')}
                </HeaderCell>
                <HeaderCell style={{top: titleHeight}}>
                  {getString('global-ui-sector')}
                </HeaderCell>
                {edges}
              </Table>
            </div>
            <MiniMapContainer>
              <MiniMap
                highlighted={id}
              />
            </MiniMapContainer>
          </Root>
        </>
      );
    } else {
      output = (
        <LoadingOverlay>
          <SimpleError />
        </LoadingOverlay>
      );
    }
  } else {
    output = null;
  }

  return (
    <>
      {output}
    </>
  );
};

export default IndustryDistanceTable;
