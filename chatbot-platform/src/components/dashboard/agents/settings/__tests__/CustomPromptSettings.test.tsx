// src/components/dashboard/agents/settings/__tests__/CustomPromptSettings.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import CustomPromptSettings from "../CustomPromptSettings";

describe("CustomPromptSettings", () => {
    it("renders textarea and saves prompt", async () => {
        const handleChange = jest.fn();
        const handleSave = jest.fn();

        render(
            <CustomPromptSettings
                customPrompt="Hello, I am a bot."
                onChange={handleChange}
                onSave={handleSave}
                saving={false}
            />
        );

        expect(screen.getByText("Custom Prompt")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveValue("Hello, I am a bot.");

        fireEvent.change(screen.getByRole("textbox"), { target: { value: "New prompt" } });
        expect(handleChange).toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
        expect(handleSave).toHaveBeenCalled();
    });
});
