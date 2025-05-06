// src/components/dashboard/agents/settings/__tests__/StatusMessage.test.tsx
import { render, screen } from "@testing-library/react";
import StatusMessage from "../StatusMessage";

describe("StatusMessage", () => {
    it("renders error message", () => {
        render(<StatusMessage error="Something went wrong" success={null} />);
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders success message", () => {
        render(<StatusMessage error={null} success="Saved successfully" />);
        expect(screen.getByText("Saved successfully")).toBeInTheDocument();
    });

    it("renders nothing when no message", () => {
        const { container } = render(<StatusMessage error={null} success={null} />);
        expect(container).toBeEmptyDOMElement();
    });
});
