import React, { useState } from "react";

export interface Settings {
  mapCallback?: (map: any) => void;
}

interface Props extends Settings {
  map: any;
}

const MapSettingsComponent = (props: Props) => {
  const { map, mapCallback } = props;

  const [haveSettingsBeenSet, setSettings] = useState<boolean>(false);

  if (map && haveSettingsBeenSet === false) {
    if (mapCallback !== undefined) {
      mapCallback(map);
    }
    setSettings(true);
  }

  return <React.Fragment />;
};

export default MapSettingsComponent;
