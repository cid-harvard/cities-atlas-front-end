import React, { useEffect, useState } from "react";
import styled from "styled-components/macro";
import { Link, useHistory } from "react-router-dom";
import {
  primaryColor,
  backgroundMedium,
  backgroundDark,
} from "../../../styling/styleUtils";
import debounce from "lodash/debounce";
import { rootId } from "./";

const StickyContainer = styled.div`
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
`;

const LinkBase = styled(Link)`
  padding: 0.75rem 0.65rem;
  border-left: solid 4px rgba(0, 0, 0, 0);
  text-transform: uppercase;
  color: ${backgroundDark};
  text-decoration: none;
  margin-bottom: 0.65rem;
  font-size: 1.1rem;

  &:hover,
  &.active {
    background-color: ${backgroundMedium};
    border-left-color: ${primaryColor};
  }

  @media (max-width: 760px) {
    font-size: 0.9rem;
    padding: 0.5rem 0.35rem;
  }

  @media (max-width: 400px) {
    font-size: 0.75rem;
    padding: 0.35rem 0.15rem;
  }
`;

export interface Section {
  label: string;
  route: string;
  active: boolean;
  Component: (props: any) => JSX.Element;
  ref: React.MutableRefObject<HTMLDivElement | null>;
}

interface Props {
  sections: Section[];
}

const Content = (props: Props) => {
  const { sections } = props;
  const { replace } = useHistory();
  const [firstRender, setFirstRender] = useState<boolean>(true);

  useEffect(() => {
    const node = document.querySelector("#" + rootId);
    const onScroll = debounce(() => {
      if (node) {
        const currentSection = [...sections].reverse().find(({ ref }) => {
          const section = ref.current;
          if (section && section.offsetTop < node.scrollTop + 200) {
            return true;
          } else {
            return false;
          }
        });
        if (currentSection) {
          replace(currentSection.route);
        }
      }
    }, 50);
    if (node) {
      node.addEventListener("scroll", onScroll);
    }
    return () => {
      if (node) {
        node.removeEventListener("scroll", onScroll);
      }
    };
  }, [sections, replace]);

  useEffect(() => {
    if (firstRender) {
      const currentSection = sections.findIndex(({ active }) => active);
      if (currentSection !== -1 && sections[currentSection]) {
        const node = sections[currentSection].ref.current;
        const root = document.querySelector("#" + rootId);
        if (currentSection === 0 && root) {
          root.scrollTo({ top: 0, behavior: "smooth" });
        } else if (node) {
          node.scrollIntoView({ behavior: "smooth" });
        }
      }
      setFirstRender(false);
    }
  }, [sections, firstRender]);

  const navLinks: React.ReactElement<any>[] = [];
  const contentSections: React.ReactElement<any>[] = [];
  sections.forEach(({ route, label, active, ref, Component }) => {
    navLinks.push(
      <LinkBase
        to={route}
        key={"side-nav-to-" + route}
        className={active ? "active" : undefined}
        onClick={() => setFirstRender(true)}
      >
        {label}
      </LinkBase>,
    );
    contentSections.push(
      <div key={"component-for-" + route} ref={ref}>
        <Component />
      </div>,
    );
  });
  return (
    <>
      <div>{contentSections}</div>
      <div>
        <StickyContainer>{navLinks}</StickyContainer>
      </div>
    </>
  );
};

export default Content;
