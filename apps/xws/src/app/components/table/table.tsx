import {ColumnsType, TableProps} from 'antd/es/table';
import {Table, Tooltip} from 'antd';
import {TableDataSet} from '../../../store/flight-log';
import {ModelsFlightInfo} from '../../../store/Api';
import {Link} from 'react-router-dom';

/* eslint-disable-next-line */
export interface TableViewProps {
  dataSet: TableDataSet;
  height: string;
}

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

export function TableView(props: TableViewProps) {
  const columns: ColumnsType<any> = [
    {
      title: 'Date',
      dataIndex: 'date',
      filters: props.dataSet.filters['departure'] || null,
      filterMode: 'menu',
      fixed: 'left',
      width: '100px',
      render: (record: any) => (
        <Tooltip placement="topLeft" title={record.date}>
          {record.slice(0, 10)}
        </Tooltip>
      ),
    },
    {
      title: 'Departure',
      dataIndex: 'departure',
      filters: props.dataSet.filters['departure'] || null,
      filterMode: 'menu',
      filterSearch: true,
      //onFilter: (value: string, record) => record.departure.startsWith(value),
      // fixed: 'left',
      width: '90px',
      render: (record: ModelsFlightInfo) => (
        <Tooltip placement="topLeft" title={record.airportName}>
          {record.airportId}
        </Tooltip>
      ),
    },
    {
      title: 'Arrival',
      dataIndex: 'arrival',
      filters: props.dataSet.filters['arrival'] || null,
      filterMode: 'menu',
      filterSearch: true,
      //onFilter: (value: string, record) => record.arrival.startsWith(value),
      // fixed: 'left',
      width: '80px',
      render: (record: ModelsFlightInfo) => (
        <Tooltip placement="topLeft" title={record.airportName}>
          {record.airportId}
        </Tooltip>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      //onFilter: (value: string, record) => record.arrival.startsWith(value),
      // width: '20%',
      // fixed: 'left',
      width: '100px',
      render: (record: any) =>
        record == '-' ? (
          '-'
        ) : (
          <Tooltip placement="topLeft" title={'format: HH:mm'}>
            {Math.floor(record / 3600) < 10 ? '0' : ''}
            {Math.floor(record / 3600)}:{Math.floor((record % 3600) / 60)} h
          </Tooltip>
        ),
      /*
      !flightStatus.departureFlightInfo?.time
            ? '-'
            : Math.floor(
              (flightStatus.arrivalFlightInfo.time -
                flightStatus.departureFlightInfo?.time || 0) / 3600
            ) +
            ':' +
            Math.floor(
              ((flightStatus.arrivalFlightInfo.time -
                  flightStatus.departureFlightInfo?.time || 0) %
                3600) /
              60
            ) + " h"
      * */
    },
    {
      title: '',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: (record: any) => (
        <Link to={`/flight-logs/${record.key}`}>Details</Link>
      ),
    },
  ];

  const onChange: TableProps<DataType>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log('params', pagination, filters, sorter, extra);
  };
  return (
    <Table
      size={'small'}
      columns={columns}
      dataSource={props.dataSet.data}
      onChange={onChange}
      scroll={{y: props.height, x: '400px'}}
    />
  );
}

export default TableView;