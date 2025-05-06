// src/components/dashboard/agents/settings/__tests__/TabNavigation.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import TabNavigation from "../TabNavigation";

describe("TabNavigation", () => {
    it("renders all three tabs and triggers tab change", () => {
        const setActiveTab = jest.fn();

        render(<TabNavigation activeTab="general" setActiveTab={setActiveTab} />);

        expect(screen.getByText("General")).toBeInTheDocument();
        expect(screen.getByText("Widget Appearance")).toBeInTheDocument();
        expect(screen.getByText("Custom Prompt")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Widget Appearance"));
        expect(setActiveTab).toHaveBeenCalledWith("widget");

        fireEvent.click(screen.getByText("Custom Prompt"));
        expect(setActiveTab).toHaveBeenCalledWith("prompt");
    });
});
