/**
 * DiscreteValueSlider - A Preact component for selecting a single value from predefined options
 * 
 * Props:
 * - options: Array of objects with { value, label } for each selectable option
 * - value: Currently selected value
 * - onChange: Callback function called with the selected value when it changes
 * - width: Width of the component in pixels (default: 300)
 */
export function DiscreteValueSlider({ 
    options = [], 
    value = null, 
    onChange,
    width = 300 
}) {
    // Access globals inside the component function
    const { useState } = window.preactHooks;
    const html = window.htm.bind(window.preact.createElement);
    
    const [currentValue, setCurrentValue] = useState(value || (options[0] && options[0].value));

    const handleOptionClick = (optionValue) => {
        setCurrentValue(optionValue);
        onChange && onChange(optionValue);
    };

    const currentIndex = options.findIndex(option => option.value === currentValue);
    const optionWidth = options.length > 1 ? width / (options.length - 1) : width;

    return html`
        <div class="discrete-value-slider p-4">
            <!-- Current value display -->
            <div class="mb-4 text-center">
                <span class="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border">
                    ${options.find(opt => opt.value === currentValue)?.label || 'None'}
                </span>
            </div>

            <!-- Slider track with options -->
            <div class="relative" style="width: ${width}px; height: 40px;">
                <!-- Track line -->
                <div 
                    class="absolute top-1/2 transform -translate-y-1/2 bg-gray-300 rounded-full"
                    style="width: ${width}px; height: 4px;"
                ></div>

                <!-- Option points and labels -->
                ${options.map((option, index) => {
                    const position = options.length > 1 ? (index / (options.length - 1)) * width : width / 2;
                    const isSelected = option.value === currentValue;
                    
                    return html`
                        <div key=${option.value} class="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                            <!-- Option dot -->
                            <div 
                                class="w-4 h-4 rounded-full cursor-pointer transition-all duration-200 border-2 ${
                                    isSelected 
                                        ? 'bg-blue-500 border-blue-500 scale-125 shadow-lg' 
                                        : 'bg-white border-gray-400 hover:border-blue-400 hover:scale-110'
                                }"
                                style="left: ${position}px;"
                                onClick=${() => handleOptionClick(option.value)}
                            ></div>
                            
                            <!-- Option label -->
                            <div 
                                class="absolute top-6 text-xs text-center cursor-pointer transition-colors duration-200 ${
                                    isSelected ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'
                                }"
                                style="left: ${position}px; transform: translateX(-50%); white-space: nowrap;"
                                onClick=${() => handleOptionClick(option.value)}
                            >
                                ${option.label}
                            </div>
                        </div>
                    `;
                })}

                <!-- Active indicator line -->
                ${currentIndex >= 0 && options.length > 1 ? html`
                    <div 
                        class="absolute top-1/2 transform -translate-y-1/2 bg-blue-500 rounded-full transition-all duration-300"
                        style="left: 0; width: ${(currentIndex / (options.length - 1)) * width}px; height: 4px;"
                    ></div>
                ` : null}
            </div>
        </div>
    `;
}
