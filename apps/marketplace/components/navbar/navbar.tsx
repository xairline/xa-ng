import nightwind from 'nightwind/helper';
import {MoonIcon, SunIcon} from '@heroicons/react/solid';
import {useTheme} from 'next-themes';

/* eslint-disable-next-line */
export interface NavbarProps {
}

export function Navbar(props: NavbarProps) {
  const {systemTheme, theme, setTheme} = useTheme();

  const renderThemeChanger = () => {
    const currentTheme = theme === 'system' ? systemTheme : theme;

    if (currentTheme === 'dark') {
      return (
        <SunIcon
          className="w-10 h-10 text-yellow-500 "
          role="button"
          onClick={() => {
            nightwind.enable(false);
            setTheme('light');
          }}
        />
      );
    } else {
      return (
        <MoonIcon
          className="text-gray-900 "
          role="button"
          onClick={() => {
            nightwind.enable(true);
            setTheme('dark');
          }}
        />
      );
    }
  };
  return (
    <div className="h-2/12 md:h-[12%] lg:h-[16%] bg-gray-50 grid grid-cols-3 gap-4 py-2 md:py-4 lg:py-8">
      <div
        className="flex justify-center col-span-2">
        <h2 className="text-2sm font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-4xl">
          <span className="block">X Web Stack?</span>
          <span className="block text-indigo-600">
            Start your free trial today.
          </span>
        </h2>
      </div>
      <div
        className="flex justify-center ">
        <div className="rounded-md shadow w-10 h-10 ">
          {renderThemeChanger()}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
