import { config } from '../config.js';

export default ({ elements }) => {    
    const { containerHeading, saveButtonText } = config;
    const {
        heading,
        saveButton
    } = elements;

    heading.appendChild(document.createTextNode(containerHeading));
    saveButton.appendChild(document.createTextNode(saveButtonText));
}