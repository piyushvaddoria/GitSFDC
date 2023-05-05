import { LightningElement, api, track } from 'lwc';

export default class CustomLookup extends LightningElement {
    @api childObjectApiName = 'Contact'; //Contact is the default value
    @api targetFieldApiName = 'AccountId'; //AccountId is the default value
    @api fieldLabel = 'Your field label here';
    @api disabled = false;
    @api value;
    @api required = false;
    @api variant;
    @api hideLabel = false;
    @track variantfld = 'standard';

    @track inputDivClass = '';

    handleChange(event) {
        this.value = event.detail.value;
        
        // Creates the event
        const selectedEvent = new CustomEvent('valueselected', {
            detail: event.detail.value
        });
        //dispatching the custom event
        this.dispatchEvent(selectedEvent);
    }

    @api isValid() {
        if (this.required) {
            return this.template.querySelector('lightning-input-field').reportValidity();
        }
    }

    connectedCallback(){

        if(this.fieldLabel || this.hideLabel){
            this.variantfld = 'label-hidden';
        }

        if(this.variant == 'label-inline'){
            this.inputDivClass = 'slds-form-element slds-form-element_horizontal'
        }
    }

    @api
    setValue(data){
        this.value = data;
    }

    handleSubmit(event){
        if(event.which == 13){
            event.preventDefault(); // Preveting form submit when clicking enter to stop page reload
        }
    }
    
    @api
    reset(event) {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }
}