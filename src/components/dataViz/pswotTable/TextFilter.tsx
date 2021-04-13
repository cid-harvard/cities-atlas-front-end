import debounce from 'lodash/debounce';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components/macro';
import {
  lightBaseColor,
  primaryFont,
} from '../../../styling/styleUtils';

const SearchContainer = styled.label`
  position: relative;
  display: flex;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.2rem;
  box-sizing: border-box;
  box-shadow: 0px 0px 3px -1px #b5b5b5;
  font-weight: 400;
  font-family: ${primaryFont};
  border: none;
  color: ${lightBaseColor};
  height: 1.5rem;
  line-height: 1.5rem;
  background-color: rgba(255, 255, 255, 0.75);
`;

const ClearButton = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  padding: 0.25rem;
  line-height: 0;
  font-size: 0.875rem;
  background-color: transparent;
  color: ${lightBaseColor};
`;

interface Props {
  placeholder: string;
  setSearchQuery: (value: string) => void;
  initialQuery: string;
}

const StandardSearch = (props: Props) => {
  const {
    placeholder, setSearchQuery, initialQuery,
  } = props;

  const searchEl = useRef<HTMLInputElement | null>(null);
  const clearEl = useRef<HTMLButtonElement | null>(null);

  const onChange = debounce(() => {
    if (searchEl !== null && searchEl.current !== null) {
      setSearchQuery(searchEl.current.value);
      if (clearEl && clearEl.current) {
        clearEl.current.style.display = searchEl.current.value.length ? 'block' : 'none';
      }
    }
  }, 400);

  const clearSearch = () => {
    if (searchEl !== null && searchEl.current !== null) {
      searchEl.current.value = '';
      setSearchQuery(searchEl.current.value);
    }
    if (clearEl && clearEl.current) {
      clearEl.current.style.display = 'none';
    }
  };

  useEffect(() => {
    const node = searchEl.current;
    if (node) {
      if (!node.value) {
        node.value = initialQuery;
      }
      if (clearEl && clearEl.current) {
        clearEl.current.style.display = node.value.length ? 'block' : 'none';
      }
    }
  }, [searchEl, initialQuery]);

  return (
    <SearchContainer>
      <SearchBar
        ref={searchEl}
        type={'text'}
        placeholder={placeholder}
        onChange={onChange}
        autoComplete={'off'}
      />
      <ClearButton
        ref={clearEl}
        style={{display: 'none'}}
        onClick={clearSearch}
      >
        ×
      </ClearButton>
    </SearchContainer>
  );
};

export default StandardSearch;
