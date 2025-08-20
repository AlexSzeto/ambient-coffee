import { Component, createRef } from 'preact';
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
            currentValue: value || (options[0] && options[0].value),
            isDragging: false,
            isAnimating: false
        };
        
        // Store props for easy access
        this.width = width;
        this.options = options;
        
        // Create refs
        this.sliderRef = createRef();
        
        // Bind mouse event handlers
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
    }

    // Get position for a given value
    getPositionForValue(value) {
        const index = this.options.findIndex(option => option.value === value);
        if (index === -1) return 0;
        return this.options.length > 1 ? (index / (this.options.length - 1)) * this.width : this.width / 2;
    }

    // Get nearest value for a given position
    getNearestValueForPosition(position) {
        if (this.options.length === 0) return null;
        if (this.options.length === 1) return this.options[0].value;
        
        const ratio = position / this.width;
        const index = Math.round(ratio * (this.options.length - 1));
        const clampedIndex = Math.max(0, Math.min(this.options.length - 1, index));
        return this.options[clampedIndex].value;
    }

    handleMouseDown(e) {
        e.preventDefault();
        this.setState({ isDragging: true });
        document.addEventListener('mousemove', this.boundMouseMove);
        document.addEventListener('mouseup', this.boundMouseUp);
    }

    handleTrackClick(e) {
        // Prevent event if we're dragging the knob
        if (this.state.isDragging) return;
        
        const rect = this.sliderRef.current.getBoundingClientRect();
        const position = Math.max(0, Math.min(this.width, e.clientX - rect.left));
        
        // Find nearest value for clicked position
        const nearestValue = this.getNearestValueForPosition(position);
        
        // If it's the same value, don't animate
        if (nearestValue === this.state.currentValue) return;
        
        // Start animation
        this.setState({ isAnimating: true });
        
        // Update value immediately for callback
        this.setState({ currentValue: nearestValue });
        this.props.onChange && this.props.onChange(nearestValue);
        
        // End animation after CSS transition completes
        setTimeout(() => {
            this.setState({ isAnimating: false });
        }, 300); // Match CSS transition duration
    }

    handleMouseMove(e) {
        if (!this.state.isDragging || !this.sliderRef.current) return;
        
        const rect = this.sliderRef.current.getBoundingClientRect();
        const position = Math.max(0, Math.min(this.width, e.clientX - rect.left));
        
        // Update position during drag (for smooth visual feedback)
        this.dragPosition = position;
        this.forceUpdate(); // Force re-render to show dragging position
    }

    handleMouseUp(e) {
        if (!this.state.isDragging || !this.sliderRef.current) return;
        
        const rect = this.sliderRef.current.getBoundingClientRect();
        const position = Math.max(0, Math.min(this.width, e.clientX - rect.left));
        
        // Snap to nearest value
        const nearestValue = this.getNearestValueForPosition(position);
        this.setState({ 
            currentValue: nearestValue,
            isDragging: false 
        });
        
        // Clear drag position
        this.dragPosition = null;
        
        // Call onChange callback
        this.props.onChange && this.props.onChange(nearestValue);
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.boundMouseMove);
        document.removeEventListener('mouseup', this.boundMouseUp);
    }

    handleOptionClick(optionValue) {
        // If it's the same value, don't animate
        if (optionValue === this.state.currentValue) return;
        
        // Start animation
        this.setState({ isAnimating: true });
        
        // Update value
        this.setState({ currentValue: optionValue });
        this.props.onChange && this.props.onChange(optionValue);
        
        // End animation after CSS transition completes
        setTimeout(() => {
            this.setState({ isAnimating: false });
        }, 300); // Match CSS transition duration
    }

    render() {
        const { currentValue, isDragging, isAnimating } = this.state;
        const dotSize = 16; // Match number range picker dot size
        
        // Calculate knob position - use drag position during dragging, otherwise use current value position
        const knobPosition = isDragging && this.dragPosition !== null 
            ? this.dragPosition 
            : this.getPositionForValue(currentValue);

        return html`
            <div class="discrete-value-slider p-4">
                <!-- Current value display -->
                <div class="mb-4 text-center">
                    <span class="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border">
                        ${this.options.find(opt => opt.value === currentValue)?.label || 'None'}
                    </span>
                </div>

                <!-- Slider track with single draggable knob -->
                <div class="relative" style="width: ${this.width}px; height: 40px;">
                    <!-- Clickable track line -->
                    <div 
                        ref=${this.sliderRef}
                        class="absolute top-1/2 transform -translate-y-1/2 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors duration-150"
                        style="width: ${this.width}px; height: 4px;"
                        onClick=${(e) => this.handleTrackClick(e)}
                    ></div>

                    <!-- Option labels (clickable) -->
                    ${this.options.map((option, index) => {
                        const position = this.options.length > 1 ? (index / (this.options.length - 1)) * this.width : this.width / 2;
                        const isSelected = option.value === currentValue;
                        
                        return html`
                            <div 
                                key=${option.value} 
                                class="absolute top-6 text-xs text-center cursor-pointer transition-colors duration-200 ${
                                    isSelected ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'
                                }"
                                style="left: ${position}px; transform: translateX(-50%); white-space: nowrap;"
                                onClick=${() => this.handleOptionClick(option.value)}
                            >
                                ${option.label}
                            </div>
                        `;
                    })}

                    <!-- Single draggable knob with smooth animation -->
                    <div 
                        class="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-110 ${
                            isDragging ? 'scale-110' : ''
                        } ${
                            isAnimating ? 'transition-all duration-300 ease-out' : 'transition-transform duration-150'
                        }"
                        style="left: ${knobPosition}px; width: ${dotSize}px; height: ${dotSize}px; z-index: 20;"
                        onMouseDown=${(e) => this.handleMouseDown(e)}
                    ></div>
                </div>
            </div>
        `;
    }
}
