package com.enonic.xp.sample.features.site;

import com.enonic.xp.data.Property;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.form.Input;
import com.enonic.xp.form.InputVisitor;
import com.enonic.xp.inputtype.InputTypeResolver;
import com.enonic.xp.inputtype.InputTypeValidationException;

final class InputValidationVisitor
    extends InputVisitor
{
    private final PropertyTree propertyTree;

    private final InputTypeResolver inputTypeResolver;

    InputValidationVisitor( final PropertyTree propertyTree, final InputTypeResolver inputTypeResolver )
    {
        this.propertyTree = propertyTree;
        this.inputTypeResolver = inputTypeResolver;
    }

    @Override
    public void visit( final Input input )
    {
        InputVisitorHelper.visitProperties( input, propertyTree,
                                                                          property -> checkValidity( input, property ) );
    }

    private void checkValidity( final Input input, final Property property )
    {
        if ( property == null )
        {
            return;
        }

        if ( input.getName().equals( "backgroundColor" ) )
        {
            if ( !property.getValue().asString().equals( "blue" ) )
            {
                throw new InputTypeValidationException( "Invalid background color: " + property.getValue().asString(), property.getPath() );
            }
        }
    }
}
