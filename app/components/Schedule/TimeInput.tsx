"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface TimeInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function TimeInput({ value, onChange, placeholder }: TimeInputProps) {
    const [inputValue, setInputValue] = useState(value);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const parseTimeInput = (input: string): string | null => {
        if (!input.trim()) return null;

        const cleanInput = input.trim().toLowerCase();

        // Handle 12-hour format (6am, 7pm, 12pm)
        const twelveHourMatch = cleanInput.match(/^(\d{1,2})(am|pm)$/);
        if (twelveHourMatch) {
            let hours = parseInt(twelveHourMatch[1]);
            const period = twelveHourMatch[2];
            
            if (hours < 1 || hours > 12) return null;
            
            if (period === "pm" && hours !== 12) {
                hours += 12;
            } else if (period === "am" && hours === 12) {
                hours = 0;
            }
            
            return `${hours.toString().padStart(2, '0')}:00`;
        }

        // Handle 24-hour format with colon (18:30, 09:00)
        const twentyFourHourMatch = cleanInput.match(/^(\d{1,2}):(\d{2})$/);
        if (twentyFourHourMatch) {
            const hours = parseInt(twentyFourHourMatch[1]);
            const minutes = parseInt(twentyFourHourMatch[2]);
            
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        // Handle hour only (6, 18) - assumes :00 minutes
        const hourOnlyMatch = cleanInput.match(/^(\d{1,2})$/);
        if (hourOnlyMatch) {
            const hours = parseInt(hourOnlyMatch[1]);
            
            if (hours < 0 || hours > 23) return null;
            
            return `${hours.toString().padStart(2, '0')}:00`;
        }

        return null;
    };

    const formatTimeForDisplay = (time: string): string => {
        if (!time) return "";
        
        const [hours, minutes] = time.split(':').map(Number);
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const period = hours < 12 ? 'AM' : 'PM';
        
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period} (${time})`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (!newValue.trim()) {
            setIsValid(true);
            onChange("");
            return;
        }

        const parsedTime = parseTimeInput(newValue);
        if (parsedTime) {
            setIsValid(true);
            onChange(parsedTime);
        } else {
            setIsValid(false);
        }
    };

    const handleBlur = () => {
        if (!inputValue.trim()) {
            setIsValid(true);
            return;
        }

        const parsedTime = parseTimeInput(inputValue);
        if (parsedTime) {
            setInputValue(formatTimeForDisplay(parsedTime));
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    };

    const handleFocus = () => {
        if (value) {
            setInputValue(value);
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    placeholder={placeholder || "Ví dụ: 6am, 18:30, 7pm..."}
                    className={`pl-10 ${!isValid ? 'border-red-500 focus:border-red-500' : ''}`}
                />
            </div>
            
            {!isValid && (
                <p className="text-sm text-red-600">
                    Định dạng thời gian không hợp lệ. Sử dụng: 6am, 7pm, 18:30, hoặc 6
                </p>
            )}
            
            {isValid && value && (
                <p className="text-sm text-gray-600">
                    Thời gian: {formatTimeForDisplay(value)}
                </p>
            )}
            
            <div className="text-xs text-gray-500">
                <p>Định dạng hỗ trợ:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>12 giờ: 6am, 7pm, 12pm</li>
                    <li>24 giờ: 18:30, 09:00, 23:45</li>
                    <li>Chỉ giờ: 6, 18 (tự động thêm :00)</li>
                </ul>
            </div>
        </div>
    );
}
