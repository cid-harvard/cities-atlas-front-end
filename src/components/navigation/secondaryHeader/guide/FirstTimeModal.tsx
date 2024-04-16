import React, { useState } from "react";
import Modal from "../../../standardModal";
import styled, { keyframes } from "styled-components/macro";
import {
  backgroundDark,
  primaryColor,
  primaryHoverColor,
} from "../../../../styling/styleUtils";
import CityverseLogoURL from "../../../../assets/icons/cities-logo.svg";

const growIn = keyframes`
  0% {
    transform: scale(0.4);
  }

  100% {
    transform: scale(1);
  }
`;

const Root = styled.div`
  background-color: ${backgroundDark};
  position: relative;
  animation: ${growIn} 0.1s normal forwards ease-in-out;
  animation-iteration-count: 1;
  color: #fff;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 500px;

  @media screen and (max-width: 700px) {
    width: auto;
  }

  @media screen and (max-height: 800px) {
    overflow: visible;
  }
`;

const Logo = styled.img`
  width: 14rem;
`;

const Text = styled.div`
  margin: 2rem 0;
  text-transform: uppercase;
  font-size: 1.25rem;
`;

const StartGuideButton = styled.button`
  background-color: ${primaryHoverColor};
  color: #fff;
  text-transform: uppercase;
  border: none;
  padding: 1.3rem 1.5rem;
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
  font-weight: 600;

  &:hover {
    background-color: ${primaryColor};
  }
`;

const DismissButton = styled.button`
  border: none;
  padding: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2rem;
  background-color: #676c75;
  color: #fff;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: #fff;
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 5px;
`;

const modalVersion = "0_1";
const localStorageKey = "localStorageFirstTimeGuideModalKey" + modalVersion;
let dismissedSinceSession = false;

interface Props {
  startGuide: () => void;
}

const FirstTimeModal = ({ startGuide }: Props) => {
  const initialCheckedValue = parseInt(
    localStorage.getItem(localStorageKey) as any,
    10,
  );
  const [modalOpen, setModalOpen] = useState<boolean>(
    isNaN(initialCheckedValue) || initialCheckedValue < 5,
  );
  const [checked, setChecked] = useState<boolean>(false);
  const closeModal = () => {
    setModalOpen(false);
    dismissedSinceSession = true;
    if (checked) {
      localStorage.setItem(localStorageKey, "5");
    } else {
      const newCheckedCount = isNaN(initialCheckedValue)
        ? 0
        : initialCheckedValue + 1;
      localStorage.setItem(localStorageKey, newCheckedCount.toString());
    }
  };

  const onStart = () => {
    setModalOpen(false);
    dismissedSinceSession = true;
    localStorage.setItem(localStorageKey, "5");
    startGuide();
  };

  if (modalOpen && !dismissedSinceSession) {
    return (
      <Modal onClose={closeModal} width={"800px"} height={"400px"}>
        <Root>
          <Logo src={CityverseLogoURL} />
          <Text>Learn the Metroverse basics</Text>
          <StartGuideButton onClick={onStart}>
            Follow our step-by-step guide
          </StartGuideButton>
          <DismissButton onClick={closeModal}>Not Now</DismissButton>
          <CheckboxLabel htmlFor="dont-show-tutorial-on-start-again">
            <Checkbox
              type="checkbox"
              id="dont-show-tutorial-on-start-again"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            Don't show it again
          </CheckboxLabel>
        </Root>
      </Modal>
    );
  }
  return null;
};

export default FirstTimeModal;
