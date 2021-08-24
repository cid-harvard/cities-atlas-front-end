import React from 'react';
import StandardSideTextBlock from '../../../../components/general/StandardSideTextBlock';
import {
  ContentParagraph,
  ContentTitle,
} from '../../../../styling/styleUtils';
import useFluent from '../../../../hooks/useFluent';
import useCurrentCity from '../../../../hooks/useCurrentCity';
import StandardSideTextLoading from '../../../../components/transitionStateComponents/StandardSideTextLoading';
import NodeLegend from '../../../../components/dataViz/legend/NodeLegend';
import Helmet from 'react-helmet';

interface Props {
  nodeSizingMinText: string | undefined;
  nodeSizingMaxText: string | undefined;
  nodeSizingTitle: string | undefined;
}

const SideText = (props: Props) => {
  const {
    nodeSizingTitle, nodeSizingMaxText, nodeSizingMinText,
  } = props;
  const getString = useFluent();
  const {loading, city} = useCurrentCity();

  if (loading) {
    return <StandardSideTextLoading />;
  } else if (city) {
    const cityName = city.name ? city.name : '';

    const title = getString('city-similarity-title', {
      'name': cityName,
    });
    const para1 = getString('city-similarity-para-1');

    return (
      <StandardSideTextBlock>
        <Helmet>
          <title>{title + ' | ' + getString('meta-data-title-default-suffix')}</title>
          <meta property='og:title' content={title + ' | ' + getString('meta-data-title-default-suffix')} />
        </Helmet>
        <ContentTitle>{title}</ContentTitle>
        <ContentParagraph>{para1}</ContentParagraph>
        <NodeLegend
          sizeBy={nodeSizingMinText && nodeSizingMaxText && nodeSizingTitle ? {
              title: nodeSizingTitle,
              minLabel: nodeSizingMinText,
              maxLabel: nodeSizingMaxText,
            } : null
          }
          colorBy={null}
        />
      </StandardSideTextBlock>
    );
  } else {
    return null;
  }

};

export default SideText;
