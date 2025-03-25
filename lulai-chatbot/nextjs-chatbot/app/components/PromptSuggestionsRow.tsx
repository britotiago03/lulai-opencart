import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionsRow = ({ onPromptClick }) => {
  const prompts = [
  ];

  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton 
          key={`suggestion-${prompt}-${index}`} 
          text={prompt} 
          onClick={() => onPromptClick(prompt)} 
        />
      ))}
    </div>
  );
};

export default PromptSuggestionsRow;
