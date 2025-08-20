import { Component } from 'preact';
import { html } from 'htm/preact';

/**
 * ToggleButton - A Preact component for boolean value selection
 * 
 * Props:
 * - checked: Boolean value indicating if the toggle is on/off
 * - onChange: Callback function called with the new boolean value when it changes
 * - label: Optional label text to display next to the toggle
 * - disabled: Boolean indicating if the toggle is disabled (default: false)
 * - size: Size variant - 'sm', 'md', 'lg' (default: 'md')
 */
export class ToggleButton extends Component {
    constructor(props) {
        super(props);
        
        const { checked = false, label = '', disabled = false, size = 'md' } = props;
        
        this.state = {
            isChecked: checked
        };
        
        // Store props for easy access
        this.label = label;
        this.disabled = disabled;
        this.size = size;
    }

    handleToggle() {
        if (this.disabled) return;
        
        const newValue = !this.state.isChecked;
        this.setState({ isChecked: newValue });
        this.props.onChange && this.props.onChange(newValue);
    }

    render() {
        const { isChecked } = this.state;
        
        // Size configurations
        const sizeConfig = {
            sm: {
                track: 'w-8 h-4',
                thumb: 'w-3 h-3',
                translate: 'translate-x-4',
                text: 'text-sm'
            },
            md: {
                track: 'w-11 h-6',
                thumb: 'w-5 h-5',
                translate: 'translate-x-5',
                text: 'text-base'
            },
            lg: {
                track: 'w-14 h-7',
                thumb: 'w-6 h-6',
                translate: 'translate-x-7',
                text: 'text-lg'
            }
        };

        const config = sizeConfig[this.size] || sizeConfig.md;

        return html`
            <div class="toggle-button inline-flex items-center">
                ${this.label ? html`
                    <span class="mr-3 ${config.text} ${this.disabled ? 'text-gray-400' : 'text-gray-700'} font-medium">
                        ${this.label}
                    </span>
                ` : null}
                
                <button
                    type="button"
                    class="relative inline-flex ${config.track} flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        this.disabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isChecked 
                                ? 'bg-blue-600' 
                                : 'bg-gray-200'
                    }"
                    onClick=${() => this.handleToggle()}
                    disabled=${this.disabled}
                    aria-checked=${isChecked}
                    aria-label=${this.label || 'Toggle switch'}
                >
                    <span class="sr-only">${this.label || 'Toggle switch'}</span>
                    
                    <!-- Toggle thumb -->
                    <span
                        class="pointer-events-none inline-block ${config.thumb} rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            isChecked ? config.translate : 'translate-x-0'
                        }"
                    ></span>
                </button>
            </div>
        `;
    }
}
