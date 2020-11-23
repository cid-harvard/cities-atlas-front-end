import React, {useEffect} from 'react';
import LoadingBlock from '../../../../../components/transitionStateComponents/VizLoadingBlock';
import html2canvas from 'html2canvas';
import {FullPageOverlay} from '../../../../../styling/styleUtils';
import useGlobalLocationData from '../../../../../hooks/useGlobalLocationData';
import useFluent from '../../../../../hooks/useFluent';
import {RegionGroup} from '../../../../../components/dataViz/comparisonBarChart/cityIndustryComparisonQuery';

interface Props {
  primaryCityId: string;
  secondaryCityId: string;
  year: number;
  onClose: () => void;
}

export default (props: Props) => {
  const {
    onClose, primaryCityId, secondaryCityId, year,
  } = props;

  const {loading, data: globalData} = useGlobalLocationData();
  const getString = useFluent();

  useEffect(() => {
    const node: HTMLElement | null = document.querySelector('.react-comparison-bar-chart-root-container');
    if (node) {
      Array.from(node.querySelectorAll('.react-comparison-bar-chart-row-label')).forEach((elm: HTMLElement) => {
        elm.style.opacity = '1';
      });
      const button: HTMLElement | null = node.querySelector('.react-comparison-bar-chart-expand-button');
      if (button) {
        button.style.display = 'none';
      }
      const primaryCityDatum = globalData
        ? globalData.cities.find(c => c.cityId === primaryCityId) : undefined;
      const primaryCityName = primaryCityDatum && primaryCityDatum.name? primaryCityDatum.name : '';


      let secondaryCityName: string;
      if (secondaryCityId === RegionGroup.World) {
        secondaryCityName = getString('global-text-world');
      } else if (secondaryCityId === RegionGroup.SimilarCities) {
        secondaryCityName = getString('global-text-similar-cities');
      } else {
        const secondaryCityDatum = globalData
          ? globalData.cities.find(c => parseInt(c.cityId, 10) === parseInt(secondaryCityId, 10)) : undefined;
        secondaryCityName = secondaryCityDatum && secondaryCityDatum.name ? secondaryCityDatum.name : '';
      }

      html2canvas(node).then(canvas => {
        const link = document.createElement('a');
        link.download =
          `Difference of shares for ${primaryCityName} and ${secondaryCityName} in ${year}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        link.remove();
        if (button) {
          button.style.display = 'flex';
        }
        onClose();
      })
      .catch(e => {
        console.error(e);
        if (button) {
          button.style.display = 'flex';
        }
        onClose();
      });
    } else if (!loading) {
      onClose();
    }
  }, [onClose, globalData, loading, primaryCityId, secondaryCityId, year, getString]);

  return (
    <FullPageOverlay>
      <LoadingBlock />
    </FullPageOverlay>
  );
};
