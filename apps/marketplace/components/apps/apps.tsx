import Link from "next/link";

/* eslint-disable-next-line */
export interface AppsProps {
  Link: string;
  Title: string;
  Description: string;
  Icon: string
}

export function Apps(props: AppsProps) {
  return (
    <div
      className="bg-gray-50 rounded overflow-hidden shadow-xl m-4 px-4 rounded-xl flex-none w-3/4 md:w-2/5 lg:w-1/6 md:h-1/4 lg:h-1/2">
      <Link href={props.Link}>
        <div className="flex">
          <div className="w-20 md:w-50 shrink-0">
            <img
              className="object-cover my-4 bg-gray-50"
              src={props.Icon}
              alt="Modern building architecture"
            />
          </div>
          <div className="m-4">
            <div className="uppercase tracking-wide text-md text-indigo-500 font-semibold">
              {props.Title}
            </div>
            <div
              className="block mt-1 text-sm leading-tight font-small text-black hover:underline"
            >
              {props.Description}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Apps;
