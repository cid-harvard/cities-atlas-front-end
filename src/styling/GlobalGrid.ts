import styled from 'styled-components/macro';

const lines = {
  rows: {
    // Horizontal Grid Lines
    pageTop: 'citiesAtlasGlobalGridPageTop',
    preHeaderTop: 'citiesAtlasGlobalGridPreHeaderTop',
    preHeaderBottom: 'citiesAtlasGlobalGridPreHeaderBottom',
    headerTop: 'citiesAtlasGlobalGridHeaderTop',
    headerBottom: 'citiesAtlasGlobalGridHeaderBottom',
    secondaryHeaderTop: 'citiesAtlasGlobalGridSecondaryHeaderTop',
    secondaryHeaderBottom: 'citiesAtlasGlobalGridSecondaryHeaderBottom',
    preContentTop: 'citiesAtlasGlobalGridPreContentTop',
    preContentBottom: 'citiesAtlasGlobalGridPreContentBottom',
    contentTop: 'citiesAtlasGlobalGridContentTop',
    contentBottom: 'citiesAtlasGlobalGridContentBottom',
    postContentTop: 'citiesAtlasGlobalGridPostContentTop',
    postContentBottom: 'citiesAtlasGlobalGridPostContentBottom',
    footerTop: 'citiesAtlasGlobalGridFooterTop',
    footerBottom: 'citiesAtlasGlobalGridFooterBottom',
    postFooterTop: 'citiesAtlasGlobalGridPostFooterTop',
    postFooterBottom: 'citiesAtlasGlobalGridPostFooterBottom',
    pageBottom: 'citiesAtlasGlobalGridPageBottom',
  },
  columns: {
    pageLeft: 'citiesAtlasGlobalGridPageLeft',
    navLeft: 'citiesAtlasGlobalGridNavLeft',
    navRight: 'citiesAtlasGlobalGridNavRight',
    contentLeft: 'citiesAtlasGlobalGridContentLeft',
    contentRight: 'citiesAtlasGlobalGridContentRight',
    pageRight: 'citiesAtlasGlobalGridPageRight',
  },
};

export const Root = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-rows:
    [${lines.rows.pageTop} ${lines.rows.preHeaderTop}] auto
    [${lines.rows.preHeaderBottom} ${lines.rows.headerTop}] auto
    [${lines.rows.headerBottom} ${lines.rows.secondaryHeaderTop}] auto
    [${lines.rows.secondaryHeaderBottom} ${lines.rows.preContentTop}] auto
    [${lines.rows.preContentBottom} ${lines.rows.contentTop}] 1fr
    [${lines.rows.contentBottom} ${lines.rows.postContentTop}] auto
    [${lines.rows.postContentBottom} ${lines.rows.footerTop}] auto
    [${lines.rows.footerBottom} ${lines.rows.postFooterTop}] auto
    [${lines.rows.postFooterBottom} ${lines.rows.pageBottom}];

  grid-template-columns:
    [${lines.columns.pageLeft} ${lines.columns.navLeft}] auto
    [${lines.columns.navRight} ${lines.columns.contentLeft}] 1fr
    [${lines.columns.contentRight} ${lines.columns.pageRight}];
`;

export const PrimaryHeaderContainer = styled.div`
  grid-row: ${lines.rows.headerTop} / ${lines.rows.headerBottom};
  grid-column: ${lines.columns.pageLeft} / ${lines.columns.pageRight};
`;
export const SecondaryHeaderContainer = styled.div`
  grid-row: ${lines.rows.secondaryHeaderTop} / ${lines.rows.secondaryHeaderBottom};
  grid-column: ${lines.columns.pageLeft} / ${lines.columns.pageRight};
`;
export const NavigationContainer = styled.div`
  grid-row: ${lines.rows.contentTop} / ${lines.rows.contentBottom};
  grid-column: ${lines.columns.navLeft} / ${lines.columns.navRight};
`;
export const ContentContainer = styled.div`
  grid-row: ${lines.rows.contentTop} / ${lines.rows.contentBottom};
  grid-column: ${lines.columns.contentLeft} / ${lines.columns.contentRight};
`;
export const PageArrowsContainer = styled.div`
  grid-row: ${lines.rows.postContentTop} / ${lines.rows.postContentBottom};
  grid-column: ${lines.columns.pageLeft} / ${lines.columns.pageRight};
`;
