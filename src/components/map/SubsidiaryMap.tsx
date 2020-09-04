import ReactMapboxGl, {
  MapContext,
} from 'react-mapbox-gl';
import React from 'react';
import SettingsComponent, {Settings} from './SubsidiaryMapSettingsComponent';
import {Coordinate} from './Utils';

const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? process.env.REACT_APP_MAPBOX_ACCESS_TOKEN : '';

const Mapbox = ReactMapboxGl({
  accessToken,
  maxZoom: 16,
  attributionControl: false,
});

let zoom: [number] | undefined;
const dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
};
if (dimensions.width < 600 || dimensions.height < 600) {
  zoom = [1.4];
}
const padding = {
  top: 180,
  bottom: dimensions.height * 0.1,
  right: dimensions.width * 0.1,
  left: dimensions.width * 0.1,
};

interface Props extends Settings {
  children?: React.ReactElement<any>;
  center?: Coordinate;
  maxBounds?: [Coordinate, Coordinate];
  fitBounds?: [Coordinate, Coordinate];
}

const DefaultMap = (props: Props) => {
  const {
    children, center,
    maxBounds, fitBounds,
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

  return (
    <Mapbox
      // eslint-disable-next-line
      style={'mapbox://styles/harvardgrowthlab/ckelvcgh70cg019qgiu39035a'}
      containerStyle={{
        height: '100%',
        width: '100%',
      }}
      center={center}
      zoom={zoom}
      maxBounds={maxBounds}
      fitBounds={fitBounds}
      fitBoundsOptions={{padding, linear: true}}
    >
      {children}
      <MapContext.Consumer children={mapRenderProps} />
    </Mapbox>
  );
};

export default DefaultMap;
