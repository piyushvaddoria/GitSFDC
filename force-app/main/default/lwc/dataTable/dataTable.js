import { LightningElement,api,wire } from 'lwc';
import {sortData, search} from 'c/dataTableUtility';
import Id from '@salesforce/user/Id';
import Locale_FIELD from '@salesforce/schema/User.LocaleSidKey';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

const fields = [Locale_FIELD];
export default class DataTable extends LightningElement {
    userId = Id;
    _header;
    @api headerIcon;
    _recordList; // data list
    @api columns;  // colums list
    @api isLoad;
    @api fieldsToSearch; // Field to be used for search
    @api fieldMapping; // Mapping of field used for substitues field used for label e.g.(Date String => Date field)
    @api dateFields; // List of date fields 
    @api maxHeight = '350px'; // Data-table max height variable
    @api hideCount = false;
    @api maxRowSelection = 99999999;
    sortedBy;
    sortedDirection;
    staticRecordList;
    @api hideCheckboxColumn = false;
    @api showReloadIcon = false;
    
    @api
    set header(value){
        this._header = value;
    }

    renderConfig = {
        virtualize: 'vertical',
        // additional customization
    };
    
    /**
     * @description header for table
     */
    get header(){
        if(this.hideCount){
            return this._header;
        }
        let appCount = this.recordList ? this.recordList.length : 0;
        return this._header + ` (${appCount})`;
    }
    /**
     * @description record list get variable
     */
    get recordList(){
        return this._recordList;
    }

    /**
     * @description Indicate component to show no records to dispaly messahe in table when there is no data.
     */
    get isEmpty(){
        return !this._recordList || this._recordList.length == 0;
    }

    /**
     * @api
     * @description Api enable record list function to pass table data
     */
    @api 
    set recordList(data){
        if(data){
            this._recordList = [...data];
            this.staticRecordList = [...this._recordList];
        }
    }

    /**
     * @description wire method to get user data
     */
    @wire(getRecord, { recordId: '$userId',  fields})
    user;

    get userLocale() {
        return getFieldValue(this.user.data, Locale_FIELD);
    }

    // Function to update data based on sort order
    updateColumnSorting(event) {
        // assign the latest attribute with the sorted column fieldName and sorted direction
        try{
            this.sortedBy = event.detail.fieldName;
            this.sortedDirection = event.detail.sortDirection;
            this._recordList = sortData(this._recordList, this.sortedBy, this.sortedDirection, this.fieldMapping);
        } catch (err){
            console.log('error on sort : '+JSON.stringify(err));
        }
    }

    // function used to filter data based on search query
    search(event) {
        // this.isLoad = true;
        // console.log('search');
        let toSearch = event.target.value?.toLowerCase(); 
        if(!toSearch){
            this.searchKeyword = undefined;
        }
        else if(this.searchKeyword && toSearch == this.searchKeyword) {
            this.isLoad = false;
            return; 
        }
        
        // const isEnterKey = event.keyCode === 13;
        // if (isEnterKey || event.type == "blur") {
        //     // console.log('searching', this.searchKeyword);
        //     this.doSearch(toSearch);
        // }
        
        this.handleSeachKeyChangeDebounced(toSearch);
        // this.isLoad = false;
    }

    doSearch(toSearch){
        
        if(!this.searchKeyword){
            this.searchKeyword = toSearch;
        }
        let keywords = toSearch.split(' ');
        let subresult = [];
        
        for(let i = 0; i < keywords.length; i++){
            let word = keywords[i];
            if(i > 0)
                subresult = search(word, subresult, this.fieldsToSearch, this.userLocale, this.dateFields);
            else
                subresult = search(word, this.staticRecordList, this.fieldsToSearch, this.userLocale, this.dateFields);
        }
        
        this._recordList = [...subresult];
        this.recordCount = this.recordList.length;
        this.searchKeyword = toSearch;
    }

    doneTypingInterval = 500;
    typingTimer;
    handleSeachKeyChangeDebounced(toSearch){
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {    
            this.doSearch(toSearch);
        }, this.doneTypingInterval);
    }

    /**
     * @description to inject custom css in html when component loads
     */
    customCSSAdded = false;
    renderedCallback(){
        if (!this.customCSSAdded && !this.isLoad){
            this.injectCustomCSS();
        }
    }
    /**
     * @description Function to inject custom CSS in HTML
     */
    injectCustomCSS(){
        this.customCSSAdded = true;
        let tableId = this.template.querySelector('c-extended-lightning-datatable').id;
        const style = document.createElement('style');
        style.innerText = ` c-data-table #${tableId} .slds-scrollable_y {max-height:${this.maxHeight}}`;
        this.template.querySelector('.custom-css').appendChild(style);            
    }

    handleRowAction(event){
        this.dispatchEvent(new CustomEvent('rowaction', { detail : event.detail}));
    }

    handleRowselection(event){
        this.dispatchEvent(new CustomEvent('rowselection', { detail : event.detail}));
    }

    @api
    getSelectedRows(){
        return this.template.querySelector('c-extended-lightning-datatable').getSelectedRows();
    }

    @api
    clearSearch(){
        this.searchKeyword = undefined;
    }
}