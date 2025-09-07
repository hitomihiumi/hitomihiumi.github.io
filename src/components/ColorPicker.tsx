'use client';

import { useState, useEffect, useRef } from 'react';

interface ColorPickerProps {
  value: string;
  defaultValue?: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ value, defaultValue, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb' | 'hsl' | 'none'>('hex');
  const [inputValue, setInputValue] = useState(value || defaultValue || '#000000');
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [hslValues, setHslValues] = useState({ h: 0, s: 0, l: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueBarRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value);
      if (value.startsWith('#')) {
        setColorFormat('hex');
        const rgb = hexToRgb(value);
        if (rgb) {
          setRgbValues(rgb);
          setHslValues(rgbToHsl(rgb.r, rgb.g, rgb.b));
        }
      }
    } else if (defaultValue && !value) {
      setInputValue(defaultValue);
      if (defaultValue.startsWith('#')) {
        setColorFormat('hex');
        const rgb = hexToRgb(defaultValue);
        if (rgb) {
          setRgbValues(rgb);
          setHslValues(rgbToHsl(rgb.r, rgb.g, rgb.b));
        }
      }
    }
  }, [value, defaultValue]);

  useEffect(() => {
    if (isOpen) {
      drawColorPalette();
      drawHueBar();
    }
  }, [isOpen, hslValues.h]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const drawColorPalette = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Создаем градиент от насыщенного цвета (справа) к белому (слева)
    const horizontalGradient = ctx.createLinearGradient(0, 0, width, 0);
    horizontalGradient.addColorStop(0, 'white');
    horizontalGradient.addColorStop(1, `hsl(${hslValues.h}, 100%, 50%)`);

    ctx.fillStyle = horizontalGradient;
    ctx.fillRect(0, 0, width, height);

    // Создаем градиент от прозрачного (сверху) к черному (снизу)
    const verticalGradient = ctx.createLinearGradient(0, 0, 0, height);
    verticalGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    verticalGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = verticalGradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawHueBar = () => {
    const canvas = hueBarRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);

    // Создаем радужный градиент
    for (let i = 0; i <= 360; i += 60) {
      gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const handleColorChange = (newColor: string) => {
    setInputValue(newColor);
    onChange(newColor);

    // Если выбран 'none', сбрасываем формат на 'hex'
    if (colorFormat === 'none' && newColor) {
      setColorFormat('hex');
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const saturation = (x / canvas.width) * 100;
    const lightness = 100 - (y / canvas.height) * 100;

    const newHsl = { ...hslValues, s: Math.round(saturation), l: Math.round(lightness) };
    setHslValues(newHsl);

    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgbValues(rgb);

    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    handleColorChange(hex);
  };

  const handleHueBarClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueBarRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = event.clientY - rect.top;

    const hue = (y / canvas.height) * 360;

    const newHsl = { ...hslValues, h: Math.round(hue) };
    setHslValues(newHsl);

    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgbValues(rgb);

    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    handleColorChange(hex);
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgbValues, [component]: value };
    setRgbValues(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    handleColorChange(hex);
    setHslValues(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (component: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...hslValues, [component]: value };
    setHslValues(newHsl);
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgbValues(rgb);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    handleColorChange(hex);
  };

  const handleManualInput = (input: string) => {
    setInputValue(input);

    // Если поле пустое и формат 'none', передаем пустую строку
    if (!input.trim() && colorFormat === 'none') {
      onChange('');
      return;
    }

    // Validate and convert input
    if (input.startsWith('#') && input.length === 7) {
      handleColorChange(input);
    } else if (input.startsWith('rgb(')) {
      const match = input.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const hex = rgbToHex(r, g, b);
        handleColorChange(hex);
      }
    } else if (input.startsWith('hsl(')) {
      const match = input.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        handleColorChange(hex);
      }
    }
  };

  const getCurrentFormatValue = () => {
    switch (colorFormat) {
      case 'hex':
        return inputValue || '#000000';
      case 'rgb':
        return `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`;
      case 'hsl':
        return `hsl(${hslValues.h}, ${hslValues.s}%, ${hslValues.l}%)`;
      case 'none':
        return '';
      default:
        return inputValue || '#000000';
    }
  };

  const handleFormatChange = (newFormat: 'hex' | 'rgb' | 'hsl' | 'none') => {
    setColorFormat(newFormat);

    if (newFormat === 'none') {
      setInputValue('');
      onChange('');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        {/* Color preview */}
        <div
          className="w-8 h-8 border border-gray-600 rounded cursor-pointer flex-shrink-0 relative"
          style={{ backgroundColor: inputValue || '#000000' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="absolute inset-0 rounded border-2 border-white/20"></div>
        </div>

        {/* Manual input */}
        <input
          type="text"
          value={getCurrentFormatValue()}
          onChange={(e) => handleManualInput(e.target.value)}
          className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter color value"
        />

        {/* Format selector */}
        <select
          value={colorFormat}
          onChange={(e) => handleFormatChange(e.target.value as 'hex' | 'rgb' | 'hsl' | 'none')}
          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* Advanced Photoshop-style picker */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-15 w-96">
          <div className="space-y-4">
            {/* Main color picker area */}
            <div className="flex space-x-3">
              {/* Color square */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={200}
                  height={200}
                  className="cursor-crosshair border border-gray-600 rounded"
                  onClick={handleCanvasClick}
                />
                {/* Color picker indicator */}
                <div
                  className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
                  style={{
                    left: `${(hslValues.s / 100) * 200 - 6}px`,
                    top: `${200 - (hslValues.l / 100) * 200 - 6}px`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
                  }}
                />
              </div>

              {/* Hue bar */}
              <div className="relative">
                <canvas
                  ref={hueBarRef}
                  width={20}
                  height={200}
                  className="cursor-pointer border border-gray-600 rounded"
                  onClick={handleHueBarClick}
                />
                {/* Hue indicator */}
                <div
                  className="absolute w-full h-1 border border-white pointer-events-none"
                  style={{
                    top: `${(hslValues.h / 360) * 200 - 2}px`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
                  }}
                />
              </div>
            </div>

            {/* Current color display */}
            <div className="flex items-center space-x-3">
              <div className="text-white text-sm font-medium">Current:</div>
              <div
                className="w-12 h-8 border border-gray-600 rounded"
                style={{ backgroundColor: inputValue || '#000000' }}
              />
              <div className="text-gray-300 text-sm font-mono">{getCurrentFormatValue()}</div>
            </div>

            {/* RGB Sliders */}
            <div>
              <h4 className="text-white font-medium mb-2">RGB</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400 w-6 text-sm font-medium">R</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #000000, #ff0000)`
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                    className="w-12 px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 w-6 text-sm font-medium">G</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #000000, #00ff00)`
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                    className="w-12 px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 w-6 text-sm font-medium">B</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #000000, #0000ff)`
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                    className="w-12 px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* HSL Sliders */}
            <div>
              <h4 className="text-white font-medium mb-2">HSL</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400 w-6 text-sm font-medium">H</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hslValues.h}
                    onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hslValues.h}
                    onChange={(e) => handleHslChange('h', parseInt(e.target.value) || 0)}
                    className="w-12 px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 w-6 text-sm font-medium">S</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslValues.s}
                    onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hslValues.s}
                    onChange={(e) => handleHslChange('s', parseInt(e.target.value) || 0)}
                    className="w-12 px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-400 w-6 text-sm font-medium">L</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hslValues.l}
                    onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hslValues.l}
                    onChange={(e) => handleHslChange('l', parseInt(e.target.value) || 0)}
                    className="w-12 px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* Preset colors */}
            <div>
              <h4 className="text-white font-medium mb-2">Swatches</h4>
              <div className="grid grid-cols-12 gap-1">
                {[
                  '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80',
                  '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
                  '#800000', '#804000', '#808000', '#408000', '#008000', '#008040',
                  '#008080', '#004080', '#000080', '#400080', '#800080', '#800040',
                  '#400000', '#402000', '#404000', '#204000', '#004000', '#004020',
                  '#004040', '#002040', '#000040', '#200040', '#400040', '#400020',
                  '#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060',
                  '#404040', '#202020', '#000000', '#200000', '#002000', '#000020'
                ].map((color) => (
                  <div
                    key={color}
                    className="w-5 h-5 border border-gray-600 rounded cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
              >
                OK
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
