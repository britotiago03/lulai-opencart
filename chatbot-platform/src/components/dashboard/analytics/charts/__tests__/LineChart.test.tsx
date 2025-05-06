import { render, screen } from "@testing-library/react";
import CustomLineChart from "@/components/dashboard/analytics/charts/LineChart";

// Mock the ResponsiveContainer component from recharts
jest.mock("recharts", () => {
    const OriginalModule = jest.requireActual("recharts");
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => (
            <div data-testid="responsive-container">{children}</div>
        ),
    };
});

describe("LineChart", () => {
    it("renders chart with valid data", () => {
        render(
            <div style={{ width: "500px", height: "300px" }}>
                <CustomLineChart
                    data={[{ date: "2025-05-01", count: 20, messages: 50 }]}
                    xDataKey="date"
                    yDataKey="count"
                    secondaryDataKey="messages"
                />
            </div>
        );

        // Test that the component renders without errors
        expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("renders fallback for empty data", () => {
        render(<CustomLineChart data={[]} xDataKey="x" yDataKey="y" />);
        expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });
});