import { Component } from 'preact';
import { html } from 'htm/preact';

/**
 * DiscreteValueSlider - A Preact component for selecting a single value from predefined options
 * 
 * Props:
 * - options: Array of objects with { value, label } for each selectable option
 * - value: Currently selected value
 * - onChange: Callback function called with the selected value when it changes
 * - width: Width of the component in pixels (default: 300)
 */
export class DiscreteValueSlider extends Component {
    constructor(props) {
        super(props);
        
        const { options = [], value = null, width = 300 } = props;
        
        this.state = {
            currentValue: value || (options[0] && options[0].value)
        };
        
        // Store props for easy access
        this.width = width;
        this.options = options;
    }

    handleOptionClick(optionValue) {
        this.setState({ currentValue: optionValue });
        this.props.onChange && this.props.onChange(optionValue);
    }

    render() {
        const { currentValue } = this.state;
        const currentIndex = this.options.findIndex(option => option.value === currentValue);

        return html`
            <div class="discrete-value-slider p-4">
                <!-- Current value display -->
                <div class="mb-4 text-center">
                    <span class="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border">
                        ${this.options.find(opt => opt.value === currentValue)?.label || 'None'}
                    </span>
                </div>

                <!-- Slider track with options -->
                <div class="relative" style="width: ${this.width}px; height: 40px;">
                    <!-- Track line -->
                    <div 
                        class="absolute top-1/2 transform -translate-y-1/2 bg-gray-300 rounded-full"
                        style="width: ${this.width}px; height: 4px;"
                    ></div>

                    <!-- Option points and labels -->
                    ${this.options.map((option, index) => {
                        const position = this.options.length > 1 ? (index / (this.options.length - 1)) * this.width : this.width / 2;
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
                                    onClick=${() => this.handleOptionClick(option.value)}
                                ></div>
                                
                                <!-- Option label -->
                                <div 
                                    class="absolute top-6 text-xs text-center cursor-pointer transition-colors duration-200 ${
                                        isSelected ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'
                                    }"
                                    style="left: ${position}px; transform: translateX(-50%); white-space: nowrap;"
                                    onClick=${() => this.handleOptionClick(option.value)}
                                >
                                    ${option.label}
                                </div>
                            </div>
                        `;
                    })}

                    <!-- Active indicator line -->
                    ${currentIndex >= 0 && this.options.length > 1 ? html`
                        <div 
                            class="absolute top-1/2 transform -translate-y-1/2 bg-blue-500 rounded-full transition-all duration-300"
                            style="left: 0; width: ${(currentIndex / (this.options.length - 1)) * this.width}px; height: 4px;"
                        ></div>
                    ` : null}
                </div>
            </div>
        `;
    }
}
