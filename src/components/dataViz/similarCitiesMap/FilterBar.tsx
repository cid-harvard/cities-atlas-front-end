import React, {useState} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import {
  primaryColor,
  ButtonBase,
  backgroundDark,
  backgroundMedium,
  baseColor,
  primaryFont,
  lightBaseColor,
} from '../../../styling/styleUtils';
import useFluent from '../../../hooks/useFluent';
import ReactSlider from 'react-slider';
import MultiSelect from '@khanacademy/react-multi-select';

const Title = styled.h3`
  color: ${primaryColor};
  text-transform: uppercase;
  margin: 0;
  font-size: 0.875rem;
`;

const Settings = styled.div`
  padding-top: 0.35rem;
  display: flex;
`;

const ExpandBox = styled.div`
  flex-grow: 1;
  padding-right: 1rem;
`;

const ShrinkBox = styled.div`
  flex-shrink: 1;
  margin-top: auto;
`;

const UpdateButton = styled(ButtonBase)`
  background-color: ${backgroundDark};
  color: #fff;
`;


const slideRootClassName = 'react-slider-root-class';
const slideThumbClassName = 'react-slider-thumb-class';
const slideTrackClassName = 'react-slider-track-class';

const SliderContainer = styled.div`
  margin-top: 1.5rem;

  .${slideThumbClassName} {
    background-color: ${primaryColor};
    height: 1rem;
    width: 1rem;
    border-radius: 1000px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;

    span {
      color: ${primaryColor};
      transform: translateY(-100%);
    }
  }
  .${slideThumbClassName}-0 {
    transform: translateX(-0.1rem);
  }
  .${slideTrackClassName} {
    margin-top: 0.25rem;
  }
  .${slideTrackClassName}-0 {
    background-color: ${backgroundMedium};
    height: 0.5rem;
  }
  .${slideTrackClassName}-1 {
    background-color: ${backgroundDark};
    height: 0.5rem;
  }
  .${slideTrackClassName}-2 {
    background-color: ${backgroundMedium};
    height: 0.5rem;
  }
`;

const SelectBoxContainer = styled.div`
  margin-top: 0.3rem;

  .multi-select {
    .dropdown {
      .dropdown-heading {
        border-radius: 0 !important;
        border-color: ${backgroundDark} !important;
        color: ${baseColor} !important;
        ::placeholder, span {
          color: ${baseColor} !important;
          opacity: 1;
        }
        .dropdown-heading-dropdown-arrow span {
          border-color: ${baseColor} transparent transparent !important;
        }
      }
      .dropdown-content {
        font-family: ${primaryFont} !important;
        border-color: ${lightBaseColor} !important;
        input {
          border-radius: 0 !important;
          border-color: ${lightBaseColor} !important;
          font-family: ${primaryFont} !important;
        }
        .select-item {
          color: ${baseColor} !important;

          &:hover {
            background-color: ${backgroundMedium} !important;
          }
        }
      }
    }
    .dropdown[aria-expanded="true"] {
      .dropdown-heading {
        .dropdown-heading-dropdown-arrow span {
          border-color: transparent transparent ${baseColor} !important;
        }
      }
    }
  }
`;

const options = [
  {label: 'One', value: 1},
  {label: 'Two', value: 2},
  {label: 'Three', value: 3},
];

function selectBoxValueRenderer(selected: any, allOptions: any) {
  if (selected.length === 0 || selected.length === allOptions.length) {
    return 'All Regions';
  }

  return selected.length === 1 ? selected.label : `${selected.length} Regions Selected`;
}

interface Props {
  node: HTMLDivElement | null;
}

const FilterBar = (props: Props) => {
  const {node} = props;
  const getString = useFluent();
  const [selected, setSelected] = useState<any>([]);

  if (node) {
    return createPortal((
      <>
        <Title>{getString('city-filter-title')}</Title>
        <Settings>
          <ExpandBox>
            {getString('global-text-population')}
            <SliderContainer>
              <ReactSlider
                className={slideRootClassName}
                thumbClassName={slideThumbClassName}
                trackClassName={slideTrackClassName}
                defaultValue={[18, 344]}
                renderThumb={(p, state) => <small {...p}><span>{state.valueNow}</span></small>}
                pearling
                max={344}
                min={18}
                minDistance={10}
              />
            </SliderContainer>
          </ExpandBox>
          <ExpandBox>
            {getString('global-text-gdp-per-capita')}
            <SliderContainer>
              <ReactSlider
                className={slideRootClassName}
                thumbClassName={slideThumbClassName}
                trackClassName={slideTrackClassName}
                defaultValue={[18, 344]}
                renderThumb={(p, state) => <small {...p}><span>{state.valueNow}</span></small>}
                pearling
                max={344}
                min={18}
                minDistance={10}
              />
            </SliderContainer>
          </ExpandBox>
          <ExpandBox>
            {getString('city-filter-regions')}
            <SelectBoxContainer>
              <MultiSelect
                options={options}
                selected={selected}
                onSelectedChanged={(s: any) => setSelected(s)}
                valueRenderer={selectBoxValueRenderer}
                hasSelectAll={false}
              />
            </SelectBoxContainer>
          </ExpandBox>
          <ShrinkBox>
            <UpdateButton>
              {getString('city-filter-update')}
            </UpdateButton>
          </ShrinkBox>
        </Settings>
      </>
    ), node);
  }

  return null;
};

export default FilterBar;
