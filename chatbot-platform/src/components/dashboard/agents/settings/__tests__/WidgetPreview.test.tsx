// src/components/dashboard/agents/settings/__tests__/WidgetPreview.test.tsx
import { render, screen } from "@testing-library/react";
import WidgetPreview from "../WidgetPreview";
import { WidgetConfig } from "@/types/widget-config";

const mockConfig: WidgetConfig = {
    primaryColor: "#3498db",
    secondaryColor: "#2ecc71",
    buttonSize: 80,
    windowWidth: 400,
    windowHeight: 600,
    headerText: "Chat with us",
    fontFamily: "Arial"
};

describe("WidgetPreview", () => {
    it("renders widget preview with provided config", () => {
        render(<WidgetPreview widgetConfig={mockConfig} />);

        expect(screen.getByText("Widget Preview")).toBeInTheDocument();
        expect(screen.getByText("Chat with us")).toBeInTheDocument();
        expect(screen.getByText("How can I help you?")).toBeInTheDocument();
        expect(screen.getByText("Sample question")).toBeInTheDocument();
    });
});
