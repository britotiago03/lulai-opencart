// src/components/dashboard/agents/settings/__tests__/GeneralSettings.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import GeneralSettings from "../GeneralSettings";

describe("GeneralSettings", () => {
    it("renders API key and responds to button clicks", () => {
        const copyKey = jest.fn();
        const regenerateKey = jest.fn();
        const copyCode = jest.fn();

        render(
            <GeneralSettings
                chatbotName="TestBot"
                chatbotDescription="A helpful bot"
                apiKey="1234567890abcdef"
                onCopyApiKey={copyKey}
                onRegenerateApiKey={regenerateKey}
                onCopyInstallationCode={copyCode}
            />
        );

        expect(screen.getByDisplayValue("TestBot")).toBeInTheDocument();
        expect(screen.getByDisplayValue("A helpful bot")).toBeInTheDocument();
        expect(screen.getByDisplayValue("1234567890abcdef")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Copy"));
        expect(copyKey).toHaveBeenCalled();

        fireEvent.click(screen.getByText("Regenerate"));
        expect(regenerateKey).toHaveBeenCalled();

        fireEvent.click(screen.getByText("Copy Code"));
        expect(copyCode).toHaveBeenCalled();
    });
});
