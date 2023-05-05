import { LightningElement,track,api } from 'lwc';

export default class UiReloadButton extends LightningElement {
    @api float;
    @api margin;
    @api position = 'right';

    @track refreshButtonClass = ''; // used to rotate refresh icon on click
    @track refBtnVarient = ''; // used to change icon color on click
    @track _refBtnClass = `slds-button slds-button_icon slds-button_icon-border-filled ${this.hasMargin} ${this.hasFloat}`; // default refresh icon class list
    
    connectedCallback(){
        this._refBtnClass = `slds-button slds-button_icon slds-button_icon-border-filled ${this.hasMargin} ${this.hasFloat}`; // default refresh icon class list
    }
    get refBtnClass(){
        return this._refBtnClass;
    } 

    get hasFloat(){
        if(this.float){
            return `slds-float_${this.float}`;
        }
        return '';
    }

    get hasMargin(){
        if(this.margin){
            return `slds-var-m-${this.position}_${this.margin}`;
        }
        return '';
    }
    handleClick(event){
        this.refreshButtonClass = 'animation: rotate 0.4s;';
        this.refBtnVarient = 'inverse';
        this._refBtnClass = `slds-button slds-button_icon slds-button_icon-border-filled ${this.hasMargin} ${this.hasFloat} slds-is-selected`;
        setTimeout(() => { 
            this.refreshButtonClass = '';
            this.refBtnVarient = '';
            this._refBtnClass = `slds-button slds-button_icon slds-button_icon-border-filled ${this.hasMargin} ${this.hasFloat}`; 
        }, 500);
    }

}