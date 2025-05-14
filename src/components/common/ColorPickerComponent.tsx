import React from 'react';
import { ColorPicker, IColor, useColor } from 'react-color-palette';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import 'react-color-palette/css'; // Ensure CSS is imported

interface ColorPickerComponentProps {
  color: string; // Hex color string
  setColor: (color: string) => void; // Function to set color as a string
}

const ColorPickerComponent: React.FC<ColorPickerComponentProps> = ({
  color,
  setColor
}) => {
  const [colorState, setColorState] = useColor(color); // Use useColor hook

  const handleColorChange = (newColor: IColor) => {
    setColor(newColor.hex); // Call the passed setColor function with the hex string
    setColorState(newColor); // Update the internal color state
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div
          className={"h-16 w-16 rounded-full"}
          style={{ backgroundColor: colorState.hex }}
        ></div>
      </PopoverTrigger>
      <PopoverContent>
        <ColorPicker
          hideInput={['hsv']}
          color={colorState}
          onChange={handleColorChange} // Handle color change
        />
      </PopoverContent>
    </Popover>
  );
};

export default ColorPickerComponent;
