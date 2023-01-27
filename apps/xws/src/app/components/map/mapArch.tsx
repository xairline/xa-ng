import React from 'react';
import DeckGL from '@deck.gl/react/typed';
import {ArcLayer} from '@deck.gl/layers/typed';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useObserver} from 'mobx-react-lite';
import {inFlowColors, outFlowColors} from '../../../store/flight-log';
// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoieGFpcmxpbmUiLCJhIjoiY2xkOGE0eHY2MDExZzNvbnh6NG0zYjdkeSJ9.DBehpQbCB9Sjws8OH7I69A';

export interface MapArchProps {
  data: any;
}

// DeckGL react component
export function MapArch(props: MapArchProps) {
  function getTooltip({object}: any) {
    if (!object || !object.item) {
      return null;
    }

    const info = object.item;
    return `${info.AircraftDisplayName}
    DEP: ${info.DepartureFlightInfo?.AirportId} - ${info.DepartureFlightInfo?.AirportName}
    ARR: ${info.ArrivalFlightInfo?.AirportId} - ${info.ArrivalFlightInfo?.AirportName}`;
  }

  const layers = [
    new ArcLayer({
      id: 'arc',
      data: props.data.arch,
      getSourcePosition: (d) => d.source,
      getTargetPosition: (d) => d.target,
      getSourceColor: (d) =>
        (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile] as any,
      getTargetColor: (d) =>
        (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile] as any,
      getWidth: 3,
    }),
  ];
  const INITIAL_VIEW_STATE = {
    longitude: props.data?.arch[0]?.source[0] || -75.6692,
    latitude: props.data?.arch[0]?.source[1] || 45.3192,
    zoom: 5,
    pitch: 53,
    bearing: 0,
  };
  return useObserver(() => (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      height={'100%'}
      getTooltip={getTooltip}
    >
      <Map
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
      ></Map>
    </DeckGL>
  ));
}

export default MapArch;
