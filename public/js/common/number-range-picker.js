/**
 * NumberRangePicker - A Preact component for selecting min/max values
 * 
 * Props:
 * - width: Width of the component in pixels (default: 300)
 * - scale: Scale type - 'linear' or 'log' (default: 'linear')
 * - minAllowed: Minimum allowed value (default: 0)
 * - maxAllowed: Maximum allowed value (default: 100)
 * - min: Initial minimum value
 * - max: Initial maximum value
 * - onChange: Callback function called with { min, max } when values change
 */
export function NumberRangePicker({ 
    width = 300, 
    scale = 'linear', 
    minAllowed = 0, 
    maxAllowed = 100, 
    min = minAllowed, 
    max = maxAllowed, 
    onChange 
}) {
    // Access globals inside the component function
    const { useState, useEffect, useRef } = window.preactHooks;
    const html = window.htm.bind(window.preact.createElement);
    
    const [currentMin, setCurrentMin] = useState(min);
    const [currentMax, setCurrentMax] = useState(max);
    const [editingMin, setEditingMin] = useState(false);
    const [editingMax, setEditingMax] = useState(false);
    const [isDragging, setIsDragging] = useState(null);
    
    const sliderRef = useRef();
    const minInputRef = useRef();
    const maxInputRef = useRef();

    // Clamp values to allowed range
    const clampValue = (value) => Math.max(minAllowed, Math.min(maxAllowed, value));

    // Convert value to pixel position
    const valueToPosition = (value) => {
        if (scale === 'log') {
            const logMin = Math.log(minAllowed || 1);
            const logMax = Math.log(maxAllowed);
            const logValue = Math.log(value || 1);
            return ((logValue - logMin) / (logMax - logMin)) * width;
        } else {
            return ((value - minAllowed) / (maxAllowed - minAllowed)) * width;
        }
    };

    // Convert pixel position to value
    const positionToValue = (position) => {
        const ratio = position / width;
        if (scale === 'log') {
            const logMin = Math.log(minAllowed || 1);
            const logMax = Math.log(maxAllowed);
            return Math.exp(logMin + ratio * (logMax - logMin));
        } else {
            return minAllowed + ratio * (maxAllowed - minAllowed);
        }
    };

    // Handle mouse events for dragging
    const handleMouseDown = (type, e) => {
        e.preventDefault();
        setIsDragging(type);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !sliderRef.current) return;
        
        const rect = sliderRef.current.getBoundingClientRect();
        const position = Math.max(0, Math.min(width, e.clientX - rect.left));
        const value = clampValue(positionToValue(position));
        
        if (isDragging === 'min') {
            const newMin = Math.min(value, currentMax);
            setCurrentMin(newMin);
            onChange && onChange({ min: newMin, max: currentMax });
        } else if (isDragging === 'max') {
            const newMax = Math.max(value, currentMin);
            setCurrentMax(newMax);
            onChange && onChange({ min: currentMin, max: newMax });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Handle direct value input
    const handleMinInputChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            const newMin = clampValue(Math.min(value, currentMax));
            setCurrentMin(newMin);
            onChange && onChange({ min: newMin, max: currentMax });
        }
    };

    const handleMaxInputChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            const newMax = clampValue(Math.max(value, currentMin));
            setCurrentMax(newMax);
            onChange && onChange({ min: currentMin, max: newMax });
        }
    };

    const handleMinInputBlur = () => {
        setEditingMin(false);
    };

    const handleMaxInputBlur = () => {
        setEditingMax(false);
    };

    const handleMinInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setEditingMin(false);
        }
    };

    const handleMaxInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setEditingMax(false);
        }
    };

    // Focus input when editing starts
    useEffect(() => {
        if (editingMin && minInputRef.current) {
            minInputRef.current.focus();
            minInputRef.current.select();
        }
    }, [editingMin]);

    useEffect(() => {
        if (editingMax && maxInputRef.current) {
            maxInputRef.current.focus();
            maxInputRef.current.select();
        }
    }, [editingMax]);

    const minPosition = valueToPosition(currentMin);
    const maxPosition = valueToPosition(currentMax);
    const dotSize = 16;

    return html`
        <div class="number-range-picker p-4">
            <!-- Value displays -->
            <div class="relative mb-8" style="width: ${width}px; height: 30px;">
                <!-- Min value -->
                <div 
                    class="absolute flex items-center justify-center cursor-pointer"
                    style="left: ${minPosition - 25}px; top: -30px; width: 50px;"
                    onClick=${() => setEditingMin(true)}
                >
                    ${editingMin ? html`
                        <input
                            ref=${minInputRef}
                            type="number"
                            value=${currentMin.toFixed(2)}
                            onChange=${handleMinInputChange}
                            onBlur=${handleMinInputBlur}
                            onKeyDown=${handleMinInputKeyDown}
                            class="w-full text-center text-xs border rounded px-1 py-0.5"
                            step="0.01"
                            min=${minAllowed}
                            max=${maxAllowed}
                        />
                    ` : html`
                        <span class="text-xs font-medium text-gray-700 bg-white px-1 py-0.5 rounded shadow-sm border">
                            ${currentMin.toFixed(2)}
                        </span>
                    `}
                </div>
                
                <!-- Max value -->
                <div 
                    class="absolute flex items-center justify-center cursor-pointer"
                    style="left: ${maxPosition - 25}px; top: -30px; width: 50px; z-index: ${currentMin === currentMax ? 20 : 10};"
                    onClick=${() => setEditingMax(true)}
                >
                    ${editingMax ? html`
                        <input
                            ref=${maxInputRef}
                            type="number"
                            value=${currentMax.toFixed(2)}
                            onChange=${handleMaxInputChange}
                            onBlur=${handleMaxInputBlur}
                            onKeyDown=${handleMaxInputKeyDown}
                            class="w-full text-center text-xs border rounded px-1 py-0.5"
                            step="0.01"
                            min=${minAllowed}
                            max=${maxAllowed}
                        />
                    ` : html`
                        <span class="text-xs font-medium text-gray-700 bg-white px-1 py-0.5 rounded shadow-sm border">
                            ${currentMax.toFixed(2)}
                        </span>
                    `}
                </div>
            </div>

            <!-- Slider track -->
            <div class="relative" style="width: ${width}px; height: ${dotSize}px;">
                <div 
                    ref=${sliderRef}
                    class="absolute top-1/2 transform -translate-y-1/2 bg-gray-300 rounded-full cursor-pointer"
                    style="width: ${width}px; height: 4px;"
                >
                    <!-- Selected range -->
                    <div 
                        class="absolute top-0 bg-blue-500 rounded-full h-full"
                        style="left: ${minPosition}px; width: ${maxPosition - minPosition}px;"
                    ></div>
                </div>

                <!-- Min dot -->
                <div 
                    class="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
                    style="left: ${minPosition}px; width: ${dotSize}px; height: ${dotSize}px; z-index: 10;"
                    onMouseDown=${(e) => handleMouseDown('min', e)}
                ></div>

                <!-- Max dot (rendered on top when overlapping) -->
                <div 
                    class="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing shadow-md hover:scale-110 transition-transform"
                    style="left: ${maxPosition}px; width: ${dotSize}px; height: ${dotSize}px; z-index: ${currentMin === currentMax ? 20 : 10};"
                    onMouseDown=${(e) => handleMouseDown('max', e)}
                ></div>
            </div>

            <!-- Range labels -->
            <div class="flex justify-between mt-2 text-xs text-gray-500" style="width: ${width}px;">
                <span>${minAllowed}</span>
                <span>${maxAllowed}</span>
            </div>
        </div>
    `;
}
