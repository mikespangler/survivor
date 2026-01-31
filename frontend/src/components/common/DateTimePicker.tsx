'use client';

import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Input, useColorMode } from '@chakra-ui/react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  dateFormat?: string;
  placeholderText?: string;
  isDisabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const CustomInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  return <Input {...props} ref={ref} />;
});

CustomInput.displayName = 'CustomInput';

export function DateTimePicker({
  selected,
  onChange,
  showTimeSelect = false,
  dateFormat = showTimeSelect ? 'MMM d, yyyy h:mm aa' : 'MMM d, yyyy',
  placeholderText,
  isDisabled = false,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const { colorMode } = useColorMode();

  return (
    <div className={`date-picker-wrapper ${colorMode === 'dark' ? 'dark-theme' : ''}`}>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        customInput={<CustomInput />}
        disabled={isDisabled}
        minDate={minDate}
        maxDate={maxDate}
        timeIntervals={15}
        popperPlacement="bottom-start"
      />
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }

        .react-datepicker {
          font-family: inherit;
          border: 1px solid var(--chakra-colors-chakra-border-color);
          border-radius: var(--chakra-radii-md);
          box-shadow: var(--chakra-shadows-lg);
        }

        .date-picker-wrapper.dark-theme .react-datepicker {
          background-color: var(--chakra-colors-gray-800);
          color: var(--chakra-colors-white);
        }

        .react-datepicker__header {
          background-color: var(--chakra-colors-gray-50);
          border-bottom: 1px solid var(--chakra-colors-chakra-border-color);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__header {
          background-color: var(--chakra-colors-gray-700);
        }

        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: var(--chakra-colors-gray-900);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__current-month,
        .date-picker-wrapper.dark-theme .react-datepicker__day-name {
          color: var(--chakra-colors-white);
        }

        .react-datepicker__day {
          color: var(--chakra-colors-gray-700);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__day {
          color: var(--chakra-colors-gray-200);
        }

        .react-datepicker__day:hover {
          background-color: var(--chakra-colors-orange-50);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__day:hover {
          background-color: var(--chakra-colors-orange-900);
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: var(--chakra-colors-orange-500) !important;
          color: white !important;
        }

        .react-datepicker__day--disabled {
          color: var(--chakra-colors-gray-400);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__day--disabled {
          color: var(--chakra-colors-gray-600);
        }

        .react-datepicker__time-container {
          border-left: 1px solid var(--chakra-colors-chakra-border-color);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__time-container {
          background-color: var(--chakra-colors-gray-800);
        }

        .react-datepicker__time-list-item {
          color: var(--chakra-colors-gray-700);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__time-list-item {
          color: var(--chakra-colors-gray-200);
        }

        .react-datepicker__time-list-item:hover {
          background-color: var(--chakra-colors-orange-50);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__time-list-item:hover {
          background-color: var(--chakra-colors-orange-900);
        }

        .react-datepicker__time-list-item--selected {
          background-color: var(--chakra-colors-orange-500) !important;
          color: white !important;
        }

        .react-datepicker__navigation-icon::before {
          border-color: var(--chakra-colors-gray-600);
        }

        .date-picker-wrapper.dark-theme .react-datepicker__navigation-icon::before {
          border-color: var(--chakra-colors-gray-300);
        }
      `}</style>
    </div>
  );
}
