import {ReactNode} from 'react';
import CountUp from 'react-countup';

export const formatter = (value: any): ReactNode => (
  <CountUp end={value} separator=","/>
);
