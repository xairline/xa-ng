/* eslint-disable-next-line */
import {useEffect, useState} from 'react';
import 'react-tailwind-table/dist/index.css';
import Table from 'react-tailwind-table';

export interface FlightLogProps {
}

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export function FlightLog(props: FlightLogProps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  const size = useWindowSize();

  const columns = [
    {
      field: 'ID',
      use: 'ID',
      use_in_display: false,
    },
    {
      field: 'CreatedAt',
      use: 'Date',
    },
    {
      field: 'DepartureFlightInfo.AirportId',
      use: 'Departure',
      use_in_search: true,
    },
    {
      field: 'DepartureFlightInfo.AirportName',
      use: 'Departure Airport',
      use_in_search: true,
      use_in_display: size.width > 768 ? true : false,
    },
    {
      field: 'ArrivalFlightInfo.AirportId',
      use: 'Arrival',
      use_in_search: true,
    },
    {
      field: 'ArrivalFlightInfo.AirportName',
      use: 'Arrival Airport',
      use_in_search: true,
      use_in_display: size.width > 768 ? true : false,
    },
    {
      field: 'AircraftICAO',
      use: 'Aircraft',
      use_in_search: true,
    },
    {
      field: 'AircraftDisplayName',
      use: 'Aircraft Name',
      use_in_search: true,
      use_in_display: size.width > 1024 ? true : false,
    },
  ];

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`/apis/flight-logs`);
        if (!response.ok) {
          throw new Error(
            `This is an HTTP error: The status is ${response.status}`
          );
        }
        let actualData = await response.json();
        setData(actualData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    getData().catch((error) => {
      console.log(error);
    });
  }, []);

  let rowcheck = (row, column, display_value) => {

    if (column.field === "CreatedAt") {
      let time = new Date(display_value)
      return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`
    }

    return display_value
  }

  return (
    <div className="bg-slate-200 w-full overflow-hidden">
      <Table
        columns={columns}
        rows={data || []}
        per_page={size.width < 768 ? 9 : size.width < 1024 ? 14 : 10}
        row_render={rowcheck}
        styling={{
          base_bg_color: 'bg-slate-200',
          base_text_color: 'text-indigo-600',
          top: {
            elements: {
              export: size.width < 768 ? 'invisible h-0 w-0 mt-0' : undefined,
            },
          },
          table_head: {
            // table_data: 'text-indigo-600',
          },
          // table_body: {
          //   main: 'h-full',
          //   table_row: "text-yellow-900",
          //   table_data: "text-base"
          // },
          // footer: {
          //   main: "bg-yellow-700",
          //   statistics: {
          //     main: "bg-white text-green-900",
          //     bold_numbers: "text-yellow-800 font-thin"
          //   },
          //   page_numbers: "bg-red-600 text-white"
          // },
          footer: {
            // main: string, // row holding the footer
            // statistics: { // those shiny numbers like **Showing 1 to 5 of 58 entries**
            //   main: string,
            //   bold_numbers: string //The numbers like 1, 5, 58
            // },
            page_numbers: 'text-indigo-600', //the number boxes
          },
        }}
      />
    </div>
  );
}

export default FlightLog;
