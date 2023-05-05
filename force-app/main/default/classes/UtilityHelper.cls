public with sharing class UtilityHelper {
    
    @auraEnabled(cacheable=false)
    public static void updateUserTablePreference(String cmpName, String preference){
        User_Interface_Settings__c usrPref = User_Interface_Settings__c.getInstance(UserInfo.getUserId());
        usrPref.put(cmpName, preference);
        upsert usrPref;
    }
}