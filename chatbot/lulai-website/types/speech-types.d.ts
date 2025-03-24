// speech-types.d.ts

interface SpeechRecognitionEvent extends Event {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognitionType extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: Event) => void;
    onend: (event: Event) => void;
    start: () => void;
    stop: () => void;
}

// Augment the Window interface
interface Window {
    SpeechRecognition?: {
        new(): SpeechRecognitionType;
    };
    webkitSpeechRecognition?: {
        new(): SpeechRecognitionType;
    };
}