import { LightningElement, api } from 'lwc';

export default class SldsModal extends LightningElement {
    @api heading;
    @api minWidth;
    @api width;
    @api parentCmp;
    @api padding = 'medium';  // small, medium, large, x-large
    @api cmpId = 'modal';
    @api height;
    @api hideFooter = false;
    @api hideCancelButton = false;
    @api closeButtonLabel = 'Cancel';
    bShowModal = false;
    showSpinner = false;
    classes;
    hasRendered = false;

    renderedCallback(){
        // window.dispatchEvent(new Event('resize'));
    }

    connectedCallback(){
        if(this.padding == 'no'){
            this.classes = 'slds-modal__content';
        }
        else {
            this.classes = 'slds-modal__content slds-p-around_'+this.padding;
        }
    }

    @api
    openModal() {    
        this.bShowModal = true;
    }

    @api
    closeModal() {    
        this.bShowModal = false;
        const close = new CustomEvent('close');
        this.dispatchEvent(close);
    }

    @api
    showSpinnerModal(){ this.showSpinner = true;}

    @api
    hideSpinnerModal(){ this.showSpinner = false;}

    get showLongHeading(){
        if(this.heading && this.heading.length > 80){
            return true;
        }
        return false;
    }

    get showShortHeading(){
        if(this.heading && this.heading.length <= 80){
            return true;
        }
        return false;
    }

    renderedCallback() {
        if (this.hasRendered) return;
        this.hasRendered = true;
    
        const style = document.createElement('style');
        let modalId = this.template.querySelector('.main-span').id;
        let footerbtn = `c-slds-modal #${modalId} .slds-modal__footer button`;
        if(this.parentCmp){
            style.innerText = ` 
            ${this.parentCmp} > c-slds-modal #${modalId} .slds-modal__container { `+
                (this.minWidth ? `min-width: ${this.minWidth};` : '') +
                (this.width ? `width:${this.width};` : '')+
            `} 
            ${this.parentCmp} > c-slds-modal #${modalId} .slds-modal__content { `+
                (this.height ? `height:${this.height};` : '')+
            `}
            ${this.parentCmp} > ${footerbtn} {border-radius:0.25rem 0.25rem 0.25rem 0.25rem}
            `;
        } else {
            style.innerText = ` 
            c-slds-modal #${modalId} .slds-modal__container { `+
                (this.minWidth ? `min-width: ${this.minWidth};` : '')+
                (this.width ? `width:${this.width};` : '')+
            `} 
            c-slds-modal #${modalId} .slds-modal__content { `+
                (this.height ? `height:${this.height};` : '')+
            `}
            ${footerbtn} {border-radius:0.25rem 0.25rem 0.25rem 0.25rem}
            `;
        }
        // console.log(style.innerText);
        this.template.querySelector('.main-span').appendChild(style);
      }
}