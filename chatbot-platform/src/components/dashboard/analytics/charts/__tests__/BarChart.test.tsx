import { render, screen } from "@testing-library/react";
import CustomBarChart from "@/components/dashboard/analytics/charts/BarChart";

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

describe("BarChart", () => {
    it("renders without crashing when data is provided", () => {
        render(
            <div style={{ width: "500px", height: "300px" }}>
                <CustomBarChart
                    data={[{ label: "Jan", value: 10 }]}
                    xDataKey="label"
                    yDataKey="value"
                />
            </div>
        );

        // Test that the component renders without errors
        expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("shows fallback when data is empty", () => {
        render(<CustomBarChart data={[]} xDataKey="x" yDataKey="y" />);
        expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });
});