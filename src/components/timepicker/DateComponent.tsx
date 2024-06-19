import React from 'react';
import IconButton from '../inputs/IconButton';
// import { FiCamera } from 'react-icons/fi';
import { MdOutlineExpandLess, MdOutlineExpandMore } from 'react-icons/md';

type DateData = {
  time: Date;
  interpolate: boolean;
  delta: number;
  relative: boolean;
};

type DateComponentProps = {
  date: Date;
  onChange: (data: DateData) => void;
};

const DateComponent: React.FC<DateComponentProps> = ({ date, onChange }) => {
  //   console.log(date);

  const dateObj = new Date(date);

  const adjustDatePart = (part: string, delta: number) => {
    const newDate = new Date(date);
    switch (part) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + delta);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + delta);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + delta);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + delta);
        break;
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + delta);
        break;
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + delta);
        break;
      default:
        return;
    }
    onChange({
      time: newDate,
      interpolate: true,
      delta: (newDate.getTime() - new Date(date).getTime()) / 1000,
      relative: true,
    });
  };

  const monthAbbreviations = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  function zeroPad(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  return (
    <div className="flex flex-row items-center justify-center">
      {['year', 'month', 'day', 'hours', 'minutes', 'seconds'].map(
        (part, index) => (
          <div
            key={index}
            style={{ margin: '0 10px' }}
            className="flex flex-col items-center justify-center gap-1 "
          >
            <IconButton
              icon={MdOutlineExpandLess}
              size="6"
              onClick={() => adjustDatePart(part, 1)}
            />
            <input
              type="text"
              className="flex w-[50px] text-center"
              value={
                part === 'month'
                  ? monthAbbreviations[dateObj.getUTCMonth()]
                  : part === 'year'
                    ? dateObj.getUTCFullYear()
                    : part === 'day'
                      ? zeroPad(dateObj.getUTCDate())
                      : part === 'hours'
                        ? zeroPad(dateObj.getUTCHours())
                        : part === 'minutes'
                          ? dateObj.getUTCMinutes()
                          : zeroPad(dateObj.getUTCSeconds())
              }
              readOnly
            />
            <IconButton
              icon={MdOutlineExpandMore}
              size="6"
              onClick={() => adjustDatePart(part, -1)}
            />
          </div>
        ),
      )}
    </div>
  );
};

export default DateComponent;
