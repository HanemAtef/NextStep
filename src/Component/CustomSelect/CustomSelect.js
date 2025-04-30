import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = 'اختر...',
    searchable = true,
    disabled = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const option = options.find(opt => opt.value === value);
        setSelectedOption(option);
    }, [value, options]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        setSelectedOption(option);
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    return (
        <div
            ref={selectRef}
            className={`${styles.selectContainer} ${className} ${disabled ? styles.disabled : ''}`}
        >
            <div
                className={`${styles.selectHeader} ${isOpen ? styles.open : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={styles.selectedValue}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={styles.arrow} />
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    {searchable && (
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="ابحث..."
                                className={styles.searchInput}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className={styles.optionsContainer}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`${styles.option} ${selectedOption?.value === option.value ? styles.selected : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                لا توجد نتائج
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect; 