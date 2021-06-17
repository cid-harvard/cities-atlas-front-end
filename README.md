# The Metroverse

## by the Growth Lab at Harvard's Center for International Development

> This package is part of Harvard Growth Lab’s portfolio of software packages, digital products and interactive data visualizations. To browse our entire portfolio, please visit The Viz Hub at [growthlab.app](https://growthlab.app/). To learn more about our research, please visit [Harvard Growth Lab’s](https://growthlab.cid.harvard.edu/) home page.

License - [Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/) © [The President and Fellows of Harvard College](https://www.harvard.edu/)


## Table of Contents
- [Getting Started](#getting-started)
- [Primary Technologies](#primary-technologies)
- [Deployments](#deployments)
- [Utilities and Global Styling](#utilities-and-global-styling)
    - [Utility Functions](#utility-functions)
    - [Global Styling](#global-styling)
- [Custom NPM packages](#custom-npm-packages)
    - [react-canvas-treemap](#react-canvas-treemap)
    - [react-city-space-mapbox](#react-city-space-mapbox)
    - [react-comparison-bar-chart](#react-comparison-bar-chart)
    - [react-fast-charts](#react-fast-charts)
    - [react-panel-search](#react-panel-search)
    - [react-pswot-plot](#react-pswot-plot)
    - [react-vertical-bar-chart](#react-vertical-bar-chart)
- [App Sections](#app-sections)
    - [Landing Page](#landing-page)
    - [Informational Pages](#informational-pages)
    - [City Profiles](#city-profiles)


<a name="getting-started"/>

## Getting started

Once this repo has been cloned, navigate to the directory via command line and run

`npm install`

This will install all of your dependencies.

Next, at the root directory create a `.env` file. Within the `.env` file, include the following contents (with the `XXXX` replaced by the corresponding variable values):

```
REACT_APP_API_URL=XXXX
REACT_APP_MAPBOX_ACCESS_TOKEN=XXXX
```

You can now run the project locally with

`npm start`

You should now be able to see the project running at localhost:3000

As you work on projects on this repo, make sure to run 

`npm run lint:fix`

before pushing any code to make sure it keeps consistent standards.

<a name="primary-technologies"/>

## Primary Technologies

The Metroverse front-end is built using the following core technologies. Please familiarize yourself with them to have a better understanding of the codebase.

- **[TypeScript](https://www.npmjs.com/package/typescript/v/3.7.2), v3.7.2** - the core language of the project
- **[React](https://reactjs.org/docs/getting-started.html), v16.13.1** - the core framework of the project
- **[Styled Components](https://styled-components.com/docs), v5.1.1** - the primary way of implementing CSS properties in the project
- **[GraphQL](https://www.apollographql.com/docs/react/), v15.3.0** - the primary way of interacting with the back-end API
- **[D3](https://github.com/d3/d3/wiki), v5.16.0** - used for an number of core visualizations and client-side data processing
- **[Fluent](https://projectfluent.org/), v0.13.0** - the primary way of integrating text copy into the front-end
- **[Mapbox](https://docs.mapbox.com/mapbox-gl-js/api/), v1.12.0** - the backbone for all geographical maps in the project

<a name="deployments"/>

## Deployments

Deployments to staging environments as well as production environments are conducted using the [cid-harvard/cities-playbooks](https://github.com/cid-harvard/cities-playbooks) repo. Please see the [cid-harvard/cities-playbooks](https://github.com/cid-harvard/cities-playbooks) repo for all documentation regarding deployments.

<a name="utilities-and-global-styling"/>

## Utilities and Global Styling

There are a number of utility functions, global variables, and global components available for use throughout the project. See the following sections on a brief overview of what there is and where you can find them.

<a name="utility-functions"/>

### Utility Functions

There are two top level sources for utility functions. The first is found at `src/Utils.ts` which includes one-off functions that are used throughout the app as well as global variables such as the default year currently in use for API calls. Please familiarize yourself with the functions and values stored in this file.

The other source of global utility functions is within the folder `src/utilities`. This folder is where more complex utility patterns live. An example within here is the `rapidTooltip.ts`. This file is used for creating consistent logic and styling of tooltips in data visualizations that handle their own state outside of React. This pattern is most commonly seen in D3 based visualizations that are passed a `ref` object to render tooltips into. This optimizes these tooltips for performance as they are able to respond directly to D3's internal state management instead of having to also pass through React's state management.

Additional `Util.ts` files can be found throughout the app within various directories. They generally house logic that are utilized throughout that specific component, hook, or page. It is important to familiarize yourself with the Util file associated with the component you are working on as it may already include some of the logic you are looking to implement.

<a name="global-styling"/>

### Global Styling

The Metroverse uses the [`styled-components`](https://styled-components.com/docs) library to do most of it's styling work. While the majority of styles are defined at the component level (as is the advantage of using a CSS-in-JS approach), there are some styles defined at a global level as well as numerous style variables and basic components that are easily available throughout the app.

Within the `src/styling` directory you can find the `GlobalGrid.ts` and `GlobalStyles.tsx` files. These respectively control the global layout and global styling found throughout the app.

The other main file found in this directory is `styleUtils.ts`. This file contains all of the global color, font, and sizing variables as well as many basic components like buttons, titles, and labels. Please familiarize yourself with the contents of this file to prevent code duplication and speed up the development process.

<a name="custom-npm-packages"/>

## Custom NPM packages

The Metroverse utilizes a number of custom NPM packages that have been specifically developed for either the Metroverse itself or other Harvard Growth Lab Projects. Each of these modules has been designed to be reusable on other projects as well by making them as project agnostic as possible. See below for more information on each of the packages and where to find further documentation for them.

<a name="react-canvas-treemap"/>

### react-canvas-treemap

The [`react-canvas-treemap`](https://www.npmjs.com/package/react-canvas-treemap) is a canvas based treemap originally designed for the [Atlas of International Complexity](https://atlas.cid.harvard.edu/) and later ported into its own npm module for use in other projects such as the Metroverse. Please refer to its own [GitHub repo](https://www.npmjs.com/package/react-canvas-treemap) for documentation or for any development changes that need to be made to this visualization.

<a name="react-city-space-mapbox"/>

### react-city-space-mapbox

The [`react-city-space-mapbox`](https://www.npmjs.com/package/react-city-space-mapbox) is a dynamic Mapbox-based visualization that allows toggling of the Growth Lab "City Space" and the true geographic centers of each city. Please refer to its own [GitHub repo](https://www.npmjs.com/package/react-city-space-mapbox) for documentation or for any development changes that need to be made to this visualization.

<a name="react-comparison-bar-chart"/>

### react-comparison-bar-chart

The [`react-comparison-bar-chart`](https://www.npmjs.com/package/react-comparison-bar-chart) is a vertical bar chart that allows the positive/negative comparison between two sets of data of the same categories. Please refer to its own [GitHub repo](https://www.npmjs.com/package/react-comparison-bar-chart) for documentation or for any development changes that need to be made to this visualization.

<a name="react-fast-charts"/>

### react-fast-charts

The [`react-fast-charts`](https://www.npmjs.com/package/react-fast-charts) package is a collection of React-D3 visualizations used throughout the Growth Lab's projects. Please refer to its own [GitHub repo](https://www.npmjs.com/package/react-fast-charts) for documentation or for any development changes that need to be made to its visualizations.

<a name="react-panel-search"/>

### react-panel-search

The [`react-panel-search`](https://www.npmjs.com/package/react-panel-search) is the package that contains the logic for the nested search bars found throughout the Metroverse. Please refer to its own [GitHub repo](https://www.npmjs.com/package/react-panel-search) for documentation or for any development changes that need to be made to this component.

<a name="react-pswot-plot"/>

### react-pswot-plot

The [`react-pswot-plot`](https://www.npmjs.com/package/react-pswot-plot) is a traditional SWOT chart but with the additional of a "Potential" quadrant in the form of Beeswarm plot. It displays all of the data where the x-axis value is equal to zero. Please refer to its own [GitHub repo](https://www.npmjs.com/package/react-pswot-plot) for documentation or for any development changes that need to be made to this visualization.

<a name="react-vertical-bar-chart"/>

### react-vertical-bar-chart

The [`react-vertical-bar-chart`](https://www.npmjs.com/package/react-vertical-bar-chart) is a scroll-able bar chart that allows for the visual comparison of a large number of categories without overloading the screen. Please refer to its own [GitHub repo](https://www.npmjs.com/package/react-vertical-bar-chart) for documentation or for any development changes that need to be made to this visualization.

<a name="app-sections"/>

## App Sections

The Metroverse web application is broken up into three distinct sections. Each section is made up of reusable components and logic that often crosses between sections. See below for more information on each section.

<a name="landing-page"/>

### Landing Page

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat.

<a name="informational-pages"/>

### Informational Pages

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat.

<a name="city-profiles"/>

### City Profiles

Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat.
