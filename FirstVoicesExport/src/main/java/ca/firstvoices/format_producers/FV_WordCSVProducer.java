package ca.firstvoices.format_producers;

/*
    Producer assembling output formatted as CSV.
*/

import ca.firstvoices.property_readers.*;
import ca.firstvoices.utils.*;
import org.nuxeo.ecm.automation.core.util.StringList;

import java.io.FileWriter;
import java.io.IOException;

import java.util.List;

import static ca.firstvoices.utils.FVExportConstants.CSV_FORMAT;

public class FV_WordCSVProducer extends FV_AbstractProducer
{
    protected FV_SimpleCSVWriter csvWriter;

    public FV_WordCSVProducer(String fileName, StringList columns )
    {
        super( new FV_WordExportCSVColumns() );

        try
        {
            addReaders( spec, columns );

            if( createTemporaryOutputFile( fileName, CSV_FORMAT ) )
            {
                csvWriter = new FV_SimpleCSVWriter(new FileWriter(outputFile));
            }
            else
            {
                throw new IOException( "FV_WordCSVProducer: error creating temporary file for export of " + fileName );
            }
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    }

    protected void writeLine( List<String> outputLine )
    {
        try
        {
            csvWriter.writeNext(outputLine );

            csvWriter.flush();
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    }

    protected void endProduction()
    {
        try
        {
            csvWriter.close();
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
    }

    protected void createDefaultPropertyReaders()
    {

        propertyReaders.add( new FV_PropertyReader(              spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.TITLE) ) );
        propertyReaders.add( new FV_PartOfSpeechPropertyReader(  spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.PART_OF_SPEECH_ID )));
        propertyReaders.add( new FV_PropertyReader(              spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.PHONETIC_INFO )));
        propertyReaders.add( new FV_WordTranslationReader(       spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.DOMINANT_LANGUAGE_DEFINITION )));
        propertyReaders.add( new FV_WordTranslationReader(       spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.LITERAL_TRANSLATION )));
        propertyReaders.add( new FV_CategoryPropertyReader(      spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.REALTED_PHRASE )));
        propertyReaders.add( new FV_SimpleListPropertyReader(    spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.CULTURAL_NOTE )));
        propertyReaders.add( new FV_CategoryPropertyReader(      spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.CATEGORIES )));
        propertyReaders.add( new FV_PropertyReader(              spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.REFERENCE )));
        propertyReaders.add( new FV_BooleanPropertyReader(       spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.AVAILABLE_IN_CHILDRENS_ARCHIVE )));
        propertyReaders.add( new FV_BooleanPropertyReader(       spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.AVAILABLE_IN_GAMES )));
        propertyReaders.add( new FV_PropertyReader(              spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.ASSIGNED_USR_ID )));
        propertyReaders.add( new FV_PropertyReader(              spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.WORD_STATUS )));
        propertyReaders.add( new FV_SimpleListPropertyReader(    spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.CONTRIBUTOR )));
        propertyReaders.add( new FV_PropertyReader(              spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.CHANGE_DTTM )));

        //propertyReaders.add( new FV_CompoundPropertyReader(      spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.IMAGE ) ) );
        //propertyReaders.add( new FV_CompoundPropertyReader( spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.AUDIO ) ) );
        //propertyReaders.add( new FV_CompoundPropertyReader( spec.getColumnExportRecord( FVExportConstants.ExportCSVLabels.VIDEO ) ) );
    }
}
