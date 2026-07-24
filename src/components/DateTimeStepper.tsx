import { ActionIcon, Group, Stack, TextInput } from '@mantine/core';

import { ChevronDownIcon, ChevronUpIcon } from '@/icons/icons';

type DateData = {
  time: Date;
  interpolate: boolean;
  delta: number;
  relative: boolean;
};

interface DateTimeStepperProps {
  date: Date | string;
  onChange: (data: DateData) => void;
}

const dateParts = ['year', 'month', 'day', 'hours', 'minutes', 'seconds'] as const;

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

function zeroPad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function formatDatePart(part: (typeof dateParts)[number], date: Date): string | number {
  switch (part) {
    case 'month':
      return monthAbbreviations[date.getUTCMonth()];
    case 'year':
      return date.getUTCFullYear();
    case 'day':
      return zeroPad(date.getUTCDate());
    case 'hours':
      return zeroPad(date.getUTCHours());
    case 'minutes':
      return date.getUTCMinutes();
    default:
      return zeroPad(date.getUTCSeconds());
  }
}

export function DateTimeStepper({ date, onChange }: DateTimeStepperProps) {
  if (date === undefined) {
    return null;
  }

  const dateObj = new Date(date);

  function adjustDatePart(part: (typeof dateParts)[number], delta: number) {
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
  }

  return (
    <Group justify={'center'} gap={0}>
      {dateParts.map((part) => (
        <Stack key={part} align={'center'} gap={4} px={4}>
          <ActionIcon
            variant={'subtle'}
            color={'white'}
            size={'xs'}
            onClick={() => adjustDatePart(part, 1)}
          >
            <ChevronUpIcon size={20} />
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
            value={formatDatePart(part, dateObj)}
            readOnly
          />
          <ActionIcon
            variant={'subtle'}
            color={'white'}
            size={'xs'}
            onClick={() => adjustDatePart(part, -1)}
          >
            <ChevronDownIcon size={20} />
          </ActionIcon>
        </Stack>
      ))}
    </Group>
  );
}
