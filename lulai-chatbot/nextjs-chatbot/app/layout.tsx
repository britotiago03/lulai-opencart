import "./global.css"

export const metadata = {
    title: "LulAI",
    description: "A chatbot for Knowledge"
}

const RootLayout = ({ children }) => {
    return (
        <html lang = "en">
        <body>{children}</body>
        </html>
    )
}

export default RootLayout