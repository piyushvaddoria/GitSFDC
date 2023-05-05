import LightningDatatable from 'lightning/datatable';
import customURLRowTemplate from './customURLRow';
import customRichTextOutputTemplate from './customRichText';
import customCurrencyOutputTemplate from './customCurrency';

export default class CustomLightningDatatable extends LightningDatatable {
    
    static customTypes = {
        customURLRow: {
            template: customURLRowTemplate,
            standardCellLayout: true,
            typeAttributes: ['class','label','tooltip','target','objecttype','recordid','loction','allowRedirect']
        },
        customRichText: {
            template: customRichTextOutputTemplate,
            standardCellLayout: true
        },
        customCurrency: {
            template: customCurrencyOutputTemplate,
            standardCellLayout: true,
            typeAttributes: ['class']
        }
    }
}