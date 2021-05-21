import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
  backgroundMedium,
  baseColor,
  primaryFont,
  lightBaseColor,
} from '../../../styling/styleUtils';
import MultiSelect from '@khanacademy/react-multi-select';

const Root = styled.div`
  position: relative;
  z-index: 10;
  max-width: 100%;
  min-width: 120px;

  .multi-select {
    .dropdown {
      .dropdown-heading {
        border-radius: 0 !important;
        height: 1.5rem !important;
        border-top: none !important;
        border-bottom: none !important;
        border-left: none !important;
        border-right: none !important;
        color: ${lightBaseColor} !important;
        background-color: rgba(255, 255, 255, 0.75) !important;
        ::placeholder, span {
          color: ${lightBaseColor} !important;
          opacity: 1;
        }
        .dropdown-heading-dropdown-arrow span {
          border-color: ${lightBaseColor} transparent transparent !important;
        }
        .dropdown-heading-value {
          padding: 0.1rem 0.3rem !important;
          position: relative !important;
          line-height: 1.5rem !important;
          text-transform: none;
          font-weight: 400;
          span {
            color: ${lightBaseColor} !important;
          }
        }
      }
      .dropdown-content {
        font-family: ${primaryFont} !important;
        border-color: ${lightBorderColor} !important;
        input {
          border-radius: 0 !important;
          border-color: ${lightBaseColor} !important;
          font-family: ${primaryFont} !important;
        }
        .select-item {
          color: ${baseColor} !important;
          text-align: left;
          font-weight: 400;
          text-transform: none;
          padding: 2px 0px !important;

          .item-renderer {
            display: flex !important;
            align-items: center;
          }

          &:hover {
            background-color: ${backgroundMedium} !important;
          }
        }
      }
    }
    .dropdown[aria-expanded="true"] {
      .dropdown-heading {
        .dropdown-heading-dropdown-arrow span {
          border-color: transparent transparent ${lightBaseColor} !important;
        }
      }
    }
  }
`;

interface Props {
  allOptions: {label: string, value: string}[];
  selectedOptions: string[];
  setSelectedOptions: (s: string[]) => void;
  title: string;
  multipleAsValuesText?: boolean;
}

const ColumnFilterBox = (props: Props) => {
  const {
    allOptions, selectedOptions, setSelectedOptions,
    title,
  } = props;


  function selectBoxValueRenderer(selected: any) {
    if (selected.length === 0) {
      return `Filter ${title}`;
    } else if (selected.length === allOptions.length) {
      return `All ${title} selected`;
    } else if (props.multipleAsValuesText) {
      return selected.length === 1 ? selected.label : `${selected.length} values selected`;
    }
    return selected.length === 1 ? selected.label : `${selected.length} ${title} selected`;
  }

  return (
    <Root>
      <MultiSelect
        options={allOptions}
        selected={selectedOptions}
        onSelectedChanged={setSelectedOptions}
        valueRenderer={selectBoxValueRenderer}
        hasSelectAll={false}
        disableSearch={true}
      />
    </Root>
  );
};

export default ColumnFilterBox;
