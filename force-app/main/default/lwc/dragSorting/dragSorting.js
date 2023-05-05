import { LightningElement, api, track } from 'lwc';
import updateUserTablePreference from '@salesforce/apex/UtilityHelper.updateUserTablePreference';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import sortable from '@salesforce/resourceUrl/sortable';

export default class DragSorting extends LightningElement {
    
    @api columnList;
    @api allColumnList;
    @api userPrefFieldName;
    @track columnsPref = [];
    customCSSAdded = false;

    /**
     * @description Initializing sorting order column buttons 
     */
    connectedCallback(){
        this.columnsPref = [];
        // List of all selected column buttons
        this.columnsPref = Array.from(this.columnList).map( col => { return {label:col, isSelected:true,variant:"success"} } );
        // adding all unselected column buttons
        this.allColumnList
        .filter(col => !this.columnList.includes(col))
        .map( col => this.columnsPref = [...this.columnsPref,{label:col,isSelected:false,variant:"neutral"}]);

        // Loading Sorting JS script
        this.loadSortingScript();
    }

    renderedCallback(){
        // Injecting custom CSS to set lightning button width
        if (!this.customCSSAdded){
            this.injectCustomCSS();
        }
    }

    /**
     * @description Loading sorting JS script
     */
    loadSortingScript(){
        Promise.all([
            loadScript(this, sortable + '/Sortable.min.js')
        ])
        .then(() => {
            this.initSorting(); // Initializing drag drop of sorting JS after script is loaded
            this.scriptLoaded = true;
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Sortable',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
    }

    /**
     * @description Initializing drag drop of sorting JS after script is loaded
     */
    initSorting(){
        let ul = this.template.querySelector('.items');
        // Initializing sorting JS on button elements
        new Sortable(ul, {
            ghostClass: 'drag-sort-active',
            swapThreshold: 0.75,
        });    
    }

    /**
     * @description Reseting column visiblity and sorting order
     */
    resetDefault(){
        this.saveSettings(this.allColumnList);
    }

    /**
     * @description removing button highlight after element is droped
     * @param {*} item 
     */
    handleDrop(item) {
        item.target.classList.remove('drag-sort-active');
    }

    /**
     * @description Handling clicks of button, toggleing the selection and button colors
     * @param {} event 
     */
    handleSelection(event){
        const checked = Array.from(
            this.template.querySelectorAll('.container lightning-button-stateful')
        )
        // Filter down to checked items
        .filter(element => element.selected);

        if(checked.length > 1 || (checked.length == 1 && !event.target.selected)){
            this.columnsPref.filter(col => col.label == event.target.name).forEach(col => {
                col.isSelected = !col.isSelected;
                col.variant = col.isSelected ? 'success' : 'neutral';
                return col;
            });
        }
    }
    
    close(){
        this.dispatchEvent(new CustomEvent('setupclose'));
    }

    /**
     * @description building array of all selected columns in correct order
     */
    done(){
        const checked = Array.from(
            this.template.querySelectorAll('.container lightning-button-stateful')
        )
        // Filter down to checked items
        .filter(element => element.selected)
        // Map checked items to their labels
        .map(element => element.name);

        this.saveSettings(checked);
    }

    /**
     * @description Storing the User prefrence in custom setting via Apex
     * @param {Array} colList 
     */
    saveSettings(colList){
        updateUserTablePreference({
            cmpName: this.userPrefFieldName,
            preference: colList.join()
        }).then(() => {
            // Reloading the window to refrelct the changes in datatable
            window.location.reload();
        }).catch( error => {
            // console.log(JSON.stringify(error));
            this.dispatchEvent(
                new ShowToastEvent({
                    'title': error.body.exceptionType,
                    'message': error.body.message,
                    'variant': 'error'
                })
            );
            this.load = false;
        });

        let evt = new CustomEvent('save', { detail : colList});
        this.dispatchEvent(evt);
    }

    // Custom CSS Injection in HTML
    injectCustomCSS(){
        this.customCSSAdded = true;
        const style = document.createElement('style');
        style.innerText = ` c-drag-sorting .container lightning-button-stateful button {min-width:160px;}`;
        this.template.querySelector('.custom-css').appendChild(style);            
    }



}