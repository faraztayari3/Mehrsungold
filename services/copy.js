/**
     * Copies the value of the 'text' to the clipboard.
     * @param {{string}} text - The text coped to clipboard.
     * @returns None
    */
const CopyData = (text) => (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(text);
}

export default CopyData;