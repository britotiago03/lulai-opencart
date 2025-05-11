import { render, screen } from "@testing-library/react";
import CustomPieChart from "@/components/dashboard/analytics/charts/PieChart";

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

describe("PieChart", () => {
    it("renders pie chart with proper data", () => {
        render(
            <div style={{ width: "400px", height: "300px" }}>
                <CustomPieChart
                    data={[{ name: "add_to_cart", value: 100 }]}
                    dataKey="value"
                    nameKey="name"
                />
            </div>
        );

        // Test that the component renders without errors
        expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("shows fallback if no data", () => {
        render(<CustomPieChart data={[]} dataKey="value" nameKey="name" />);
        expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });
});