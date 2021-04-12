import React from 'react';
import useGlobalIndustriesData from '../../../hooks/useGlobalIndustriesData';
import useRCAData from '../../../hooks/useRCAData';
import {
  DigitLevel,
  CompositionType,
  defaultCompositionType,
  ClassificationNaicsIndustry,
} from '../../../types/graphQL/graphQLTypes';
import Table, {getQuadrant} from './Table';
import {Props as RowDatum} from './TableRow';
import {
  sectorColorMap,
} from '../../../styling/styleUtils';

interface Props {
  digitLevel: DigitLevel;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
}

const PSWOTTable = (props: Props) => {
  const {
    digitLevel, compositionType, hiddenSectors,
  } = props;
  const rcaData = useRCAData(digitLevel);
  const industries = useGlobalIndustriesData();

  let error: any | undefined;
  if (industries.error !== undefined) {
    error = industries.error;
  }
  if (rcaData.error !== undefined) {
    error = rcaData.error;
  }

  let data: RowDatum[] | undefined;
  if (rcaData.data !== undefined && industries && industries.data) {
    const {naicsRca, naicsData} = rcaData.data;
    data = industries.data.industries
      .filter(d => d.level === digitLevel && !hiddenSectors.includes(d.naicsIdTopParent.toString()))
      .map(d => {
        const rcaDatum = naicsRca.find(dd => dd.naicsId !== null && dd.naicsId.toString() === d.naicsId);
        const densityDatum = naicsData.find(dd => dd.naicsId !== null && dd.naicsId.toString() === d.naicsId);
        let densityKey: 'densityCompany' | 'densityEmploy';
        if (compositionType === CompositionType.Companies ||
            (!compositionType && defaultCompositionType === CompositionType.Companies)) {
          densityKey = 'densityCompany';
        } else {
          densityKey = 'densityEmploy';
        }
        const density = densityDatum && densityDatum[densityKey] !== null ? densityDatum[densityKey] as number : 0;
        const rca = rcaDatum && rcaDatum.rca ? rcaDatum.rca : 0;
        const quadrant = getQuadrant(rca, density);
        const parent = sectorColorMap.find(dd => d.naicsIdTopParent.toString() === dd.id);
        const datum: RowDatum = {
          id: d.naicsId,
          name: d.name ? d.name : '',
          density,
          rca,
          quadrant,
          color: parent ? parent.color : 'gray',
        };
        return datum;
      });
  }

  return (
    <Table
      loading={industries.loading || rcaData.loading}
      error={error}
      data={data}
      compositionType={compositionType}
    />
  );
};

export default PSWOTTable;
