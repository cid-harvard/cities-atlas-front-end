import ReactMapboxGl, { MapContext } from "react-mapbox-gl";
import React from "react";
import SettingsComponent, { Settings } from "./ClusterMapSettingsComponent";
import { Coordinate } from "./Utils";

const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  ? process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  : "";

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

interface Props extends Settings {
  clearPopup: () => void;
  children?: React.ReactElement<any>;
  center?: Coordinate;
  maxBounds?: [Coordinate, Coordinate];
  fitBounds?: [Coordinate, Coordinate];
  padding: { top: number; left: number; right: number; bottom: number };
}

const DefaultMap = (props: Props) => {
  const {
    children,
    center,
    padding,
    maxBounds,
    fitBounds,
    clearPopup,
    ...settings
  } = props;

  const mapRenderProps = (mapEl: any) => {
    return <SettingsComponent map={mapEl} {...settings} />;
  };

  const onClick = () => clearPopup();

  return (
    <Mapbox
      // eslint-disable-next-line
      style={"mapbox://styles/harvardgrowthlab/ckp2oylqb0m5t17mpjailhu2f"}
      containerStyle={{
        height: "100%",
        width: "100%",
      }}
      center={center}
      zoom={zoom}
      maxBounds={maxBounds}
      fitBounds={fitBounds}
      fitBoundsOptions={{ padding, linear: true }}
      onClick={onClick}
    >
      {children}
      <MapContext.Consumer children={mapRenderProps} />
    </Mapbox>
  );
};

export default DefaultMap;
