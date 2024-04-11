import React, { useState } from "react";
import ClusterMap from "../../../../../components/map/ClusterLandingMap";
import { Layer, Feature } from "react-mapbox-gl";
import { togglePointer, Coordinate } from "../../../../../components/map/Utils";
import {
  secondaryColor,
  primaryColor,
} from "../../../../../styling/styleUtils";
import {
  ExtendedSearchDatum,
  StyledPopup,
  TootltipTitle,
} from "../../../../landing/Utils";
import { SuccessResponse } from "../../../../landing";
import MapSettings from "./MapSettings";
import { MapContext } from "react-mapbox-gl";

interface ClusterFeatures {
  type: "Feature";
  properties: {
    id: string;
  };
  geometry: {
    coordinates: Coordinate;
  };
}

interface MapData {
  features: React.ReactElement<any>[];
  geoJsonClusterData: {
    type: string;
    features: ClusterFeatures[];
  };
}

export interface BoundsConfig {
  bounds: [Coordinate, Coordinate];
  padding: { top: number; left: number; right: number; bottom: number };
}

interface Props {
  loading: boolean;
  error: any;
  data: SuccessResponse | undefined;
  currentCityId: string | null;
  fitBounds: BoundsConfig;
}

const mapRenderProps = (mapEl: any) => {
  return <MapSettings map={mapEl} />;
};

const CityMap = (props: Props) => {
  const { loading, error, data, currentCityId, fitBounds } = props;

  let mapData: MapData = {
    features: [],
    geoJsonClusterData: {
      type: "FeatureCollection",
      features: [],
    },
  };

  const [hovered, setHovered] = useState<ExtendedSearchDatum | null>(null);

  if (data !== undefined) {
    const features: React.ReactElement<any>[] = [];
    const clusterFeatures: ClusterFeatures[] = [];
    const { cities, countries } = data;
    cities.forEach((city) => {
      const {
        cityId,
        name,
        centroidLon,
        countryId,
        geometry,
        populationLatest,
        gdppc,
        nameList,
      } = city;
      const coordinates: Coordinate[][][] = geometry
        ? JSON.parse(geometry).coordinates
        : [];
      const northernTerminus = Math.max(
        ...coordinates[0][0].map((coord) => coord[1]),
      );
      const center: Coordinate = [
        centroidLon ? centroidLon : 0,
        northernTerminus,
      ];
      const parent = countries.find(
        (c) => parseInt(c.countryId, 10) === countryId,
      );
      const countryName =
        parent && parent.nameShortEn ? parent.nameShortEn : "";
      const population = populationLatest ? populationLatest : 0;
      const gdp = gdppc && !isNaN(gdppc) ? parseFloat(gdppc.toFixed(2)) : 0;
      const id = cityId;
      const searchDatum: ExtendedSearchDatum = {
        id,
        title: name + ", " + countryName,
        parent_id: countryId,
        level: "1",
        center,
        coordinates: coordinates[0][0],
        population: Math.round(population),
        gdp,
        keywords: nameList ? nameList : undefined,
      };
      const onMouseEnter = (event: any) => {
        setHovered(searchDatum);
        togglePointer(event.map, "pointer");
      };
      const onMouseLeave = (event: any) => {
        setHovered(null);
        togglePointer(event.map, "");
      };
      features.push(
        <Feature
          coordinates={coordinates[0]}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          key={"geojson-" + id}
        />,
      );
      clusterFeatures.push({
        type: "Feature",
        properties: { id },
        geometry: { coordinates: center },
      });
    });
    const geoJsonClusterData = {
      type: "FeatureCollection",
      features: clusterFeatures,
    };
    mapData = { features, geoJsonClusterData };
  }

  const hoveredTooltipPopup = hovered ? (
    <StyledPopup coordinates={hovered.center}>
      <TootltipTitle>{hovered.title}</TootltipTitle>
    </StyledPopup>
  ) : null;

  let mapContent: React.ReactElement<any>;
  if (loading === true) {
    mapContent = <></>;
  } else if (error !== undefined) {
    console.error(error);
    mapContent = <></>;
  } else if (data !== undefined) {
    mapContent = (
      <>
        <Layer
          type="fill"
          id={"primary-map-geojson-layer"}
          paint={{
            "fill-color": primaryColor,
          }}
          before={"road-simple"}
        >
          {mapData.features}
        </Layer>

        <Layer
          type="fill"
          id={"highlighted-geojson-layer"}
          paint={{
            "fill-color": secondaryColor,
          }}
          before={"road-simple"}
        >
          {mapData.features.filter(
            ({ key }) =>
              (hovered && key === "geojson-" + hovered.id) ||
              "geojson-" + currentCityId === key,
          )}
        </Layer>
        {hoveredTooltipPopup}
      </>
    );
  } else {
    mapContent = <></>;
  }

  return (
    <ClusterMap
      clearPopup={() => false}
      fitBounds={fitBounds.bounds}
      padding={fitBounds.padding}
    >
      <>
        {mapContent}
        <MapContext.Consumer children={mapRenderProps} />
      </>
    </ClusterMap>
  );
};

export default CityMap;
