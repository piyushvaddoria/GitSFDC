import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

const pageRefObj = {
    type: "",
    attributes: {}
}

const pageLocationURLMap = {
    "home":"standard__objectPage",
    "url":"standard__webPage",
    "list":"standard__objectPage",
    "tab":"standard__navItemPage",
    "page":"standard__namedPage",
    "cmp":"standard__component",
    "app":"standard__app",
    "record":"standard__recordPage"
}

const JSVOID = 'javascript:void(0);';

export default class Hyperlink extends NavigationMixin(LightningElement) {

    @api url;
    @api target = '_self';
    @api objectNameOrPageUrl;
    /**
     * @description allow hyperlink default redirect
     */
    @api allowRedirect = false;
    @api label;
    @api listViewName;
    @api redirectLocation;
    @api recordId;
    @api eventName;
    @api styleClass;
    @api title;
    @api allowRegen = false;
    /**
     * @property {Boolean} reGenerateLink 
     * @description To fix component render worng link on record issue. When used with data table search enabled, component was showing wrong link
     */
    reGenerateLink = false;   
    @api showAsText;
    pageRef;

    connectedCallback(){
        this.doInit();    
    }

    disconnectedCallback(){
        this.url = undefined;
        this.objectNameOrPageUrl = undefined;
        this.recordId = undefined;
        this.redirectLocation = undefined;
        this.eventName = undefined;
    }

    get isLink(){
        return this.url != JSVOID && this.recordId != JSVOID;
    }

    get showAsText(){
        return this.redirectLocation != 'event' && (!this.isLink || !this.url);
    }

    doInit(){
        // console.log('doInit', this.isLink);
        if(this.redirectLocation == 'event' || this.redirectLocation == undefined || this.redirectLocation == '' ||  this.redirectLocation == 'link'){
            return;
        }

        if(this.recordId == JSVOID || this.redirectLocation == JSVOID){
            this.url = JSVOID;
            this.allowRedirect = true;
            return;
        }

        // Generating page reference
        this.pageRef = {...pageRefObj};
        this.pageRef.type = pageLocationURLMap[this.redirectLocation];

        switch (this.redirectLocation) {
            case 'home':
                this.pageRef.attributes = {
                    objectApiName : this.objectNameOrPageUrl,
                    actionName : this.redirectLocation
                };
                break;
            case 'url':
                this.pageRef.attributes = {
                    url : this.objectNameOrPageUrl,
                };
                break;
            case 'list':
                this.pageRef.attributes = {
                    objectApiName: this.objectNameOrPageUrl,
                    actionName: this.redirectLocation
                };
                this.pageRef.state = {
                    filterName: this.listViewName
                };
                break;
            case 'tab':
                this.pageRef.attributes = {
                    apiName: this.objectNameOrPageUrl
                };
                break;
            case 'page':
                this.pageRef.attributes = {
                    pageName: this.objectNameOrPageUrl
                };
                break;
            case 'cmp':
                this.pageRef.attributes = {
                    componentName: 'c__'+this.objectNameOrPageUrl
                };
                this.pageRef.state = {
                    c__can: true
                };
                break;
            case 'app':
                this.pageRef.attributes = {
                    appTarget: 'c__'+this.objectNameOrPageUrl
                };
                break;
            case 'record':
                this.pageRef.attributes = {
                    recordId: this.recordId,
                    objectApiName: this.objectNameOrPageUrl,
                    actionName: 'view'
                };
                break;
            default:
                break;
        }
        
        // Generating URL from pagereference 
        this[NavigationMixin.GenerateUrl](this.pageRef).then(url =>  {
            this.url = url;
            setTimeout(() => {
                this.reGenerateLink = true;
            },200);
        });

    }

    redirect(event){
        if(this.allowRedirect){
            return;
        }
        // Stop the event's default behavior.
        // Stop the event from bubbling up in the DOM.
        event.preventDefault();
        event.stopPropagation();

        // To handle message channel event/browser message service event
        if(this.redirectLocation == 'event'){
            const evt = new CustomEvent('click', {
                detail : {
                    eventName:this.eventName
                }
            });
            this.dispatchEvent(evt);
        }
        else {
            this[NavigationMixin.Navigate](this.pageRef);
        }
        this.minimize();
    }

    minimize(){
        const minize = new CustomEvent('minimizeutility');
        // Fire the custom event to minimze utility bar popup
        this.dispatchEvent(minize);
    }


    renderedCallback(){
        // To fix component render worng link on record issue. When used with data table search enabled, component was showing wrong link
        if(this.reGenerateLink && this.allowRegen){
            this.doInit();
            this.reGenerateLink = false;
        }
    }

}