import React from 'react';
import { ActionIcon, TextInput } from '@mantine/core';
import { ChevronDown, ChevronUp } from 'lucide-react';

type DateData = {
  time: Date;
  interpolate: boolean;
  delta: number;
  relative: boolean;
};

type DateComponentProps = {
  date: Date | string;
  onChange: (data: DateData) => void;
};

const DateComponent: React.FC<DateComponentProps> = ({ date, onChange }) => {
  if (date === undefined) {
    return null;
  }

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
      relative: true
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
    'Dec'
  ];
  function zeroPad(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  return (
    <div className={'flex flex-row items-center justify-center'}>
      {['year', 'month', 'day', 'hours', 'minutes', 'seconds'].map((part, index) => (
        <div
          key={index}
          style={{ margin: '0px' }}
          className={'flex flex-col items-center justify-center gap-1 px-1'}
        >
          <ActionIcon
            variant={'subtle'}
            color={'white'}
            className={'h-4'}
            size={'xs'}
            onClick={() => adjustDatePart(part, 1)}
          >
            <ChevronUp
              className={
                'h-6 w-6 cursor-pointer transition-all hover:scale-110 hover:bg-[]'
              }
            />
          </ActionIcon>
          <TextInput
            w={40}
            variant={'unstyled'}
            styles={{
              input: {
                height: 20,
                minHeight: 20,
                padding: 0,
                textAlign: 'center',
                fontSize: 14
              }
            }}
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
          <ActionIcon
            variant={'subtle'}
            color={'white'}
            size={'xs'}
            className={'h-4'}
            onClick={() => adjustDatePart(part, -1)}
          >
            <ChevronDown
              className={'h-6 w-6 cursor-pointer transition-all hover:scale-110'}
            />
          </ActionIcon>
        </div>
      ))}
    </div>
  );
};

export default DateComponent;
