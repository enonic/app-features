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
import com.enonic.xp.data.ValueType;
import com.enonic.xp.data.ValueTypes;
import com.enonic.xp.schema.content.ContentTypeName;

@Component
public class LongValidator
    implements ContentValidator
{
    private static final ApplicationKey APP_KEY = ApplicationKey.from( "com.enonic.app.features" );

    private static final ContentTypeName SUPPORTED_TYPE = ContentTypeName.from( APP_KEY, "long" );

    @Override
    public boolean supports( ContentTypeName contentType )
    {
        return contentType.equals( SUPPORTED_TYPE );
    }

    @Override
    public void validate( ContentValidatorParams params, ValidationErrors.Builder builder )
    {
        params.getData().getProperties().forEach( ( property ) -> {
            if ( property.hasNotNullValue() && property.getValue().getType().equals( ValueTypes.LONG ) && property.getValue().asLong() < 5 )
            {
                builder.add( ValidationError.dataError( ValidationErrorCode.from( APP_KEY, "long_invalid" ), property.getPath() ).message(
                    "Long is < 5" ).build() );
            }
        } );
    }
}
