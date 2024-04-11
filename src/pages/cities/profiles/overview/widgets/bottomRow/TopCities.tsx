import orderBy from "lodash/orderBy";
import React from "react";
import useProximityData from "../../../../../../components/dataViz/similarCitiesMap/useProximityData";
import Tooltip from "../../../../../../components/general/Tooltip";
import useCurrentCity from "../../../../../../hooks/useCurrentCity";
import useFluent from "../../../../../../hooks/useFluent";
import useGlobalLocationData from "../../../../../../hooks/useGlobalLocationData";
import { defaultYear } from "../../../../../../Utils";
import { Icon, ListItem, TitleBase, ValueBase, YearText } from "../styleUtils";
import TopCitiesSVG from "../../../../../../assets/icons/topsimilarcities.svg";
import SimpleTextLoading from "../../../../../../components/transitionStateComponents/SimpleTextLoading";

const TopCities = () => {
  const getString = useFluent();
  const { loading, error, data } = useProximityData();
  const globalLocations = useGlobalLocationData();
  const currentCity = useCurrentCity();
  let topCitiesElement: React.ReactElement<any> | null;
  if (loading || globalLocations.loading || currentCity.loading) {
    topCitiesElement = <SimpleTextLoading />;
  } else if (error) {
    console.error(error);
    topCitiesElement = null;
  } else if (globalLocations.error) {
    console.error(globalLocations.error);
    topCitiesElement = null;
  } else if (data && globalLocations.data && currentCity.city) {
    const minPop = currentCity.city.population
      ? currentCity.city.population / 2
      : 0;
    const maxPop = currentCity.city.population
      ? currentCity.city.population * 2
      : 0;
    const topLocations = orderBy(data.cities, ["eucdist"])
      .map((d) => {
        const city = globalLocations.data?.cities.find(
          (dd) => dd.cityId === d.partnerId,
        );
        return { ...d, city };
      })
      .filter(
        (d) =>
          d.partnerId !== currentCity.city?.cityId &&
          d.city?.population &&
          d.city.population > minPop &&
          d.city.population < maxPop,
      )
      .slice(0, 3)
      .map((d) => {
        const country = globalLocations.data?.countries.find(
          (cntry) => cntry.countryId === d.city?.countryId + "",
        );
        const countryText = country ? ", " + country.code : "";
        return (
          <ListItem key={d.city?.cityId}>
            {d.city?.name?.toUpperCase()}
            {countryText.toUpperCase()}
          </ListItem>
        );
      });
    topCitiesElement = <>{topLocations}</>;
  } else {
    topCitiesElement = null;
  }
  return (
    <div>
      <TitleBase>
        <Icon src={TopCitiesSVG} />
        <div>{getString("city-overview-top-similar-cities")}</div>
        <YearText>
          {defaultYear}
          <Tooltip
            explanation={getString("city-overview-top-similar-cities-tooltip")}
          />
        </YearText>
      </TitleBase>
      <ValueBase>{topCitiesElement}</ValueBase>
    </div>
  );
};

export default TopCities;
