package com.enonic.xp.sample.features;

import java.util.zip.ZipInputStream;

import org.osgi.service.component.annotations.Component;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.attachment.CreateAttachment;
import com.enonic.xp.content.ContentValidator;
import com.enonic.xp.content.ContentValidatorParams;
import com.enonic.xp.content.ValidationError;
import com.enonic.xp.content.ValidationErrorCode;
import com.enonic.xp.content.ValidationErrors;
import com.enonic.xp.schema.content.ContentTypeName;

@Component
public class ZipValidator
    implements ContentValidator
{
    private static final ApplicationKey APP_KEY = ApplicationKey.from( "com.enonic.app.features" );

    private static final ContentTypeName SUPPORTED_TYPE = ContentTypeName.from( APP_KEY, "zip" );

    @Override
    public boolean supports( ContentTypeName contentType )
    {
        return contentType.equals( SUPPORTED_TYPE );
    }

    @Override
    public void validate( ContentValidatorParams params, ValidationErrors.Builder builder )
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
