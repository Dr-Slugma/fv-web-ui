package ca.firstvoices.property_readers;

import ca.firstvoices.utils.ExportColumnRecord;
import org.nuxeo.ecm.core.api.DocumentModel;

import java.util.ArrayList;
import java.util.List;

public class FV_BooleanPropertyReader extends FV_AbstractPropertyReader
{
    public FV_BooleanPropertyReader( ExportColumnRecord spec )
    {
        super( spec );
    }

    public List<FV_PropertyValueWithColumnName> readPropertyFromObject(Object o)
    {
        DocumentModel word = (DocumentModel)o;
        List<FV_PropertyValueWithColumnName> readValues = new ArrayList<>();
        Boolean prop = (Boolean)word.getPropertyValue(propertyToRead);

        if( prop == null )
        {
            prop = false;
        }

        String propertyValue = prop ? "true" : "false";

        readValues.add(new FV_PropertyValueWithColumnName(propertyValue, columnNameForOutput));

        return readValues;
    }
}
