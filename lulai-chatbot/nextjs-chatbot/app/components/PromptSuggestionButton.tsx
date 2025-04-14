// lulai-opencart/lulai-chatbot/nextjs-chatbot/app/components/PromptSuggestionButton.ts
const PromptSuggestionButton = ({text, onClick}) => {
    return(
        <button className="prompt-suggestions-button" onClick={onClick}>

        {text}

        </button>
    )
}

export default PromptSuggestionButton