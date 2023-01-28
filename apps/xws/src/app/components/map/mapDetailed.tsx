import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react/typed';
import {PathLayer} from '@deck.gl/layers/typed';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useObserver} from 'mobx-react-lite';
import {TripsLayer} from '@deck.gl/geo-layers/typed';
// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoieGFpcmxpbmUiLCJhIjoiY2xkOGE0eHY2MDExZzNvbnh6NG0zYjdkeSJ9.DBehpQbCB9Sjws8OH7I69A';

export interface MapArchProps {
  data: any;
}

// DeckGL react component
export function MapDetailed(props: MapArchProps) {
  const [time, setTime] = useState(0);
  const [animation]: any = useState({});
  const animationSpeed = 50,
    loopLength = 3600 * 5,
    trailLength = 100;
  const animate = () => {
    setTime((t) => (t + animationSpeed) % loopLength);
    animation.id = window.requestAnimationFrame(animate);
  };
  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation]);

  function getTooltip({object}: any) {
    if (!object || !object.item) {
      return null;
    }

    const info = object.item;
    return `${info.AircraftDisplayName}
    DEP: ${info.DepartureFlightInfo?.AirportId} - ${info.DepartureFlightInfo?.AirportName}
    ARR: ${info.ArrivalFlightInfo?.AirportId} - ${info.ArrivalFlightInfo?.AirportName}`;
  }

  const INITIAL_VIEW_STATE = {
    longitude: props?.data?.paths[0]?.path[0][0] || -75.6692,
    latitude: props?.data?.paths[0]?.path[0][1] || 45.3192,
    zoom: 14,
    pitch: 53,
    bearing: -10,
  };

  const layers = [
    new PathLayer({
      id: 'path-layer-helper',
      data: props.data.pathsExt,
      pickable: true,
      widthScale: 20,
      widthMinPixels: 1,
      widthMaxPixels: 2,
      getPath: (d: any) => d.path,
      getColor: (d: any) => d.color,
      billboard: true,
      getWidth: (d) => 2,
    }),
    new PathLayer({
      id: 'path-layer',
      data: props.data.paths,
      pickable: true,
      widthScale: 20,
      widthMinPixels: 2,
      widthMaxPixels: 2,
      getPath: (d: any) => d.path,
      getColor: (d: any) => d.color,
      getWidth: (d) => 2,
    }),
    new TripsLayer({
      id: 'trips-layer',
      data: props.data.paths,
      getPath: (d) => d.path,
      getTimestamps: (d) => d.timestamps,
      getColor: (d: any) => d.color,
      opacity: 0.3,
      widthMinPixels: 6,
      rounded: true,
      fadeTrail: false,
      trailLength,
      currentTime: time,
      shadowEnabled: true,
    }),
  ];
  return useObserver(() => (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      height={'100%'}
      getTooltip={getTooltip}
    >
      <Map
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
      ></Map>
    </DeckGL>
  ));
}

export default MapDetailed;
