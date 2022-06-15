import React from 'react';
import {
  primaryFont,
} from '../../../styling/styleUtils';
import styled, {css} from 'styled-components/macro';
import GrowthLabLogoPNG from '../../../assets/branding/growth-lab-dark.png';
import CityverseLogoSVG from '../../../assets/icons/cities-logo-dark.svg';
import FacebookIconSVG from './assets/facebook.svg';
import TwitterIconSVG from './assets/twitter.svg';
import LinkedinIconSVG from './assets/linkedin.svg';
import YouTubeIconSVG from './assets/youtube.svg';
import ApplePodcastSVG from './assets/applepodcast.svg';
import {Routes} from '../../../routing/routes';
import {Link} from 'react-router-dom';

const Root = styled.div`
  grid-column: 1 / -1;
  grid-row: -1;
  color: #333;
`;

const Container = styled.div`
  padding: 2rem 2rem 2rem;
  background-color: #e6e6e6;
`;

const smallMediaWidth = 900; // in px

const Content = styled.div`
  display: grid;
  grid-column-gap: 3rem;
  grid-template-columns: 2fr auto auto minmax(auto, 1fr) 2fr;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 1200px) {
    grid-template-columns: 2fr auto auto auto 2fr;
  }
  @media (max-width: 1000px) {
    grid-column-gap: 1.5rem;
  }
  @media (max-width: ${smallMediaWidth}px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto auto;
  }
`;

const ColumnOrRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const GrowthLabLogo = styled.img`
  width: 180px;
  max-width: 100%;
  height: 100%;
  margin-top: -0.75rem;

  @media (max-width: 920px) {
    width: 180px;
  }
`;

const CityverseLogo = styled.img`
  width: 250px;
  max-width: 100%;
  height: 100%;
`;

const Subtitle = styled.h4`
  margin: 0.25rem 0 0;
  font-weight: 400;
  text-transform: none;
  font-size: 0.865rem;
  text-decoration: none;
  color: #333;
`;

const CityverseVersion = styled.p`
  margin: 0.5rem 0 0;
  font-style: italic;
  text-align: center;
  width: 100%;
`;

const CenteredColumn = styled(ColumnOrRow)`
  justify-content: flex-start;
  margin-bottom: 0;
`;

const SocialColumn = styled(ColumnOrRow)`
  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1 / -1;
    grid-row: 4;
    flex-direction: row;
    padding: 3rem 0 0;
  }
`;

const InternalLinksColumn = styled(ColumnOrRow)`
  display: flex;
  flex-direction: column;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1;
    grid-row: 2;
    padding: 2rem 0 0;
    display: flex;
    align-items: center;
    text-align: center;
  }
`;

const ExternalLinksColumn = styled(ColumnOrRow)`
  display: flex;
  flex-direction: column;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 2;
    grid-row: 2;
    padding: 2rem 0 0;
    display: flex;
    align-items: center;
    text-align: center;
  }
`;

const CityverseLogoColumn = styled(CenteredColumn)`
  display: flex;
  align-items: center;
  text-align: center;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1 / -1;
    grid-row: 1;
  }
`;

const LogoColumn = styled(CenteredColumn)`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;

  @media (max-width: ${smallMediaWidth}px) {
    grid-column: 1 / -1;
    grid-row: 3;
    align-items: center;
  }
`;

const GrowthLabInfo = styled.small`
  margin-top: 1rem;
  width: 100%;
  max-width: 300px;
  font-family: ${primaryFont};
  font-size: 0.75rem;
`;


const SocialLink = styled.a`
  width: 1.45rem;
  margin: 0 auto 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Icon = styled.img`
  max-width: 100%;
`;

const linkStyles = css`
  color: #333;
  text-decoration: none;
  text-transform: uppercase;
  margin-bottom: 0.5rem;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 1000px) {
    font-size: 0.75rem;
  }
`;

const StyledInternalLink = styled(Link)`
  ${linkStyles}
`;
const StyledExternalLink = styled.a`
  ${linkStyles}
`;

const LicenseAndReadme = styled.div`
  padding: 0.5rem;
  text-align: center;
  background-color: #333;
  color: #fff;
  font-size: 0.875rem;
  margin-bottom: 0;

  a {
    color: #fff;
    text-decoration: none;
    border-bottom: solid 1px transparent;

    &:hover {
      border-bottom-color: #fff;
    }
  }
`;

enum SocialType {
  facebook = 'facebook',
  twitter = 'twitter',
  linkedin = 'linkedin',
  youtube = 'youtube',
  applepodcast = 'applepodcast',
}


const defaultSocialIcons = [
  {
    target: 'https://www.facebook.com/HarvardCID/',
    type: SocialType.facebook,
    alt: 'facebook',
  },
  {
    target: 'https://www.linkedin.com/company/center-for-international-development-harvard-university/',
    type: SocialType.linkedin,
    alt: 'linkedin',
  },
  {
    target: 'https://twitter.com/HarvardGrwthLab',
    type: SocialType.twitter,
    alt: 'twitter',
  },
  {
    target: 'https://www.youtube.com/user/HarvardCID',
    type: SocialType.youtube,
    alt: 'youtube',
  },
  {
    target: 'https://podcasts.apple.com/us/podcast/growth-lab-podcast-series/id1486218164',
    type: SocialType.applepodcast,
    alt: 'apple podcast',
  },
];

const socialIcon = {
  facebook: FacebookIconSVG,
  twitter: TwitterIconSVG,
  linkedin: LinkedinIconSVG,
  youtube: YouTubeIconSVG,
  applepodcast: ApplePodcastSVG,
};

const StandardFooter = () => {
  const socialItems = defaultSocialIcons;

  const socialItemsList = socialItems.map(({target, type, alt}) =>{
    return (
      <SocialLink
        href={target}
        target='_blank'
        rel='noopener noreferrer'
        key={target + type}
      >
        <Icon
          src={socialIcon[type]}
          title={alt ? alt : ''}
          alt={alt ? alt : ''}
        />
      </SocialLink>
    );
  });

  return (
    <Root>
      <Container>
        <Content>
          <CityverseLogoColumn>
            <Link to={Routes.Landing}>
              <CityverseLogo
                src={CityverseLogoSVG}
                alt={'The Growth Lab\'s Metroverse'}
              />
            </Link>
            <Subtitle>
              The Growth Lab's Urban Economy Navigator
            </Subtitle>
            <CityverseVersion>
              Metroverse {process.env.REACT_APP_METROVERSE_VERSION}
            </CityverseVersion>
          </CityverseLogoColumn>
          <InternalLinksColumn>
            <StyledInternalLink to={Routes.Landing}>
              City Profiles
            </StyledInternalLink>
            <StyledInternalLink to={Routes.AboutBase}>
              About
            </StyledInternalLink>
            <StyledInternalLink to={Routes.ContactBase}>
              Contact
            </StyledInternalLink>
            <StyledInternalLink to={Routes.FaqBase}>
              FAQ
            </StyledInternalLink>
          </InternalLinksColumn>
          <ExternalLinksColumn>
            <StyledExternalLink href={'https://hksexeced.tfaforms.net/f/subscribe?s=a1n6g000000nJnxAAE'}>
              Newsletter
            </StyledExternalLink>
            <StyledExternalLink
              href='https://growthlab.app/'
              target='_blank' rel='noopener noreferrer'
            >
              Viz Hub
            </StyledExternalLink>
            <StyledExternalLink
              href='https://growthlab.cid.harvard.edu/'
              target='_blank' rel='noopener noreferrer'
            >
              Growth Lab
            </StyledExternalLink>
          </ExternalLinksColumn>
          <SocialColumn>
            {socialItemsList}
          </SocialColumn>
          <LogoColumn>
            <a
              href='https://growthlab.cid.harvard.edu/'
              target='_blank'
              rel='noopener noreferrer'
            >
              <GrowthLabLogo
                src={GrowthLabLogoPNG}
                alt={'The Growth Lab at Harvard\'s Center for International Development'}
              />
            </a>
            <GrowthLabInfo>
              Center for International Development at Harvard University<br />
              79 JFK St. | Mailbox 34 | Cambridge, MA 02138<br />
              617-495-4112 | cid@harvard.edu
            </GrowthLabInfo>
          </LogoColumn>
        </Content>
      </Container>
      <LicenseAndReadme>
        <div>
          Harvard Growth Lab’s digital tools are licensed under <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank' rel='noopener noreferrer'>Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)</a>.
        </div>
        <div style={{marginTop: '0.4rem'}}>
          Copyright © {new Date().getFullYear()} The President and Fellows of Harvard College
          {' | '}
          <a href='https://gdpr.harvard.edu/eeaprivacydisclosures' target='_blank' rel='noopener noreferrer'>
            Privacy
          </a>
          {' | '}
          <a href='http://accessibility.harvard.edu/' target='_blank' rel='noopener noreferrer'>
            Accessibility
          </a>
          {' | '}
          <a href='https://accessibility.huit.harvard.edu/digital-accessibility-policy' target='_blank' rel='noopener noreferrer'>
            Digital Accessibility
          </a>
          {' | '}
          <a href='http://www.harvard.edu/reporting-copyright-infringements' target='_blank' rel='noopener noreferrer'>
            Report Copyright
          </a>
        </div>
      </LicenseAndReadme>
    </Root>
  );
};

export default StandardFooter;
