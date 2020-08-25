import ReactMapboxGl, {
  MapContext,
} from 'react-mapbox-gl';
import React from 'react';
import SettingsComponent, {Settings} from './ClusterMapSettingsComponent';
import {Coordinate} from './Utils';

const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? process.env.REACT_APP_MAPBOX_ACCESS_TOKEN : '';

const Mapbox = ReactMapboxGl({
  accessToken,
  maxZoom: 16,
  attributionControl: false,
});

let padding: {top: number, left: number, right: number, bottom: number};
let zoom: [number] | undefined;
const dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};
if (dimensions.width < 600 || dimensions.height < 600) {
  padding = {
    top: dimensions.height * 0.5,
    bottom: 10,
    right: dimensions.width * 0.1,
    left: dimensions.width * 0.1,
  };
  zoom = [1.4];
} else if (dimensions.width < 800 || dimensions.height < 800) {
  padding = {
    top: dimensions.height * 0.25,
    bottom: dimensions.height * 0.1,
    right: dimensions.width * 0.1,
    left: dimensions.width * 0.4,
  };
} else {
  padding = {
    top: dimensions.height * 0.25,
    bottom: dimensions.height * 0.1,
    right: dimensions.width * 0.1,
    left: dimensions.width / 2,
  };
}

interface Props extends Settings {
  clearPopup: () => void;
  children?: React.ReactElement<any>;
  center?: Coordinate;
  maxBounds?: [Coordinate, Coordinate];
  fitBounds?: [Coordinate, Coordinate];
}

const DefaultMap = (props: Props) => {
  const {
    children, center,
    maxBounds, fitBounds, clearPopup,
    ...settings
  } = props;

  const mapRenderProps = (mapEl: any) => {
    return (
      <SettingsComponent
        map={mapEl}
        {...settings}
      />
    );
  };

  const onClick = () => clearPopup();


  return (
    <Mapbox
      // eslint-disable-next-line
      style={'mapbox://styles/harvardgrowthlab/cke4hmgga05p418pd0vat4viq'}
      containerStyle={{
        height: '100%',
        width: '100%',
      }}
      center={center}
      zoom={zoom}
      maxBounds={maxBounds}
      fitBounds={fitBounds}
      fitBoundsOptions={{padding, linear: true}}
      onClick={onClick}
    >
      {children}
      <MapContext.Consumer children={mapRenderProps} />
    </Mapbox>
  );
};

export default DefaultMap;
