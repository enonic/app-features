package com.enonic.xp.sample.features;

import java.util.Locale;
import java.util.Set;
import java.util.zip.ZipInputStream;

import org.osgi.service.component.annotations.Component;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.attachment.CreateAttachment;
import com.enonic.xp.content.ContentValidator;
import com.enonic.xp.content.ContentValidatorParams;
import com.enonic.xp.content.ValidationError;
import com.enonic.xp.content.ValidationErrorCode;
import com.enonic.xp.content.ValidationErrors;
import com.enonic.xp.data.Property;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.schema.content.ContentTypeName;

@Component
public class CustomValidator
    implements ContentValidator
{
    private static final ApplicationKey APP_KEY = ApplicationKey.from( "com.enonic.app.features" );

    private static final ContentTypeName SUPPORTED_TYPE = ContentTypeName.from( APP_KEY, "custom-validator" );

    private static final Set<String> ALLOWED_COLORS = Set.of( "red", "green", "blue" );

    @Override
    public boolean supports( ContentTypeName contentType )
    {
        return contentType.equals( SUPPORTED_TYPE );
    }

    @Override
    public void validate( ContentValidatorParams params, ValidationErrors.Builder builder )
    {
        validateColors( params, builder );
        validateFile( params, builder );
    }

    private void validateColors( ContentValidatorParams params, ValidationErrors.Builder builder )
    {
        for ( PropertySet choice : params.getData().getSets( "choice" ) )
        {
            final PropertySet color = choice == null || !"color".equals( choice.getString( "_selected" ) ) ? null : choice.getSet( "color" );
            final Property value = color == null ? null : color.getProperty( "value" );
            final String text = value == null ? null : value.getString();

            if ( text != null && !text.isBlank() && !ALLOWED_COLORS.contains( text.trim().toLowerCase( Locale.ROOT ) ) )
            {
                builder.add( ValidationError.dataError( ValidationErrorCode.from( APP_KEY, "color_invalid" ), value.getPath() )
                                 .message( "Colour \"{0}\" is not allowed. Use red, green or blue" )
                                 .i18n( "features.color_invalid" )
                                 .args( text )
                                 .build() );
            }
        }
    }

    private void validateFile( ContentValidatorParams params, ValidationErrors.Builder builder )
    {
        if ( !params.getCreateAttachments().isEmpty() )
        {
            final CreateAttachment createAttachment = params.getCreateAttachments().iterator().next();

            final boolean valid;
            try (final ZipInputStream zipInputStream = new ZipInputStream( createAttachment.getByteSource().openBufferedStream() ))
            {
                valid = zipInputStream.getNextEntry() != null;
            }
            catch ( Exception e )
            {
                builder.add( ValidationError.attachmentError( ValidationErrorCode.from( APP_KEY, "zip_invalid" ),
                                                              createAttachment.getBinaryReference() )
                                 .message( "Cannot read zip file {0}" )
                                 .i18n( "features.zip_invalid.cannot_read" )
                                 .args( createAttachment.getBinaryReference() )
                                 .build() );
                return;
            }
            if ( !valid )
            {
                builder.add( ValidationError.attachmentError( ValidationErrorCode.from( APP_KEY, "zip_invalid" ),
                                                              createAttachment.getBinaryReference() )
                                 .message( "Zip file {0} is invalid" )
                                 .i18n( "features.zip_invalid.invalid" )
                                 .args( createAttachment.getBinaryReference() )
                                 .build() );
            }
        }
    }
}
