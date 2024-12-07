'use strict';

import Input from '../input/input.js';

class AppState {
    constructor() {
        // Get list of UI indicators
        this.ui_categories = {
            'Shading': {
                'Phong': document.getElementById('shadingPhong'),
                'Textured': document.getElementById('shadingTextured'),
            },
            'Control': {
                'Camera': document.getElementById('controlCamera'),
            },
            '3D Scene': document.getElementById('openfileActionInput')
        };

        // Create state dictionary
        this.ui_state = {
            'Shading': '',
            'Control': '',
        };

        // Update UI with default values
        this.updateUI('Shading', 'Phong');
        this.updateUI('Control', 'Camera');

        // Set asynchronous handlers
        this.onOpen3DSceneCallback = null
        this.ui_categories['3D Scene'].onchange = (evt) => {
            if (this.onOpen3DSceneCallback == null)
                return
            
            let scene = this.onOpen3DSceneCallback(evt.target.files[0].name)
            this.ui_categories['Select Scene Node'].innerHTML = ''
            for (let node of scene.getNodes()) {
                let option = document.createElement('option')
                option.value = node.name
                option.innerHTML = node.name
                this.ui_categories['Select Scene Node'].appendChild(option)
            }
            this.ui_categories['Select Scene Node'].removeAttribute('disabled')
            this.ui_categories['Select Scene Node'].value = this.ui_categories['Select Scene Node'].getElementsByTagName('option')[0].value
            this.ui_state['Select Scene Node'] = this.ui_categories['Select Scene Node'].value
        }
    }

    /**
     * Sets a callback to react to opening a scene file
     * 
     * @param {Function} callback Function that creates a scene and returns it
     */
    onOpen3DScene(callback) {
        this.onOpen3DSceneCallback = callback;
    }

    /**
     * Returns the content of a UI state
     * @param {String} name The name of the state to query 
     * @returns {String | null} The state for the ui state name
     */
    getState(name) {
        return this.ui_state[name];
    }

    /**
     * Updates the app state by checking the input module for changes in user input
     */
    update() {
        // Shading
        if (Input.isKeyPressed('c')) {
            this.updateUI('Shading', 'Phong');
        } else if (Input.isKeyPressed('v')) {
            this.updateUI('Shading', 'Textured');
        }

        // Transformation
        if (Input.isKeyDown('q')) {
            this.updateUI('Control', 'Scene Node'); // Removed references to "Scene Node"
        } else {
            this.updateUI('Control', 'Camera');
        }
    }

    /**
     * Updates the UI to represent the current interaction
     * @param {String} category The UI category to use; see this.ui_categories for reference
     * @param {String} name The name of the item within the category
     * @param {String | null} value The value to use if the UI element is not a toggle; sets the element to given string 
     */
    updateUI(category, name, value = null) {
        this.ui_state[category] = name;
        for (let key in this.ui_categories[category]) {
            this.updateUIElement(this.ui_categories[category][key], key == name, value);
        }
    }

    /**
     * Updates a single UI element with the given state and value
     * @param {Element} el The DOM element to update
     * @param {Boolean} state The state (active / inactive) to update it to
     * @param {String | null} value The value to use if the UI element is not a toggle; sets the element to given string 
     */
    updateUIElement(el, state, value) {
        el.classList.remove(state ? 'inactive' : 'active');
        el.classList.add(state ? 'active' : 'inactive');

        if (state && value != null) el.innerHTML = value;
    }
}

export default AppState;
