// src/components/dashboard/agents/settings/__tests__/WidgetSettings.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import WidgetSettings from "../WidgetSettings";

describe("WidgetSettings", () => {
    const mockConfig = {
        primaryColor: "#123456",
        secondaryColor: "#abcdef",
        buttonSize: 80,
        windowWidth: 400,
        windowHeight: 600,
        headerText: "Test Header",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    };

    const onChange = jest.fn();
    const onSave = jest.fn();

    it("renders form fields and triggers handlers", () => {
        render(<WidgetSettings widgetConfig={mockConfig} onChange={onChange} onSave={onSave} />);

        // Ensure all input fields render
        expect(screen.getByLabelText(/Primary Color/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Secondary Color/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Button Size/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Window Width/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Window Height/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Header Text/i)).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: /font family/i })).toHaveValue(
            "Helvetica Neue, Helvetica, Arial, sans-serif"
        );

        // Trigger save
        fireEvent.click(screen.getByText("Save Changes"));
        expect(onSave).toHaveBeenCalled();
    });

    it("shows saving state when saving prop is true", () => {
        render(<WidgetSettings widgetConfig={mockConfig} onChange={onChange} onSave={onSave} saving={true} />);

        // Check that the save button shows the saving state
        const saveButton = screen.getByText("Saving...");
        expect(saveButton).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
        expect(saveButton).toHaveClass("bg-blue-400");
    });

    it("allows editing form fields", () => {
        render(<WidgetSettings widgetConfig={mockConfig} onChange={onChange} onSave={onSave} />);

        // Get input fields
        const headerTextInput = screen.getByLabelText(/Header Text/i);

        // Change header text
        fireEvent.change(headerTextInput, { target: { value: "New Header Text" } });

        // Verify onChange was called
        expect(onChange).toHaveBeenCalled();
    });
});