// src/components/dashboard/integrations/widget/FormFields.tsx
import React from "react";
import { ColorFieldProps, NumberFieldProps, TextFieldProps, SelectFieldProps } from "./types";

export function ColorField({ label, name, value, onChange, helpText }: ColorFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <div className="flex items-center mt-1">
                <input
                    type="color"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="h-10 w-14"
                />
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="ml-2 p-2 border border-gray-700 rounded-md w-full text-white bg-[#2a3349]"
                />
            </div>
            {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
        </div>
    );
}

export function NumberField({ label, name, min, max, value, onChange }: NumberFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                name={name}
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={onChange}
                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
            />
        </div>
    );
}

export function TextField({ label, name, value, onChange }: TextFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                name={name}
                type="text"
                value={value}
                onChange={onChange}
                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
            />
        </div>
    );
}

export function SelectField({ label, name, value, options, onChange }: SelectFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="mt-1 p-2 w-full border border-gray-700 rounded-md text-white bg-[#2a3349]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
